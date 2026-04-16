from flask import Flask, jsonify
from flask_cors import CORS
import oracledb

app = Flask(__name__)
CORS(app)

# =========================
# Oracle DB 접속 정보
# =========================
DB_USER = "study"
DB_PASSWORD = "a1234"
DB_DSN = "localhost:1521/XE"

def get_connection():
    return oracledb.connect(
        user=DB_USER,
        password=DB_PASSWORD,
        dsn=DB_DSN
    )

@app.route("/")
def home():
    return "Python analysis server is running!"

@app.route("/analysis/test")
def test():
    return jsonify({
        "message": "파이썬 서버 연결 성공"
    })

# =========================
# 1) 노쇼율 추이
# =========================
@app.route("/analysis/no-show-trend")
def no_show_trend():
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        sql = """
            SELECT
                TO_CHAR(TRUNC(reservation_datetime), 'YYYY-MM-DD') AS day,
                COUNT(*) AS total_count,
                SUM(
                    CASE
                        WHEN status = 'NOSHOW' THEN 1
                        ELSE 0
                    END
                ) AS no_show_count
            FROM reservation
            WHERE reservation_datetime >= TRUNC(SYSDATE) - 6
            GROUP BY TRUNC(reservation_datetime)
            ORDER BY TRUNC(reservation_datetime)
        """

        cursor.execute(sql)
        rows = cursor.fetchall()

        data = []
        total_reservations_sum = 0
        total_no_show_sum = 0

        for row in rows:
            date = row[0]
            total_count = int(row[1])
            no_show_count = int(row[2]) if row[2] is not None else 0
            no_show_rate = round((no_show_count / total_count) * 100, 1) if total_count > 0 else 0

            total_reservations_sum += total_count
            total_no_show_sum += no_show_count

            data.append({
                "date": date,
                "totalReservations": total_count,
                "noShowCount": no_show_count,
                "noShowRate": no_show_rate
            })

        average_rate = round((total_no_show_sum / total_reservations_sum) * 100, 1) if total_reservations_sum > 0 else 0
        max_day = max(data, key=lambda x: x["noShowRate"], default=None)

        if not data:
            insight = "최근 7일 기준 노쇼 데이터가 없습니다."
        elif max_day:
            insight = f"최근 7일 평균 노쇼율은 {average_rate}%이며, {max_day['date']}의 노쇼율이 {max_day['noShowRate']}%로 가장 높았습니다."
        else:
            insight = f"최근 7일 평균 노쇼율은 {average_rate}%입니다."

        return jsonify({
            "chartTitle": "최근 7일 노쇼율 추이",
            "unit": "%",
            "insight": insight,
            "data": data
        })

    except Exception as e:
        print("노쇼율 추이 조회 오류:", e)
        return jsonify({
            "chartTitle": "최근 7일 노쇼율 추이",
            "unit": "%",
            "insight": "노쇼율 인사이트를 생성하지 못했습니다.",
            "data": [],
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# =========================
# 2) 시간대별 예약 분포
# =========================
@app.route("/analysis/time-distribution")
def time_distribution():
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        sql = """
            SELECT
                TO_CHAR(reservation_datetime, 'HH24') AS hour,
                COUNT(*) AS count
            FROM reservation
            GROUP BY TO_CHAR(reservation_datetime, 'HH24')
            ORDER BY TO_CHAR(reservation_datetime, 'HH24')
        """

        cursor.execute(sql)
        rows = cursor.fetchall()

        data = [
            {
                "hour": f"{row[0]}시",
                "count": int(row[1])
            }
            for row in rows
        ]

        top_hour = max(data, key=lambda x: x["count"], default=None)

        if not data:
            insight = "시간대별 예약 데이터가 없습니다."
        elif top_hour:
            insight = f"예약은 {top_hour['hour']}에 가장 집중되며, 총 {top_hour['count']}건이 등록되었습니다."
        else:
            insight = "시간대별 예약 집중 시간대를 확인할 수 없습니다."

        return jsonify({
            "chartTitle": "시간대별 예약 분포",
            "unit": "건",
            "insight": insight,
            "data": data
        })

    except Exception as e:
        print("시간대별 예약 분포 조회 오류:", e)
        return jsonify({
            "chartTitle": "시간대별 예약 분포",
            "unit": "건",
            "insight": "시간대별 예약 분포 인사이트를 생성하지 못했습니다.",
            "data": [],
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# =========================
# 3) 재방문율
# =========================
@app.route("/analysis/revisit-rate")
def revisit_rate():
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        sql = """
            SELECT
                CASE
                    WHEN visit_count >= 2 THEN '재방문'
                    ELSE '첫 방문'
                END AS customer_type,
                COUNT(*) AS customer_count
            FROM (
                SELECT
                    customer_name,
                    phone,
                    COUNT(*) AS visit_count
                FROM reservation
                GROUP BY customer_name, phone
            )
            GROUP BY
                CASE
                    WHEN visit_count >= 2 THEN '재방문'
                    ELSE '첫 방문'
                END
            ORDER BY customer_type
        """

        cursor.execute(sql)
        rows = cursor.fetchall()

        total_count = sum(int(row[1]) for row in rows)

        data = []
        for row in rows:
            customer_type = row[0]
            count = int(row[1])
            value = round((count / total_count) * 100, 1) if total_count > 0 else 0

            data.append({
                "name": customer_type,
                "value": value
            })

        revisit_value = next((item["value"] for item in data if item["name"] == "재방문"), 0)
        first_visit_value = next((item["value"] for item in data if item["name"] == "첫 방문"), 0)

        if not data:
            insight = "재방문율 데이터가 없습니다."
        else:
            insight = f"전체 고객 중 재방문 고객 비중은 {revisit_value}%이며, 첫 방문 고객 비중은 {first_visit_value}%입니다."

        return jsonify({
            "chartTitle": "재방문율",
            "unit": "%",
            "insight": insight,
            "data": data
        })

    except Exception as e:
        print("재방문율 조회 오류:", e)
        return jsonify({
            "chartTitle": "재방문율",
            "unit": "%",
            "insight": "재방문율 인사이트를 생성하지 못했습니다.",
            "data": [],
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# =========================
# 4) 인기 시술 TOP 5
# =========================
@app.route("/analysis/top-treatments")
def top_treatments():
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        sql = """
            SELECT *
            FROM (
                SELECT
                    CASE treatment_id
                        WHEN 1 THEN '리프팅'
                        WHEN 2 THEN '토닝'
                        WHEN 3 THEN '보톡스'
                        WHEN 4 THEN '제모'
                        ELSE '시술 미확인'
                    END AS treatment_name,
                    COUNT(*) AS treatment_count
                FROM reservation
                GROUP BY treatment_id
                ORDER BY treatment_count DESC
            )
            WHERE ROWNUM <= 5
        """

        cursor.execute(sql)
        rows = cursor.fetchall()

        data = [
            {
                "name": row[0],
                "count": int(row[1])
            }
            for row in rows
        ]

        top_treatment = data[0] if data else None

        if not data:
            insight = "인기 시술 데이터가 없습니다."
        elif top_treatment:
            insight = f"가장 인기 있는 시술은 {top_treatment['name']}이며, 총 {top_treatment['count']}건 예약되었습니다."
        else:
            insight = "인기 시술 인사이트를 생성할 수 없습니다."

        return jsonify({
            "chartTitle": "인기 시술 TOP 5",
            "unit": "건",
            "insight": insight,
            "data": data
        })

    except Exception as e:
        print("인기 시술 조회 오류:", e)
        return jsonify({
            "chartTitle": "인기 시술 TOP 5",
            "unit": "건",
            "insight": "인기 시술 인사이트를 생성하지 못했습니다.",
            "data": [],
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    app.run(debug=True, port=5000)