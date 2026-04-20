package com.kindly.backend.controller;

import com.kindly.backend.service.AdminExcelService;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/admin/excel")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminExcelController {

    private final AdminExcelService adminExcelService;

    public AdminExcelController(AdminExcelService adminExcelService) {
        this.adminExcelService = adminExcelService;
    }

    @GetMapping("/report")
    public void downloadReportExcel(HttpServletResponse response) throws IOException {
        Workbook workbook = adminExcelService.createWorkbookFromTemplate();

        String fileName = URLEncoder.encode("kindly_dashboard.xlsx", StandardCharsets.UTF_8)
                .replaceAll("\\+", "%20");

        response.setContentType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        response.setHeader(
                "Content-Disposition",
                "attachment; filename*=UTF-8''" + fileName
        );

        workbook.write(response.getOutputStream());
        workbook.close();
    }
}