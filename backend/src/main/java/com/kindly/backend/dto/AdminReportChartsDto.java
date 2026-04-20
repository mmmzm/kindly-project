package com.kindly.backend.dto;

import java.util.List;

public class AdminReportChartsDto {

    private List<ChartPointDto> noShowTrend;
    private List<ChartPointDto> revisitRate;
    private List<ChartPointDto> timeDistribution;
    private List<ChartPointDto> topTreatments;

    public List<ChartPointDto> getNoShowTrend() {
        return noShowTrend;
    }

    public void setNoShowTrend(List<ChartPointDto> noShowTrend) {
        this.noShowTrend = noShowTrend;
    }

    public List<ChartPointDto> getRevisitRate() {
        return revisitRate;
    }

    public void setRevisitRate(List<ChartPointDto> revisitRate) {
        this.revisitRate = revisitRate;
    }

    public List<ChartPointDto> getTimeDistribution() {
        return timeDistribution;
    }

    public void setTimeDistribution(List<ChartPointDto> timeDistribution) {
        this.timeDistribution = timeDistribution;
    }

    public List<ChartPointDto> getTopTreatments() {
        return topTreatments;
    }

    public void setTopTreatments(List<ChartPointDto> topTreatments) {
        this.topTreatments = topTreatments;
    }
}