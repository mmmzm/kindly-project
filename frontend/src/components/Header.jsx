import "../styles/header.css";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          kindly
        </Link>

        <nav className="nav">
          <a href="#">병원소개</a>
          <a href="#">시술안내</a>
          <Link to="/reservation">시술예약</Link>
          <a href="#">예약확인</a>
          <a href="#">전후사진</a>
          <a href="#">Event</a>
        </nav>
      </div>
    </header>
  );
}

export default Header;