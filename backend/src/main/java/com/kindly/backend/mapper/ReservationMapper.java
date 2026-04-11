package com.kindly.backend.mapper;

import com.kindly.backend.domain.Reservation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ReservationMapper {

    List<Reservation> findAll();

    void insertReservation(Reservation reservation);

    void deleteReservation(@Param("reservationId") int reservationId);

    List<Reservation> findByNameAndPhone(Reservation reservation);

    int countByReservationDatetime(@Param("reservationDatetime") LocalDateTime reservationDatetime);

    List<String> findUnavailableTimesByDate(@Param("reservationDate") String reservationDate);
}