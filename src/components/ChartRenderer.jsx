import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

// ─── 1Finance gold palette for charts ────────────────────────────────────
const CHART_COLORS = [
  "#4A90D9", "#2E9E5B", "#E8843A", "#B59AE8", "#E24B4A", "#1DB8A8",
  "#F5C542", "#D45D9B", "#5BC4F5", "#8BC34A", "#FF7043", "#7C4DFF",
  "#26C6DA", "#FFA726", "#AB47BC", "#66BB6A", "#EF5350", "#42A5F5",
];

// ─── Custom tooltip ───────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#1A1A1A",
        border: "1px solid #2A2A2A",
        borderRadius: "10px",
        padding: "10px 14px",
        fontSize: "12px",
        color: "#CCC",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
      }}
    >
      {label && <p style={{ color: "#C9A84C", fontWeight: 600, marginBottom: 4 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: "#AAA" }}>
          <span style={{ color: p.fill || "#C9A84C" }}>● </span>
          {p.name}: <span style={{ color: "#EEE", fontWeight: 500 }}>
            {typeof p.value === "number" ? p.value.toLocaleString("en-IN") : p.value}
          </span>
        </p>
      ))}
    </div>
  );
};

// ─── Custom pie label ─────────────────────────────────────────────────────
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) => {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#0A0A0A" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function ChartRenderer({ chartData }) {
  if (!chartData || !chartData.data?.length) return null;
  const { type, data, title } = chartData;

  return (
    <div
      style={{
        background: "#141414",
        border: "1px solid #2A2A2A",
        borderRadius: "14px",
        padding: "16px",
        marginTop: "10px",
      }}
    >
      {title && (
        <p
          style={{
            color: "#CCCCCC",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "14px",
          }}
        >
          {title}
        </p>
      )}

      <ResponsiveContainer width="100%" height={200}>
        {type === "bar" ? (
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "#666", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#555", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(201,168,76,0.06)" }} />
            <Bar dataKey="value" radius={[5, 5, 0, 0]} minPointSize={4}>
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        ) : type === "pie" ? (
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={82}
              labelLine={false}
              label={renderPieLabel}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span style={{ color: "#888", fontSize: 11 }}>{value}</span>
              )}
            />
          </PieChart>
        ) : (
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "#666", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#555", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#C9A84C"
              strokeWidth={2.5}
              dot={{ fill: "#C9A84C", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#E2C97E" }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
