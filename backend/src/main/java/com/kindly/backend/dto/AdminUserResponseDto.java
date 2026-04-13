package com.kindly.backend.dto;

public class AdminUserResponseDto {

    private Long userId;
    private String username;
    private String name;
    private String phone;
    private String role;

    public AdminUserResponseDto() {
    }

    public AdminUserResponseDto(Long userId, String username, String name, String phone, String role) {
        this.userId = userId;
        this.username = username;
        this.name = name;
        this.phone = phone;
        this.role = role;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}