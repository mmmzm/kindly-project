import "../styles/event.css";

function EventSection() {
  return (
    <section className="event-section">
      <div className="event-header">
        <h2>Event</h2>
        <button>이벤트 보러가기 →</button>
      </div>

      <div className="event-card">
        <div className="event-image">
          <h3>LOVE<br />MYSELF</h3>
          <p>IT'S APRIL!</p>
        </div>

        <div className="event-info">
          <h4>봄에는 나를 더 사랑하기로 해♥</h4>
          <p>Spring Big event</p>
        </div>
      </div>
    </section>
  );
}

export default EventSection;