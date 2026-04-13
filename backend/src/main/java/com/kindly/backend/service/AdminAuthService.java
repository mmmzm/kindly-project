package com.kindly.backend.service;

import com.kindly.backend.domain.User;
import com.kindly.backend.dto.AdminLoginRequestDto;
import com.kindly.backend.dto.AdminLoginResponseDto;
import com.kindly.backend.mapper.UserMapper;
import org.springframework.stereotype.Service;

@Service
public class AdminAuthService {

    private final UserMapper userMapper;

    public AdminAuthService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public AdminLoginResponseDto login(AdminLoginRequestDto requestDto) {
        validateLoginRequest(requestDto);

        User user = userMapper.findByUsername(requestDto.getUsername().trim());

        if (user == null) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        if (!user.getPassword().equals(requestDto.getPassword())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        if (!isAdminRole(user.getRole())) {
            throw new IllegalArgumentException("관리자 계정만 로그인할 수 있습니다.");
        }

        return new AdminLoginResponseDto(
                user.getUserId(),
                user.getUsername(),
                user.getName(),
                user.getPhone(),
                user.getRole()
        );
    }

    private void validateLoginRequest(AdminLoginRequestDto requestDto) {
        if (requestDto == null) {
            throw new IllegalArgumentException("로그인 정보가 없습니다.");
        }

        if (requestDto.getUsername() == null || requestDto.getUsername().isBlank()) {
            throw new IllegalArgumentException("아이디를 입력해주세요.");
        }

        if (requestDto.getPassword() == null || requestDto.getPassword().isBlank()) {
            throw new IllegalArgumentException("비밀번호를 입력해주세요.");
        }
    }

    private boolean isAdminRole(String role) {
        return "ADMIN".equals(role) || "SUPER_ADMIN".equals(role);
    }
}