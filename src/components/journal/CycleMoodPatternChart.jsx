import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function CycleMoodPatternChart({ data }) {
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: "Mood",
        data: data.map(item => item.mood),
        backgroundColor: "rgba(196, 132, 154, 0.82)",
        borderRadius: 10,
      },
      {
        label: "Energy",
        data: data.map(item => item.energy),
        backgroundColor: "rgba(122, 158, 142, 0.82)",
        borderRadius: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { usePointStyle: true, boxWidth: 8, color: "#8A7E88", font: { size: 11 } },
      },
      tooltip: {
        backgroundColor: "rgba(42,32,53,0.92)",
        titleColor: "#fff",
        bodyColor: "#fff",
        cornerRadius: 12,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#8A7E88", font: { size: 11 } },
        border: { display: false },
      },
      y: {
        min: 0,
        max: 10,
        ticks: { stepSize: 2, color: "#8A7E88", font: { size: 11 } },
        grid: { color: "rgba(237,232,228,0.8)" },
        border: { display: false },
      },
    },
  };

  return <div className="h-64"><Bar data={chartData} options={options} /></div>;
}