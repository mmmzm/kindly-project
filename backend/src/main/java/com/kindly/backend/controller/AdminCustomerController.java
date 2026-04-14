package com.kindly.backend.controller;

import com.kindly.backend.service.AdminCustomerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/customers")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminCustomerController {

    private final AdminCustomerService adminCustomerService;

    public AdminCustomerController(AdminCustomerService adminCustomerService) {
        this.adminCustomerService = adminCustomerService;
    }

    @GetMapping
    public ResponseEntity<?> findCustomerSummaries() {
        try {
            return ResponseEntity.ok(adminCustomerService.findCustomerSummaries());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "고객 목록 조회 중 오류가 발생했습니다."));
        }
    }

    @GetMapping("/detail")
    public ResponseEntity<?> findCustomerDetail(
            @RequestParam String name,
            @RequestParam String phone
    ) {
        try {
            return ResponseEntity.ok(adminCustomerService.findCustomerDetail(name, phone));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "고객 상세 조회 중 오류가 발생했습니다."));
        }
    }
}