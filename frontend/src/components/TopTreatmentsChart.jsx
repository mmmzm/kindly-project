import { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import InsightText from "./InsightText";

function TopTreatmentsChart() {
  const [chartData, setChartData] = useState([]);
  const [chartTitle, setChartTitle] = useState("인기 시술 TOP 5");
  const [insight, setInsight] = useState("");
  const [topTreatmentName, setTopTreatmentName] = useState("");
  const [topTreatmentCount, setTopTreatmentCount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchChartData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("http://127.0.0.1:5000/analysis/top-treatments");

      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      const title = res.data?.chartTitle || "인기 시술 TOP 5";
      const insightText = res.data?.insight || "";

      setChartTitle(title);
      setInsight(insightText);
      setChartData(data);

      if (data.length > 0) {
        setTopTreatmentName(data[0].name || "");
        setTopTreatmentCount(`${data[0].count}건`);
      } else {
        setTopTreatmentName("");
        setTopTreatmentCount("");
      }
    } catch (err) {
      console.error("인기 시술 조회 실패:", err);
      setError("인기 시술 데이터를 불러오지 못했습니다.");
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
        <div className="admin-chart-title">인기 시술 TOP 5</div>
        <div className="admin-chart-empty">차트 데이터를 불러오는 중입니다.</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-customer-chart-box">
        <div className="admin-chart-title">인기 시술 TOP 5</div>
        <div className="admin-chart-empty">{error}</div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="admin-customer-chart-box">
        <div className="admin-chart-title">인기 시술 TOP 5</div>
        <div className="admin-chart-empty">표시할 차트 데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="admin-customer-chart-box">
      <div className="admin-chart-title">{chartTitle}</div>
      <InsightText
        text={insight}
        highlights={[topTreatmentName, topTreatmentCount]}
      />

      <div className="admin-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12 }}
              width={90}
            />
            <Tooltip />
            <Bar dataKey="count" fill="#b43333" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TopTreatmentsChart;