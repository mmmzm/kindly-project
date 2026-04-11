import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/home.css";

import mainBanner from "../assets/images/main-banner.png";
import event1 from "../assets/images/event-1.png";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <Header />

      {/* HERO */}
      <section
        className="hero-section"
        style={{ backgroundImage: `url(${mainBanner})` }}
      >
        <div className="hero-overlay">
          <div className="home-inner">
            <p className="hero-subtitle">KINDLY CLINIC</p>
            <h1 className="hero-title">
              당신의 아름다움,
              <br />
              더 섬세하게 완성하다
            </h1>
            <p className="hero-desc">
              쁘띠 | 리프팅 | 스킨케어
              <br />
              PREMIUM BEAUTY CARE
            </p>
            <button
              className="hero-btn"
              onClick={() => navigate("/reservation")}
            >
              시술 예약하기
            </button>
          </div>
        </div>
      </section>

      {/* EVENT */}
      <section className="event-section">
        <div className="home-inner">
          <div className="event-header">
            <h2 className="event-section-title">Event</h2>
            <button className="event-more-btn">이벤트 보러가기 ›</button>
          </div>

          <div className="event-card-single">
            <div className="event-image-wrap">
              <img src={event1} alt="이벤트" className="event-image" />
              <div className="event-image-text top">LOVE MYSELF</div>
              <div className="event-image-text bottom">IT'S APRIL!</div>
            </div>

            <div className="event-card-body">
              <h3 className="event-card-title">Spring Big Event🖤</h3>
              <p className="event-card-period">2026.04.01 - 2026.04.30</p>
            </div>
          </div>
        </div>
      </section>

{/* LOCATION */}
<section className="location-section">
  <div className="home-inner">
    <h2 className="location-title eight">LOCATION</h2>
    <p className="location-sub">
      강남역 1번 출구 도보 2분 거리, 편하게 방문하세요.
    </p>

    <div className="map-wrap">
      <iframe
        src="https://www.google.com/maps?q=강남역%201번출구&output=embed"
        width="100%"
        height="400"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
      ></iframe>

      <div className="map-card">
        <h3></h3>
        <p>서울특별시 강남구 123</p>
        <p className="time">
          평일 10:00 - 19:00
          <br />
          토요일 10:00 - 15:00
        </p>
      </div>
    </div>
  </div>
</section>
    <Footer />
    </div>
  );
}

export default Home;