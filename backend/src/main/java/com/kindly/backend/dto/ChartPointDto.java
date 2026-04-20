package com.kindly.backend.dto;

public class ChartPointDto {

    private String label;
    private int value;

    public ChartPointDto() {}

    public ChartPointDto(String label, int value) {
        this.label = label;
        this.value = value;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public int getValue() {
        return value;
    }

    public void setValue(int value) {
        this.value = value;
    }
}