import { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import InsightText from "./InsightText";

const COLORS = ["#b43333", "#e8d9d9"];

function RevisitRateChart() {
  const [chartData, setChartData] = useState([]);
  const [chartTitle, setChartTitle] = useState("재방문율");
  const [insight, setInsight] = useState("");
  const [revisitPercent, setRevisitPercent] = useState("");
  const [firstVisitPercent, setFirstVisitPercent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchChartData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("http://127.0.0.1:5000/analysis/revisit-rate");

      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      const title = res.data?.chartTitle || "재방문율";
      const insightText = res.data?.insight || "";

      setChartTitle(title);
      setInsight(insightText);
      setChartData(data);

      const revisit = data.find((item) => item.name === "재방문");
      const firstVisit = data.find((item) => item.name === "첫 방문");

      setRevisitPercent(revisit ? `${Number(revisit.value).toFixed(1)}%` : "");
      setFirstVisitPercent(firstVisit ? `${Number(firstVisit.value).toFixed(1)}%` : "");
    } catch (err) {
      console.error("재방문율 조회 실패:", err);
      setError("재방문율 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  if (loading) {
    return (
      <div className="admin-customer-chart-box">
        <div className="admin-chart-title">재방문율</div>
        <div className="admin-chart-empty">차트 데이터를 불러오는 중입니다.</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-customer-chart-box">
        <div className="admin-chart-title">재방문율</div>
        <div className="admin-chart-empty">{error}</div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="admin-customer-chart-box">
        <div className="admin-chart-title">재방문율</div>
        <div className="admin-chart-empty">표시할 차트 데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="admin-customer-chart-box">
      <div className="admin-chart-title">{chartTitle}</div>
      <InsightText
        text={insight}
        highlights={[revisitPercent, firstVisitPercent]}
      />

      <div className="admin-chart-container donut-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="46%"
              innerRadius={42}
              outerRadius={68}
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RevisitRateChart;