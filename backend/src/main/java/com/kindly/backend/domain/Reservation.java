package com.kindly.backend.domain;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;

public class Reservation {

    private Long reservationId;
    private Long userId;
    private Long treatmentId;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private Date reservationDatetime;

    private String status;
    private String delayStatus;
    private String delayMessage;
    private Date createdAt;

    public Long getReservationId() {
        return reservationId;
    }

    public void setReservationId(Long reservationId) {
        this.reservationId = reservationId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getTreatmentId() {
        return treatmentId;
    }

    public void setTreatmentId(Long treatmentId) {
        this.treatmentId = treatmentId;
    }

    public Date getReservationDatetime() {
        return reservationDatetime;
    }

    public void setReservationDatetime(Date reservationDatetime) {
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

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}