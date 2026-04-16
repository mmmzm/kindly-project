function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function InsightText({ text = "", highlights = [] }) {
  if (!text) return null;

  const filteredHighlights = highlights.filter(Boolean);

  if (filteredHighlights.length === 0) {
    return <p className="admin-chart-insight">{text}</p>;
  }

  const pattern = filteredHighlights
    .map((item) => escapeRegExp(item))
    .join("|");

  const regex = new RegExp(`(${pattern})`, "g");
  const parts = text.split(regex);

  return (
    <p className="admin-chart-insight">
      {parts.map((part, index) =>
        filteredHighlights.includes(part) ? (
          <strong key={`${part}-${index}`}>{part}</strong>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        )
      )}
    </p>
  );
}

export default InsightText;