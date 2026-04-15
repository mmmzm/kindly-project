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

  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const res = await axios.get("http://localhost:8080/admin/customers");
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("고객 목록 조회 실패:", err);
      alert(
        err.response?.data?.message || "고객 목록 조회 중 오류가 발생했습니다."
      );
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchCustomerDetail = async (name, phone) => {
    try {
      setLoadingDetail(true);

      const res = await axios.get(
        "http://localhost:8080/admin/customers/detail",
        {
          params: { name, phone },
        }
      );

      setSelectedCustomer(res.data);
    } catch (err) {
      console.error("고객 상세 조회 실패:", err);
      alert(
        err.response?.data?.message || "고객 상세 조회 중 오류가 발생했습니다."
      );
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const keyword = searchKeyword.trim().replace(/-/g, "");

    if (!keyword) return customers;

    return customers.filter((customer) => {
      const normalizedPhone = String(customer.phone || "").replace(/-/g, "");
      return (
        String(customer.name || "").includes(keyword) ||
        normalizedPhone.includes(keyword)
      );
    });
  }, [customers, searchKeyword]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));

  const pagedCustomers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCustomers.slice(start, start + PAGE_SIZE);
  }, [filteredCustomers, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (pagedCustomers.length === 0) {
      setSelectedCustomerKey(null);
      setSelectedCustomer(null);
      return;
    }

    const selectedExists = filteredCustomers.some(
      (customer) => customer.customerKey === selectedCustomerKey
    );

    if (!selectedExists) {
      const firstCustomer = pagedCustomers[0];
      setSelectedCustomerKey(firstCustomer.customerKey);
      fetchCustomerDetail(firstCustomer.name, firstCustomer.phone);
    }
  }, [filteredCustomers, pagedCustomers, selectedCustomerKey]);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomerKey(customer.customerKey);
    fetchCustomerDetail(customer.name, customer.phone);
  };

  const formatPhone = (phone) => {
    const only = String(phone || "").replace(/-/g, "").trim();
    if (only.length !== 11) return phone || "-";
    return `${only.slice(0, 3)}-${only.slice(3, 7)}-${only.slice(7)}`;
  };

  const getRevisitLabel = (revisit) => {
    return revisit ? "재방문" : "첫 방문";
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "RESERVED":
        return "예약완료";
      case "NOSHOW":
        return "노쇼";
      case "CANCELLED":
        return "취소";
      case "DONE":
        return "방문완료";
      default:
        return status || "-";
    }
  };

  const getNoShowRate = (customer) => {
    if (!customer?.totalReservations) return "0%";
    return `${Math.round(
      (customer.noShowCount / customer.totalReservations) * 100
    )}%`;
  };

  const revisitCustomerCount = customers.filter((c) => c.revisit).length;
  const noShowCustomerCount = customers.filter((c) => c.noShowCount > 0).length;

  return (
    <AdminLayout title="고객 관리">
      <div className="admin-customer-page">
        <div className="admin-customer-summary-grid">
          <div className="admin-summary-card">
            <p>전체 고객 수</p>
            <strong>{customers.length}</strong>
          </div>
          <div className="admin-summary-card">
            <p>재방문 고객</p>
            <strong>{revisitCustomerCount}</strong>
          </div>
          <div className="admin-summary-card delay">
            <p>노쇼 이력 고객</p>
            <strong>{noShowCustomerCount}</strong>
          </div>
        </div>

        <section className="admin-card admin-customer-list-card fixed-panel">
          <div className="admin-section-head">
            <h3>고객 목록</h3>
            <p>이름 또는 전화번호로 고객을 조회할 수 있습니다.</p>
          </div>

          <form
            className="admin-customer-search-bar"
            onSubmit={(e) => {
              e.preventDefault();
              setCurrentPage(1);
            }}
          >
            <input
              type="text"
              className="admin-customer-search-input"
              placeholder="이름 또는 전화번호를 입력해주세요"
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setCurrentPage(1);
              }}
            />
            <button type="submit" className="admin-customer-search-btn">
              조회
            </button>
          </form>

          <div className="admin-customer-table-wrap fixed compact">
            <table className="admin-customer-table compact">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>연락처</th>
                  <th>방문 구분</th>
                </tr>
              </thead>
              <tbody>
                {loadingCustomers ? (
                  <tr>
                    <td colSpan="3" className="admin-manager-empty-row">
                      고객 목록을 불러오는 중입니다.
                    </td>
                  </tr>
                ) : pagedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="admin-manager-empty-row">
                      조회된 고객이 없습니다.
                    </td>
                  </tr>
                ) : (
                  pagedCustomers.map((customer) => {
                    const isSelected =
                      selectedCustomerKey === customer.customerKey;

                    return (
                      <tr
                        key={customer.customerKey}
                        className={isSelected ? "selected" : ""}
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        <td>{customer.name}</td>
                        <td>{formatPhone(customer.phone)}</td>
                        <td>
                          <span
                            className={`admin-customer-visit-badge ${
                              customer.revisit ? "revisit" : ""
                            }`}
                          >
                            {getRevisitLabel(customer.revisit)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-customer-pagination">
            <button
              type="button"
              className="admin-customer-page-btn"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              &lt;
            </button>

            <span className="admin-customer-page-info">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              className="admin-customer-page-btn"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </section>

        <section className="admin-card admin-customer-detail-card fixed-panel">
          <div className="admin-section-head">
            <h3>고객 상세</h3>
            <p>선택한 고객의 요약 정보와 최근 예약 목록을 확인할 수 있습니다.</p>
          </div>

          {loadingDetail ? (
            <div className="admin-empty-box large">
              고객 상세를 불러오는 중입니다.
            </div>
          ) : selectedCustomer ? (
            <div className="admin-customer-detail-split refined">
              <div className="admin-customer-profile-card minimal">
                <div className="admin-customer-profile-top minimal">
                  <div>
                    <strong>{selectedCustomer.name}</strong>
                  </div>

                  <span
                    className={`admin-customer-visit-badge ${
                      selectedCustomer.revisit ? "revisit" : ""
                    }`}
                  >
                    {getRevisitLabel(selectedCustomer.revisit)}
                  </span>
                </div>

                <div className="admin-customer-profile-grid minimal">
                  <div className="admin-customer-profile-item">
                    <span>총 예약</span>
                    <strong>{selectedCustomer.totalReservations}</strong>
                  </div>
                  <div className="admin-customer-profile-item">
                    <span>노쇼율</span>
                    <strong>{getNoShowRate(selectedCustomer)}</strong>
                  </div>
                  <div className="admin-customer-profile-item full">
                    <span>인기 시술</span>
                    <strong>{selectedCustomer.favoriteTreatment || "-"}</strong>
                  </div>
                </div>
              </div>

              <div className="admin-customer-history-section side">
                <div className="admin-customer-subhead">
                  <h4>최근 예약 목록</h4>
                  <p>최신 예약 2개 높이 기준으로 보이고, 넘치면 스크롤됩니다.</p>
                </div>

                <div className="admin-customer-history-list side fixed-two">
                  {selectedCustomer.reservations &&
                  selectedCustomer.reservations.length > 0 ? (
                    selectedCustomer.reservations.map((reservation) => (
                      <article
                        className={`admin-customer-history-item ${
                          reservation.status === "NOSHOW" ? "noshow" : ""
                        }`}
                        key={reservation.reservationId}
                      >
                        <div className="admin-customer-history-top">
                          <strong>{reservation.treatmentName || "-"}</strong>
                          <span
                            className={`admin-customer-history-status ${
                              reservation.status === "NOSHOW" ? "noshow" : ""
                            }`}
                          >
                            {getStatusLabel(reservation.status)}
                          </span>
                        </div>

                        <div className="admin-customer-history-meta">
                          <span>예약 일시</span>
                          <strong>{reservation.dateTime || "-"}</strong>
                        </div>

                        {reservation.delayMessage && (
                          <div className="admin-customer-delay-box">
                            <strong>지연 알림</strong>
                            <p>{reservation.delayMessage}</p>
                          </div>
                        )}
                      </article>
                    ))
                  ) : (
                    <div className="admin-empty-box">
                      최근 예약 이력이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-empty-box large">
              고객을 선택하면 상세 정보가 표시됩니다.
            </div>
          )}
        </section>

        <section className="admin-card admin-customer-chart-placeholder-card">
          <div className="admin-section-head">
            <h3>분석 차트 영역</h3>
            <p>
              다음 단계에서 파이썬으로 노쇼율, 시간대 분포, 재방문율, 인기 시술
              차트를 연결할 예정입니다.
            </p>
          </div>

          <div className="admin-customer-chart-placeholder-grid">
            <div className="admin-customer-chart-box">노쇼율 차트</div>
            <div className="admin-customer-chart-box">시간대별 예약 분포</div>
            <div className="admin-customer-chart-box">재방문율 차트</div>
            <div className="admin-customer-chart-box">인기 시술 차트</div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

export default AdminCustomers;