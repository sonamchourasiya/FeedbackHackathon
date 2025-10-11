import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function ReportView() {
  const { scheduleId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      try {
        const res = await axios.get(
          `http://localhost:5000/api/reports/${scheduleId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setReport(res.data);
      } catch (err) {
        console.error("Error fetching report:", err);
        setError("Failed to load report.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [scheduleId]);

  if (loading) return <p>Loading report...</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (!report) return <p>No report found.</p>;

  // 🔹 Convert average rating into text category for graph
  const getCategory = (avg) => {
    if (avg >= 4.5) return "Excellent";
    if (avg >= 3.5) return "Good";
    if (avg >= 2.5) return "Satisfactory";
    return "Poor";
  };

  // 🔹 Prepare chart data
  const chartData = report.questions.map((q, index) => ({
    question: `Q${index + 1}`,
    category: getCategory(q.average_rating),
  }));

  // 🔹 Map categories to numeric values for Y-axis
  const categoryToNumber = {
    Poor: 1,
    Satisfactory: 2,
    Good: 3,
    Excellent: 4,
  };

  const numericData = chartData.map((d) => ({
    question: d.question,
    value: categoryToNumber[d.category],
    category: d.category,
  }));

  // 🔹 Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <strong>{data.question}</strong>
          <p style={{ margin: 0 }}>Feedback: {data.category}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mt-4">
      <h3>Feedback Report</h3>
      <h5>Final Average: {report.final_average.toFixed(2)}</h5>

      <div className="card p-4 shadow-sm mt-4">
        <h6>Overall Feedback per Question</h6>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={numericData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="question" />
            <YAxis
              type="number"
              ticks={[1, 2, 3, 4]}
              domain={[1, 4]}
              tickFormatter={(value) =>
                Object.keys(categoryToNumber).find(
                  (key) => categoryToNumber[key] === value
                )
              }
              label={{
                value: "Feedback Category",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#007bff"
              strokeWidth={3}
              dot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ReportView;
