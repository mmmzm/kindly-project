package com.kindly.backend.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public class Reservation {

    private int reservationId;
    private String customerName;
    private String phone;
    private int treatmentId;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime reservationDatetime;

    private String status;
    private String delayStatus;
    private String delayMessage;
    private LocalDateTime createdAt;

    public int getReservationId() {
        return reservationId;
    }

    public void setReservationId(int reservationId) {
        this.reservationId = reservationId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public int getTreatmentId() {
        return treatmentId;
    }

    public void setTreatmentId(int treatmentId) {
        this.treatmentId = treatmentId;
    }

    public LocalDateTime getReservationDatetime() {
        return reservationDatetime;
    }

    public void setReservationDatetime(LocalDateTime reservationDatetime) {
        this.reservationDatetime = reservationDatetime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDelayStatus() {
        return delayStatus;
    }

    public void setDelayStatus(String delayStatus) {
        this.delayStatus = delayStatus;
    }

    public String getDelayMessage() {
        return delayMessage;
    }

    public void setDelayMessage(String delayMessage) {
        this.delayMessage = delayMessage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}