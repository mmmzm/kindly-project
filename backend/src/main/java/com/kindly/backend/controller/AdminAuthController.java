package com.kindly.backend.controller;

import com.kindly.backend.dto.AdminLoginRequestDto;
import com.kindly.backend.dto.AdminLoginResponseDto;
import com.kindly.backend.service.AdminAuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    public AdminAuthController(AdminAuthService adminAuthService) {
        this.adminAuthService = adminAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AdminLoginRequestDto requestDto) {
        try {
            AdminLoginResponseDto responseDto = adminAuthService.login(requestDto);
            return ResponseEntity.ok(responseDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "로그인 처리 중 서버 오류가 발생했습니다."));
        }
    }
}