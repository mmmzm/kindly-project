package com.kindly.backend.controller;

import com.kindly.backend.domain.Reservation;
import com.kindly.backend.dto.DelayRequestDto;
import com.kindly.backend.service.ReservationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reservations")
@CrossOrigin(origins = "http://localhost:5173")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping
    public ResponseEntity<List<Reservation>> findAll() {
        return ResponseEntity.ok(reservationService.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createReservation(@RequestBody Reservation reservation) {
        try {
            reservationService.insertReservation(reservation);
            return ResponseEntity.ok(Map.of("message", "예약 등록 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "서버 오류가 발생했습니다."));
        }
    }

    @PutMapping("/{reservationId}")
    public ResponseEntity<?> updateReservation(
            @PathVariable int reservationId,
            @RequestBody Reservation reservation
    ) {
        try {
            reservationService.updateReservation(reservationId, reservation);
            return ResponseEntity.ok(Map.of("message", "예약이 변경되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "예약 변경 중 서버 오류가 발생했습니다."));
        }
    }

    @PostMapping("/{reservationId}/delay")
    public ResponseEntity<?> sendDelayNotice(
            @PathVariable int reservationId,
            @RequestBody DelayRequestDto delayRequestDto
    ) {
        try {
            reservationService.updateDelayInfo(reservationId, delayRequestDto);
            return ResponseEntity.ok(Map.of("message", "지연 알림이 전달되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "지연 알림 전송 중 서버 오류가 발생했습니다."));
        }
    }

    @PutMapping("/{reservationId}/noshow")
    public ResponseEntity<?> updateReservationToNoShow(@PathVariable int reservationId) {
        try {
            reservationService.updateReservationToNoShow(reservationId);
            return ResponseEntity.ok(Map.of("message", "노쇼 처리되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "노쇼 처리 중 서버 오류가 발생했습니다."));
        }
    }

    @DeleteMapping("/{reservationId}")
    public ResponseEntity<?> deleteReservation(@PathVariable int reservationId) {
        try {
            reservationService.deleteReservation(reservationId);
            return ResponseEntity.ok(Map.of("message", "예약 삭제 성공"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "예약 삭제 중 오류가 발생했습니다."));
        }
    }

    @PostMapping("/search")
    public ResponseEntity<?> findByNameAndPhone(@RequestBody Reservation reservation) {
        try {
            return ResponseEntity.ok(reservationService.findByNameAndPhone(reservation));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "예약 조회 중 오류가 발생했습니다."));
        }
    }

    @GetMapping("/unavailable")
    public ResponseEntity<?> findUnavailableTimes(@RequestParam String date) {
        try {
            return ResponseEntity.ok(reservationService.findUnavailableTimesByDate(date));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "예약 불가 시간 조회 중 오류가 발생했습니다."));
        }
    }
}