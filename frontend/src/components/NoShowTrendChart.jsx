import { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import InsightText from "./InsightText";

function NoShowTrendChart() {
  const [chartData, setChartData] = useState([]);
  const [chartTitle, setChartTitle] = useState("노쇼율 차트");
  const [insight, setInsight] = useState("");
  const [averageRate, setAverageRate] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchChartData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("http://127.0.0.1:5000/analysis/no-show-trend");

      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      const title = res.data?.chartTitle || "노쇼율 차트";
      const insightText = res.data?.insight || "";

      setChartTitle(title);
      setInsight(insightText);
      setChartData(data);

      if (data.length > 0) {
        const totalReservations = data.reduce(
          (sum, item) => sum + (item.totalReservations || 0),
          0
        );
        const totalNoShow = data.reduce(
          (sum, item) => sum + (item.noShowCount || 0),
          0
        );
        const avg = totalReservations > 0
          ? `${((totalNoShow / totalReservations) * 100).toFixed(1)}%`
          : "0.0%";

        const maxDay = [...data].sort((a, b) => b.noShowRate - a.noShowRate)[0];
        const max = maxDay ? `${Number(maxDay.noShowRate).toFixed(1)}%` : "";

        setAverageRate(avg);
        setMaxRate(max);
      } else {
        setAverageRate("");
        setMaxRate("");
      }
    } catch (err) {
      console.error("노쇼율 차트 조회 실패:", err);
      setError("노쇼율 차트 데이터를 불러오지 못했습니다.");
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
        <div className="admin-chart-title">노쇼율 차트</div>
        <div className="admin-chart-empty">차트 데이터를 불러오는 중입니다.</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-customer-chart-box">
        <div className="admin-chart-title">노쇼율 차트</div>
        <div className="admin-chart-empty">{error}</div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="admin-customer-chart-box">
        <div className="admin-chart-title">노쇼율 차트</div>
        <div className="admin-chart-empty">표시할 차트 데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="admin-customer-chart-box">
      <div className="admin-chart-title">{chartTitle}</div>
      <InsightText text={insight} highlights={[averageRate, maxRate]} />

      <div className="admin-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis unit="%" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="noShowRate"
              stroke="#b43333"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default NoShowTrendChart;