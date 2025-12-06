import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export default function ProjectProfitabilityBar({ data }) {
  return (
    <div className="h-36">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
