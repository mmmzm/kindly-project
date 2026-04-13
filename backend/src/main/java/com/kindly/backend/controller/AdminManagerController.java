package com.kindly.backend.controller;

import com.kindly.backend.dto.AdminCreateRequestDto;
import com.kindly.backend.service.AdminManagerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/managers")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminManagerController {

    private final AdminManagerService adminManagerService;

    public AdminManagerController(AdminManagerService adminManagerService) {
        this.adminManagerService = adminManagerService;
    }

    @GetMapping
    public ResponseEntity<?> findAdminUsers() {
        try {
            return ResponseEntity.ok(adminManagerService.findAdminUsers());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "관리자 목록 조회 중 오류가 발생했습니다."));
        }
    }

    @PostMapping
    public ResponseEntity<?> createAdminUser(@RequestBody AdminCreateRequestDto requestDto) {
        try {
            adminManagerService.createAdminUser(requestDto);
            return ResponseEntity.ok(Map.of("message", "관리자 계정이 등록되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "관리자 등록 중 오류가 발생했습니다."));
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteAdminUser(
            @PathVariable Long userId,
            @RequestParam Long loginUserId
    ) {
        try {
            adminManagerService.deleteAdminUser(userId, loginUserId);
            return ResponseEntity.ok(Map.of("message", "관리자 계정이 삭제되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "관리자 삭제 중 오류가 발생했습니다."));
        }
    }
}