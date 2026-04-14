import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";

const PAGE_SIZE = 5;

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCustomerKey, setSelectedCustomerKey] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [loading, setLoading] = useState(false);

  /* =======================
     고객 목록 API
  ======================= */
  const fetchCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/admin/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error("고객 목록 조회 실패:", err);
    }
  };

  /* =======================
     고객 상세 API
  ======================= */
  const fetchCustomerDetail = async (name, phone) => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:8080/admin/customers/detail",
        {
          params: { name, phone },
        }
      );

      setSelectedCustomer(res.data);
    } catch (err) {
      console.error("고객 상세 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  /* =======================
     검색 필터
  ======================= */
  const filteredCustomers = useMemo(() => {
    const keyword = searchKeyword.trim().replace(/-/g, "");

    if (!keyword) return customers;

    return customers.filter((c) => {
      const phone = String(c.phone || "").replace(/-/g, "");
      return c.name.includes(keyword) || phone.includes(keyword);
    });
  }, [customers, searchKeyword]);

  /* =======================
     페이지네이션
  ======================= */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / PAGE_SIZE)
  );

  const pagedCustomers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCustomers.slice(start, start + PAGE_SIZE);
  }, [filteredCustomers, currentPage]);

  /* =======================
     선택 처리
  ======================= */
  useEffect(() => {
    if (pagedCustomers.length === 0) return;

    if (!selectedCustomerKey) {
      const first = pagedCustomers[0];
      setSelectedCustomerKey(first.customerKey);
      fetchCustomerDetail(first.name, first.phone);
    }
  }, [pagedCustomers]);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomerKey(customer.customerKey);
    fetchCustomerDetail(customer.name, customer.phone);
  };

  /* =======================
     UI 함수
  ======================= */
  const formatPhone = (phone) => {
    const p = String(phone || "");
    if (p.length !== 11) return p;
    return `${p.slice(0, 3)}-${p.slice(3, 7)}-${p.slice(7)}`;
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "RESERVED":
        return "예약완료";
      case "NOSHOW":
        return "노쇼";
      case "CANCELLED":
        return "취소";
      default:
        return status;
    }
  };

  const getRevisitLabel = (revisit) =>
    revisit ? "재방문" : "첫 방문";

  const getNoShowRate = (c) => {
    if (!c?.totalReservations) return "0%";
    return `${Math.round(
      (c.noShowCount / c.totalReservations) * 100
    )}%`;
  };

  /* =======================
     렌더링
  ======================= */
  return (
    <AdminLayout title="고객 관리">
      <div className="admin-customer-page">
        {/* 요약 */}
        <div className="admin-customer-summary-grid">
          <div className="admin-summary-card">
            <p>전체 고객 수</p>
            <strong>{customers.length}</strong>
          </div>
          <div className="admin-summary-card">
            <p>재방문 고객</p>
            <strong>
              {customers.filter((c) => c.revisit).length}
            </strong>
          </div>
          <div className="admin-summary-card delay">
            <p>노쇼 이력 고객</p>
            <strong>
              {customers.filter((c) => c.noShowCount > 0).length}
            </strong>
          </div>
        </div>

        {/* 고객 목록 */}
        <section className="admin-card admin-customer-list-card">
          <div className="admin-section-head">
            <h3>고객 목록</h3>
          </div>

          <form
            className="admin-customer-search-bar"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              className="admin-customer-search-input"
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="이름 / 전화번호 검색"
            />
          </form>

          <div className="admin-customer-table-wrap fixed">
            <table className="admin-customer-table">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>연락처</th>
                  <th>총 예약</th>
                  <th>유효 방문</th>
                  <th>노쇼</th>
                  <th>재방문</th>
                  <th>최근 예약</th>
                </tr>
              </thead>

              <tbody>
                {pagedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="admin-manager-empty-row">
                      데이터 없음
                    </td>
                  </tr>
                ) : (
                  pagedCustomers.map((c) => (
                    <tr
                      key={c.customerKey}
                      className={
                        selectedCustomerKey === c.customerKey
                          ? "selected"
                          : ""
                      }
                      onClick={() => handleSelectCustomer(c)}
                    >
                      <td>{c.name}</td>
                      <td>{formatPhone(c.phone)}</td>
                      <td>{c.totalReservations}</td>
                      <td>{c.validVisits}</td>
                      <td>{c.noShowCount}</td>
                      <td>
                        <span
                          className={`admin-customer-visit-badge ${
                            c.revisit ? "revisit" : ""
                          }`}
                        >
                          {getRevisitLabel(c.revisit)}
                        </span>
                      </td>
                      <td>{c.lastReservationDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="admin-customer-pagination">
            <button
              className="admin-customer-page-btn"
              onClick={() =>
                setCurrentPage((p) => Math.max(1, p - 1))
              }
            >
              {"<"}
            </button>

            <span className="admin-customer-page-info">
              {currentPage} / {totalPages}
            </span>

            <button
              className="admin-customer-page-btn"
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(totalPages, p + 1)
                )
              }
            >
              {">"}
            </button>
          </div>
        </section>

        {/* 고객 상세 */}
        <section className="admin-card admin-customer-detail-card">
          {loading ? (
            <div className="admin-empty-box">불러오는 중...</div>
          ) : selectedCustomer ? (
            <div className="admin-customer-detail-split">
              <div className="admin-customer-profile-card">
                <strong>{selectedCustomer.name}</strong>
                <p>{formatPhone(selectedCustomer.phone)}</p>

                <div className="admin-customer-profile-grid">
                  <div>총 예약 {selectedCustomer.totalReservations}</div>
                  <div>유효 방문 {selectedCustomer.validVisits}</div>
                  <div>노쇼 {selectedCustomer.noShowCount}</div>
                  <div>노쇼율 {getNoShowRate(selectedCustomer)}</div>
                </div>
              </div>

              <div className="admin-customer-history-section side">
                <div className="admin-customer-history-list side">
                  {selectedCustomer.reservations?.map((r) => (
                    <div
                      key={r.reservationId}
                      className="admin-customer-history-item"
                    >
                      <strong>{r.treatmentName}</strong>
                      <span>{getStatusLabel(r.status)}</span>
                      <p>{r.dateTime}</p>
                      {r.delayMessage && <p>{r.delayMessage}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-empty-box">선택된 고객 없음</div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}

export default AdminCustomers;