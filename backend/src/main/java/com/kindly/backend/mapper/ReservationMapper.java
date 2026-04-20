package com.kindly.backend.mapper;

import com.kindly.backend.domain.Reservation;
import com.kindly.backend.dto.ReservationReportRowDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ReservationMapper {

    List<ReservationReportRowDto> findAllReservationReportRows();

    List<Reservation> findAll();

    Reservation findById(@Param("reservationId") int reservationId);

    void insertReservation(Reservation reservation);

    void updateReservationDatetime(
            @Param("reservationId") int reservationId,
            @Param("reservationDatetime") LocalDateTime reservationDatetime
    );

    void updateDelayInfo(
            @Param("reservationId") int reservationId,
            @Param("delayStatus") String delayStatus,
            @Param("delayMessage") String delayMessage
    );

    void updateReservationStatus(
            @Param("reservationId") int reservationId,
            @Param("status") String status
    );

    void deleteReservation(@Param("reservationId") int reservationId);

    List<Reservation> findByNameAndPhone(Reservation reservation);

    int countByReservationDatetime(@Param("reservationDatetime") LocalDateTime reservationDatetime);

    int countByReservationDatetimeExcludingId(
            @Param("reservationDatetime") LocalDateTime reservationDatetime,
            @Param("reservationId") int reservationId
    );

    List<String> findUnavailableTimesByDate(@Param("reservationDate") String reservationDate);

    int countByPhoneAndDate(
            @Param("phone") String phone,
            @Param("reservationDate") String reservationDate
    );

    int countByPhoneAndDateExcludingId(
            @Param("phone") String phone,
            @Param("reservationDate") String reservationDate,
            @Param("reservationId") int reservationId
    );
}