import { Link } from "react-router-dom";
import "../styles/footer.css";

function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-consult">
              <p className="footer-consult-label">kindly clinic 상담문의</p>
              <h2 className="footer-phone">02-1234-5678</h2>

              <div className="footer-hours">
                <div className="footer-hour-row">
                  <span className="footer-day">평일</span>
                  <span className="footer-time">10:30 - 20:30</span>
                </div>
                <div className="footer-hour-row">
                  <span className="footer-day">토요일</span>
                  <span className="footer-time">10:30 - 17:00</span>
                </div>
              </div>
            </div>

            <div className="footer-links">
              <a href="#">이용약관</a>
              <span>|</span>
              <a href="#">개인정보 처리방침</a>
              <span>|</span>
              <a href="#">비급여항목</a>
              <span>|</span>
              <a href="mailto:kindly.hr@gmail.com">kindly.hr@gmail.com</a>
            </div>
          </div>

          <div className="footer-divider" />

          <div className="footer-bottom">
            <div className="footer-brand">KINDLY</div>

            <div className="footer-info">
            <p>
                TEL 02-1234-5678
                <span className="divider">ㅣ</span>
                서울 강남구 강남대로 123 3층
                <span className="divider">|</span>
                사업자번호 123-45-67890
            </p>
            </div>
          </div>
        </div>
      </footer>

      <Link to="/reservation" className="floating-reserve-btn">
        예약하기
      </Link>
    </>
  );
}

export default Footer;