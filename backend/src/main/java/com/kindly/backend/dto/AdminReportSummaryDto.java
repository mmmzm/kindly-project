package com.kindly.backend.dto;

import java.util.List;

public class AdminReportSummaryDto {

    private int totalCustomers;
    private int totalReservations;
    private int firstVisitCustomers;
    private int revisitCustomers;
    private int revisitRate;
    private int noShowCount;
    private int noShowRate;
    private int riskCustomerCount;
    private int delayCount;
    private String topTreatment;
    private String peakHour;
    private List<String> insights;

    public int getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(int totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public int getTotalReservations() {
        return totalReservations;
    }

    public void setTotalReservations(int totalReservations) {
        this.totalReservations = totalReservations;
    }

    public int getFirstVisitCustomers() {
        return firstVisitCustomers;
    }

    public void setFirstVisitCustomers(int firstVisitCustomers) {
        this.firstVisitCustomers = firstVisitCustomers;
    }

    public int getRevisitCustomers() {
        return revisitCustomers;
    }

    public void setRevisitCustomers(int revisitCustomers) {
        this.revisitCustomers = revisitCustomers;
    }

    public int getRevisitRate() {
        return revisitRate;
    }

    public void setRevisitRate(int revisitRate) {
        this.revisitRate = revisitRate;
    }

    public int getNoShowCount() {
        return noShowCount;
    }

    public void setNoShowCount(int noShowCount) {
        this.noShowCount = noShowCount;
    }

    public int getNoShowRate() {
        return noShowRate;
    }

    public void setNoShowRate(int noShowRate) {
        this.noShowRate = noShowRate;
    }

    public int getRiskCustomerCount() {
        return riskCustomerCount;
    }

    public void setRiskCustomerCount(int riskCustomerCount) {
        this.riskCustomerCount = riskCustomerCount;
    }

    public int getDelayCount() {
        return delayCount;
    }

    public void setDelayCount(int delayCount) {
        this.delayCount = delayCount;
    }

    public String getTopTreatment() {
        return topTreatment;
    }

    public void setTopTreatment(String topTreatment) {
        this.topTreatment = topTreatment;
    }

    public String getPeakHour() {
        return peakHour;
    }

    public void setPeakHour(String peakHour) {
        this.peakHour = peakHour;
    }

    public List<String> getInsights() {
        return insights;
    }

    public void setInsights(List<String> insights) {
        this.insights = insights;
    }
}