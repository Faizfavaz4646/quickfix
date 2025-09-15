"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Job } from "@/types/user";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface JobGraphProps {
  jobs: Job[];
}

export default function JobGraph({ jobs }: JobGraphProps) {
  // Group jobs by status
  const pending = jobs.filter(j => j.status === "pending").length;
  const ongoing = jobs.filter(j => j.status === "ongoing").length;
  const completed = jobs.filter(j => j.status === "completed").length;

  const data = {
    labels: ["Jobs Overview"],
    datasets: [
      {
        label: "Pending",
        data: [pending],
        backgroundColor: "#fbbf24", // yellow
      },
      {
        label: "Ongoing",
        data: [ongoing],
        backgroundColor: "#3b82f6", // blue
      },
      {
        label: "Completed",
        data: [completed],
        backgroundColor: "#10b981", // green
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Jobs Status Overview",
      },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
  };

  return <Bar data={data} options={options} />;
}
