package com.kindly.backend.dto;

public class CustomerReportRowDto {

    private String customerName;
    private String phone;
    private int totalReservations;
    private int validVisits;
    private int noShowCount;
    private double noShowRate;
    private String revisitType;
    private String favoriteTreatment;
    private String lastReservationDate;

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

    public double getNoShowRate() {
        return noShowRate;
    }

    public void setNoShowRate(double noShowRate) {
        this.noShowRate = noShowRate;
    }

    public String getRevisitType() {
        return revisitType;
    }

    public void setRevisitType(String revisitType) {
        this.revisitType = revisitType;
    }

    public String getFavoriteTreatment() {
        return favoriteTreatment;
    }

    public void setFavoriteTreatment(String favoriteTreatment) {
        this.favoriteTreatment = favoriteTreatment;
    }

    public String getLastReservationDate() {
        return lastReservationDate;
    }

    public void setLastReservationDate(String lastReservationDate) {
        this.lastReservationDate = lastReservationDate;
    }
}