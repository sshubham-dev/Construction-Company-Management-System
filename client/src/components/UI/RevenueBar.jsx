import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function RevenueBar({ data }) {
  return (
    <div className="h-40 sm:h-44">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={14}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="m" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={32} />
          <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
