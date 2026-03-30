import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

const card = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
};

const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};

export default function NutritionTrendDashboard({ days }) {
  const { hydrationAvg, topHydrationDay, avgCalories, totalMeals, labels, hydrationValues, calorieValues } = useMemo(() => {
    const hydrationTotal = days.reduce((sum, day) => sum + day.hydration, 0);
    const calorieDays = days.filter(day => day.calories > 0);
    const topHydration = [...days].sort((a, b) => b.hydration - a.hydration)[0];
    return {
      hydrationAvg: Math.round(hydrationTotal / Math.max(days.length, 1)),
      topHydrationDay: topHydration,
      avgCalories: calorieDays.length ? Math.round(calorieDays.reduce((sum, day) => sum + day.calories, 0) / calorieDays.length) : 0,
      totalMeals: days.reduce((sum, day) => sum + day.meals, 0),
      labels: days.map(day => day.label),
      hydrationValues: days.map(day => day.hydration),
      calorieValues: days.map(day => day.calories),
    };
  }, [days]);

  const hydrationData = {
    labels,
    datasets: [{
      label: "Hydration (ml)",
      data: hydrationValues,
      backgroundColor: "rgba(122, 158, 142, 0.75)",
      borderRadius: 12,
      maxBarThickness: 26,
    }],
  };

  const calorieData = {
    labels,
    datasets: [{
      label: "Calories",
      data: calorieValues,
      borderColor: "rgba(196, 132, 154, 1)",
      backgroundColor: "rgba(196, 132, 154, 0.14)",
      pointBackgroundColor: "rgba(196, 132, 154, 1)",
      pointBorderColor: "#fff",
      pointRadius: 4,
      tension: 0.35,
      fill: true,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(42,32,53,0.92)",
        titleColor: "#fff",
        bodyColor: "#fff",
        cornerRadius: 12,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#8A7E88", font: { size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { color: "rgba(237,232,228,0.8)" },
        ticks: { color: "#8A7E88", font: { size: 11 } },
        border: { display: false },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="rounded-[24px] p-5 space-y-5" style={card}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p style={sLabel} className="mb-1.5">7-Day Trends</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
            A clearer view of your hydration and food logging rhythm this week.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Avg hydration" value={`${hydrationAvg} ml`} />
        <SummaryCard label="Best hydration day" value={topHydrationDay?.label || "—"} />
        <SummaryCard label="Avg calories" value={avgCalories ? `${avgCalories}` : "No data"} />
        <SummaryCard label="Meals logged" value={`${totalMeals}`} />
      </div>

      <div className="space-y-5">
        <ChartCard title="Hydration">
          <Bar data={hydrationData} options={chartOptions} />
        </ChartCard>
        <ChartCard title="Calories">
          <Line data={calorieData} options={chartOptions} />
        </ChartCard>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-[18px] px-4 py-3" style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}>
      <p style={sLabel} className="mb-1">{label}</p>
      <p className="text-sm font-semibold" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{value}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-[20px] p-4" style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}>
      <p className="text-xs font-semibold mb-3" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{title}</p>
      <div className="h-52">{children}</div>
    </div>
  );
}