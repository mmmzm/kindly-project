package com.kindly.backend.controller;

import com.kindly.backend.domain.Reservation;
import com.kindly.backend.service.ReservationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reservations")
@CrossOrigin(origins = "http://localhost:5173")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping
    public List<Reservation> findAll() {
        return reservationService.findAll();
    }

    @PostMapping
    public String insertReservation(@RequestBody Reservation reservation) {
        reservationService.insertReservation(reservation);
        return "예약 등록 성공";
    }

    @DeleteMapping("/{reservationId}")
    public String deleteReservation(@PathVariable int reservationId) {
        reservationService.deleteReservation(reservationId);
        return "예약 삭제 성공";
    }
}