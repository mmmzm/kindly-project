import "../styles/treatment.css";

function TreatmentSection() {
  return (
    <section className="treatment-section">
      <h2>대표 시술</h2>

      <div className="treatment-grid">
        <div className="card">리프팅</div>
        <div className="card">토닝</div>
        <div className="card">보톡스</div>
        <div className="card">제모</div>
      </div>
    </section>
  );
}

export default TreatmentSection;