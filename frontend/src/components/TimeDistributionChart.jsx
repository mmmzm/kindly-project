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

function TimeDistributionChart() {
  const [chartData, setChartData] = useState([]);
  const [chartTitle, setChartTitle] = useState("시간대별 예약 분포");
  const [insight, setInsight] = useState("");
  const [topHour, setTopHour] = useState("");
  const [topCount, setTopCount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchChartData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("http://127.0.0.1:5000/analysis/time-distribution");

      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      const title = res.data?.chartTitle || "시간대별 예약 분포";
      const insightText = res.data?.insight || "";

      setChartTitle(title);
      setInsight(insightText);
      setChartData(data);

      if (data.length > 0) {
        const best = [...data].sort((a, b) => b.count - a.count)[0];
        setTopHour(best?.hour || "");
        setTopCount(best ? `${best.count}건` : "");
      } else {
        setTopHour("");
        setTopCount("");
      }
    } catch (err) {
      console.error("시간대별 예약 분포 조회 실패:", err);
      setError("시간대별 예약 분포 데이터를 불러오지 못했습니다.");
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
        <div className="admin-chart-title">시간대별 예약 분포</div>
        <div className="admin-chart-empty">차트 데이터를 불러오는 중입니다.</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-customer-chart-box">
        <div className="admin-chart-title">시간대별 예약 분포</div>
        <div className="admin-chart-empty">{error}</div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="admin-customer-chart-box">
        <div className="admin-chart-title">시간대별 예약 분포</div>
        <div className="admin-chart-empty">표시할 차트 데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="admin-customer-chart-box">
      <div className="admin-chart-title">{chartTitle}</div>
      <InsightText text={insight} highlights={[topHour, topCount]} />

      <div className="admin-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#b43333" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TimeDistributionChart;