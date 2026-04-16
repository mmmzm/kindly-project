package com.kindly.backend.dto;

import java.util.List;

public class AdminCustomerDetailDto {

    private String customerKey;
    private String name;
    private String phone;
    private int totalReservations;
    private int validVisits;
    private int noShowCount;
    private boolean revisit;
    private String lastReservationDate;
    private String favoriteTreatment;
    private List<AdminCustomerReservationDto> reservations;

    public String getCustomerKey() {
        return customerKey;
    }

    public void setCustomerKey(String customerKey) {
        this.customerKey = customerKey;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public int getTotalReservations() {
        return totalReservations;
    }

    public void setTotalReservations(int totalReservations) {
        this.totalReservations = totalReservations;
    }

    public int getValidVisits() {
        return validVisits;
    }

    public void setValidVisits(int validVisits) {
        this.validVisits = validVisits;
    }

    public int getNoShowCount() {
        return noShowCount;
    }

    public void setNoShowCount(int noShowCount) {
        this.noShowCount = noShowCount;
    }

    public boolean isRevisit() {
        return revisit;
    }

    public void setRevisit(boolean revisit) {
        this.revisit = revisit;
    }

    public String getLastReservationDate() {
        return lastReservationDate;
    }

    public void setLastReservationDate(String lastReservationDate) {
        this.lastReservationDate = lastReservationDate;
    }

    public String getFavoriteTreatment() {
        return favoriteTreatment;
    }

    public void setFavoriteTreatment(String favoriteTreatment) {
        this.favoriteTreatment = favoriteTreatment;
    }

    public List<AdminCustomerReservationDto> getReservations() {
        return reservations;
    }

    public void setReservations(List<AdminCustomerReservationDto> reservations) {
        this.reservations = reservations;
    }
}