package com.kindly.backend.service;

import com.kindly.backend.domain.Reservation;
import com.kindly.backend.mapper.ReservationMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReservationService {

    private final ReservationMapper reservationMapper;

    public ReservationService(ReservationMapper reservationMapper) {
        this.reservationMapper = reservationMapper;
    }

    public List<Reservation> findAll() {
        return reservationMapper.findAll();
    }

    public void insertReservation(Reservation reservation) {
        reservationMapper.insertReservation(reservation);
    }

    public void deleteReservation(int reservationId) {
        reservationMapper.deleteReservation(reservationId);
    }
}