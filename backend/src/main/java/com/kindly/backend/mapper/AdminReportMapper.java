package com.kindly.backend.mapper;

import com.kindly.backend.dto.ChartPointDto;
import com.kindly.backend.dto.CustomerReportRowDto;
import com.kindly.backend.dto.ReservationReportRowDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminReportMapper {

    // 기간별 고객 리포트
    List<CustomerReportRowDto> findCustomerReportRowsByPeriod(
            @Param("startDate") String startDate,
            @Param("endDate") String endDate
    );

    // 기간별 예약 리포트
    List<ReservationReportRowDto> findReservationReportRowsByPeriod(
            @Param("startDate") String startDate,
            @Param("endDate") String endDate
    );

    // 기간별 전체 예약 수
    int countTotalReservationsByPeriod(
            @Param("startDate") String startDate,
            @Param("endDate") String endDate
    );

    // 기간별 노쇼 수
    int countNoShowByPeriod(
            @Param("startDate") String startDate,
            @Param("endDate") String endDate
    );

    // 기간별 지연 알림 수
    int countDelayByPeriod(
            @Param("startDate") String startDate,
            @Param("endDate") String endDate
    );

    // 기간별 인기 시술 TOP 1
    String findTopTreatmentByPeriod(
            @Param("startDate") String startDate,
            @Param("endDate") String endDate
    );

    // 기간별 예약 집중 시간대
    String findPeakHourByPeriod(
            @Param("startDate") String startDate,
            @Param("endDate") String endDate
    );

    // 차트: 노쇼 추이
    List<ChartPointDto> findNoShowTrendByPeriod(
            @Param("startDate") String startDate,
            @Param("endDate") String endDate
    );

    // 차트: 시간대별 예약 분포
    List<ChartPointDto> findTimeDistributionByPeriod(
            @Param("startDate") String startDate,
            @Param("endDate") String endDate
    );

    // 차트: 인기 시술
    List<ChartPointDto> findTopTreatmentsChartByPeriod(
            @Param("startDate") String startDate,
            @Param("endDate") String endDate
    );
}