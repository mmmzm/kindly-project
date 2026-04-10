package com.kindly.backend.mapper;

import com.kindly.backend.domain.Reservation;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ReservationMapper {

    List<Reservation> findAll();

    void insertReservation(Reservation reservation);

    void deleteReservation(int reservationId);
}