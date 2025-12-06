import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, } from "recharts";

export default function ProfitLine({ data }) {
  return (
    <div className="h-36 sm:h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="m" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={28} />
          <Tooltip />
          <Line type="monotone" dataKey="value" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
