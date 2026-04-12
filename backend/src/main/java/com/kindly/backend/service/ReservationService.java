package com.kindly.backend.service;

import com.kindly.backend.domain.Reservation;
import com.kindly.backend.dto.DelayRequestDto;
import com.kindly.backend.mapper.ReservationMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
        validateReservation(reservation);
        validateSameDayReservation(reservation.getPhone(), reservation.getReservationDatetime());
        validateDuplicateReservation(reservation.getReservationDatetime());

        if (reservation.getStatus() == null || reservation.getStatus().isBlank()) {
            reservation.setStatus("RESERVED");
        }

        if (reservation.getDelayStatus() == null || reservation.getDelayStatus().isBlank()) {
            reservation.setDelayStatus("N");
        }

        reservationMapper.insertReservation(reservation);
    }

    public void updateReservation(int reservationId, Reservation reservation) {
        Reservation existingReservation = reservationMapper.findById(reservationId);

        if (existingReservation == null) {
            throw new IllegalArgumentException("존재하지 않는 예약입니다.");
        }

        LocalDateTime newReservationDatetime = reservation.getReservationDatetime();
        validateReservationDatetime(newReservationDatetime);

        if (existingReservation.getReservationDatetime().equals(newReservationDatetime)) {
            throw new IllegalArgumentException("기존 예약과 동일한 날짜와 시간입니다.");
        }

        validateSameDayReservationForUpdate(
                existingReservation.getPhone(),
                newReservationDatetime,
                reservationId
        );

        validateDuplicateReservationForUpdate(newReservationDatetime, reservationId);

        reservationMapper.updateReservationDatetime(reservationId, newReservationDatetime);
    }

    public void updateDelayInfo(int reservationId, DelayRequestDto delayRequestDto) {
        Reservation existingReservation = reservationMapper.findById(reservationId);

        if (existingReservation == null) {
            throw new IllegalArgumentException("존재하지 않는 예약입니다.");
        }

        if (!"RESERVED".equals(existingReservation.getStatus())) {
            throw new IllegalArgumentException("예약 완료 상태인 건만 지연 알림을 보낼 수 있습니다.");
        }

        if ("Y".equals(existingReservation.getDelayStatus())) {
            throw new IllegalArgumentException("이미 지연 알림을 보낸 예약입니다.");
        }

        if (delayRequestDto.getDelayMinutes() == null) {
            throw new IllegalArgumentException("예상 지연 시간을 선택해주세요.");
        }

        if (delayRequestDto.getDelayMinutes() <= 0) {
            throw new IllegalArgumentException("지연 시간은 1분 이상이어야 합니다.");
        }

        String delayMessage = delayRequestDto.getDelayMessage();

        if (delayMessage == null || delayMessage.isBlank()) {
            throw new IllegalArgumentException("지연 메시지를 확인할 수 없습니다.");
        }

        if (delayMessage.length() > 100) {
            throw new IllegalArgumentException("지연 메시지는 100자 이내로 입력해주세요.");
        }

        reservationMapper.updateDelayInfo(
                reservationId,
                "Y",
                delayMessage.trim()
        );
    }

    public void deleteReservation(int reservationId) {
        reservationMapper.deleteReservation(reservationId);
    }

    public List<Reservation> findByNameAndPhone(Reservation reservation) {
        return reservationMapper.findByNameAndPhone(reservation);
    }

    public List<String> findUnavailableTimesByDate(String reservationDate) {
        return reservationMapper.findUnavailableTimesByDate(reservationDate);
    }

    private void validateReservation(Reservation reservation) {
        validateCustomerName(reservation.getCustomerName());
        validatePhone(reservation.getPhone());
        validateReservationDatetime(reservation.getReservationDatetime());

        reservation.setCustomerName(reservation.getCustomerName().trim());
        reservation.setPhone(reservation.getPhone().replace("-", "").trim());
    }

    private void validateCustomerName(String customerName) {
        if (customerName == null || customerName.isBlank()) {
            throw new IllegalArgumentException("이름은 필수입니다.");
        }

        String trimmedName = customerName.trim();

        if (!trimmedName.matches("^[가-힣a-zA-Z]{2,10}$")) {
            throw new IllegalArgumentException("이름은 한글 또는 영문 2~10자로 입력해주세요.");
        }
    }

    private void validatePhone(String phone) {
        if (phone == null || phone.isBlank()) {
            throw new IllegalArgumentException("연락처는 필수입니다.");
        }

        String normalizedPhone = phone.replace("-", "").trim();

        if (!normalizedPhone.matches("^010\\d{8}$")) {
            throw new IllegalArgumentException("연락처는 010으로 시작하는 숫자 11자리로 입력해주세요.");
        }
    }

    private void validateReservationDatetime(LocalDateTime reservationDatetime) {
        if (reservationDatetime == null) {
            throw new IllegalArgumentException("예약 날짜와 시간을 선택해주세요.");
        }

        LocalDateTime now = LocalDateTime.now();

        if (!reservationDatetime.isAfter(now)) {
            throw new IllegalArgumentException("현재 시간 이후로만 예약할 수 있습니다.");
        }
    }

    private void validateSameDayReservation(String phone, LocalDateTime reservationDatetime) {
        String reservationDate = reservationDatetime.toLocalDate().toString();

        int count = reservationMapper.countByPhoneAndDate(phone, reservationDate);

        if (count > 0) {
            throw new IllegalArgumentException("이미 동일한 날짜에 예약이 존재합니다.");
        }
    }

    private void validateSameDayReservationForUpdate(
            String phone,
            LocalDateTime reservationDatetime,
            int reservationId
    ) {
        String reservationDate = reservationDatetime.toLocalDate().toString();

        int count = reservationMapper.countByPhoneAndDateExcludingId(
                phone,
                reservationDate,
                reservationId
        );

        if (count > 0) {
            throw new IllegalArgumentException("이미 동일한 날짜에 예약이 존재합니다.");
        }
    }

    private void validateDuplicateReservation(LocalDateTime reservationDatetime) {
        int count = reservationMapper.countByReservationDatetime(reservationDatetime);

        if (count > 0) {
            throw new IllegalArgumentException("이미 예약된 시간입니다.");
        }
    }

    private void validateDuplicateReservationForUpdate(
            LocalDateTime reservationDatetime,
            int reservationId
    ) {
        int count = reservationMapper.countByReservationDatetimeExcludingId(
                reservationDatetime,
                reservationId
        );

        if (count > 0) {
            throw new IllegalArgumentException("이미 예약된 시간입니다.");
        }
    }
}