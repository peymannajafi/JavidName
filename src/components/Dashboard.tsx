import React, { useMemo } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";
import { Victim } from "../types";
import { format, parseISO } from "date-fns";

interface DashboardProps {
  victims: Victim[];
}

export const Dashboard: React.FC<DashboardProps> = ({ victims }) => {
  const timelineData = useMemo(() => {
    const counts: Record<string, number> = {};
    victims.forEach(v => {
      if (v.date) {
        const d = format(parseISO(v.date), "yyyy-MM-dd");
        counts[d] = (counts[d] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [victims]);

  const statusData = useMemo(() => {
    const verified = victims.filter(v => v.status === "Verified").length;
    const unverified = victims.length - verified;
    return [
      { name: "Verified", value: verified, color: "#10b981" },
      { name: "Unverified", value: unverified, color: "#C5A028" }
    ];
  }, [victims]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
      <div className="lg:col-span-2 bg-midnight-light/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">Timeline of Documentation</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#ffffff40" 
                fontSize={10} 
                tickFormatter={(str) => format(parseISO(str), "MMM d")}
              />
              <YAxis stroke="#ffffff40" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#002140", border: "1px solid #C5A028", borderRadius: "8px" }}
                itemStyle={{ color: "#FFD700" }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#C5A028" 
                strokeWidth={3} 
                dot={{ fill: "#C5A028", r: 4 }}
                activeDot={{ r: 6, stroke: "#FFD700", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-midnight-light/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">Verification Distribution</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} />
              <YAxis stroke="#ffffff40" fontSize={10} />
              <Tooltip 
                cursor={{ fill: "#ffffff05" }}
                contentStyle={{ backgroundColor: "#002140", border: "1px solid #C5A028", borderRadius: "8px" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
