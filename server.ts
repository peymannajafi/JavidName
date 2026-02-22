import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Fuse from "fuse.js";
import Papa from "papaparse";
import multer from "multer";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Database
const db = new Database("memorial.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS manual_verifications (
    victim_name TEXT PRIMARY KEY,
    status TEXT,
    verified_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.cwd());
  },
  filename: (req, file, cb) => {
    // Force specific filenames expected by the app
    if (file.originalname.endsWith(".csv")) {
      cb(null, "government_data.csv");
    } else if (file.originalname.endsWith(".json")) {
      cb(null, "result.json");
    } else {
      cb(null, file.originalname);
    }
  },
});

const upload = multer({ storage });

// --- FORENSIC PERSIAN NORMALIZATION ---
// This ensures "احد ابراهیمیپور" matches "احد ابراهیمی پور" 
const normalizePersian = (text: string) => {
    if (!text) return "";
    return text
        .replace(/ي/g, "ی").replace(/ك/g, "ک") // Standardize Ye and Kaf
        .replace(/\u200c/g, " ")               // Replace ZWNJ with standard space
        .replace(/[،؛؟!.()<>_+\-=]/g, "")      // Remove specific punctuation
        .replace(/\s+/g, " ")                  // Collapse multiple spaces
        .trim();
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  // Cache for processed victims
  let processedVictimsCache: any = null;
  let cacheTimestamp: number = 0;
  const CACHE_TTL = 30000; // 30 seconds

  const clearCache = () => {
    processedVictimsCache = null;
  };

  // Serve photos directory if it exists
  const photosPath = path.join(process.cwd(), "photos");
  if (fs.existsSync(photosPath)) {
    app.use("/photos", express.static(photosPath));
  }

  // Mock Data Generation if files don't exist
  const MOCK_GOV_DATA = [
    { "نام نام خانوادگی": "مهسا امینی" },
    { "نام نام خانوادگی": "کیان پیرفلک" },
    { "نام نام خانوادگی": "حمیدرضا روحی" },
    { "نام نام خانوادگی": "نیکا شاکرمی" },
    { "نام نام خانوادگی": "سارینا اسماعیل‌زاده" },
    { "نام نام خانوادگی": "خدانور لجه‌ای" },
  ];

  const MOCK_PEOPLE_DATA = {
    messages: [
      { text: "1. مهسا امینی\nتاریخ: 2022-09-16", date: "2022-09-16T10:00:00", photo: "photo1.jpg" },
      { text: "2. کیان پیرفلک\nتاریخ: 2022-11-16", date: "2022-11-16T18:00:00", photo: "photo2.jpg" },
      { text: "3. حمیدرضا روحی\nتاریخ: 2022-11-17", date: "2022-11-17T20:00:00", photo: "photo3.jpg" },
      { text: "4. نیکا شاکرمی\nتاریخ: 2022-09-20", date: "2022-09-20T12:00:00", photo: "photo4.jpg" },
      { text: "5. سارینا اسماعیل‌زاده\nتاریخ: 2022-09-23", date: "2022-09-23T15:00:00", photo: "photo5.jpg" },
      { text: "6. خدانور لجه‌ای\nتاریخ: 2022-10-01", date: "2022-10-01T09:00:00", photo: "photo6.jpg" },
      { text: "7. نام نامشخص\nتاریخ: 2022-10-05", date: "2022-10-05T11:00:00", photo: "photo7.jpg" },
    ]
  };

  app.get("/api/victims", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const govPath = path.join(process.cwd(), "government_data.csv");
      const jsonPath = path.join(process.cwd(), "result.json");
      
      const hasGovData = fs.existsSync(govPath);
      const hasTgData = fs.existsSync(jsonPath);

      let govNames: string[] = [];
      if (hasGovData) {
        const csvFile = fs.readFileSync(govPath, "utf8");
        const results = Papa.parse(csvFile, { header: true });
        govNames = results.data.map((row: any) => row["نام نام خانوادگی"]).filter(Boolean);
      } else {
        govNames = MOCK_GOV_DATA.map(d => d["نام نام خانوادگی"]);
      }

      const govRecords = govNames.map(name => ({
        original: name,
        normalized: normalizePersian(name)
      }));

      const fuse = new Fuse(govRecords, { 
        keys: ["normalized"], 
        threshold: 0.5, 
        includeScore: true 
      });

      let tgData: any;
      if (hasTgData) {
        tgData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      } else {
        tgData = MOCK_PEOPLE_DATA;
      }

      const allVictims: any[] = [];
      const tgPattern = /^[\d\u06F0-\u06F9]+\.\s*(.*?)\n/;

      const manualVers = db.prepare("SELECT * FROM manual_verifications").all() as any[];
      const verMap = new Map(manualVers.map(v => [v.victim_name, v.status]));

      const messages = tgData.messages || [];
      
      for (const msg of messages) {
        let text = "";
        if (Array.isArray(msg.text)) {
          text = msg.text.map((t: any) => (typeof t === "string" ? t : t.text)).join("");
        } else {
          text = msg.text || "";
        }

        const match = text.match(tgPattern);
        if (match) {
          const rawName = match[1].trim();
          const normName = normalizePersian(rawName);
          
          const search = fuse.search(normName);
          const bestResult = search[0];
          const score = bestResult ? Math.round((1 - bestResult.score!) * 100) : 0;
          const autoStatus = (bestResult && bestResult.score! < 0.1) ? "Verified" : "Unverified";

          let photoUrl = `https://picsum.photos/seed/${rawName}/300/350`;
          if (msg.photo) {
            const photoFilename = path.basename(msg.photo);
            const localPhotoPath = path.join(process.cwd(), "photos", photoFilename);
            if (fs.existsSync(localPhotoPath)) {
              photoUrl = `/photos/${photoFilename}`;
            }
          }

          allVictims.push({
            id: msg.id || Math.random().toString(36).substr(2, 9),
            name: rawName,
            score: score,
            govMatch: bestResult ? bestResult.item.original : "No Match",
            status: autoStatus,
            manualStatus: verMap.get(rawName) || null,
            photo: photoUrl,
            date: msg.date ? new Date(msg.date).toISOString() : null,
          });
        }
      }

      const total = allVictims.length;
      const paginatedVictims = allVictims.slice(skip, skip + limit);

      res.json({
        victims: paginatedVictims,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        govTotal: govNames.length,
        source: {
          government: hasGovData ? "Real (government_data.csv)" : "Mock Data",
          telegram: hasTgData ? "Real (result.json)" : "Mock Data"
        }
      });
    } catch (error) {
      console.error("Error processing data:", error);
      res.status(500).json({ error: "Failed to process data" });
    }
  });

  app.post("/api/verify", (req, res) => {
    const { name, status } = req.body;
    if (!name || !status) return res.status(400).json({ error: "Missing name or status" });

    try {
      db.prepare("INSERT OR REPLACE INTO manual_verifications (victim_name, status) VALUES (?, ?)")
        .run(name, status);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    clearCache();
    res.json({ message: "File uploaded successfully", filename: req.file.filename });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
