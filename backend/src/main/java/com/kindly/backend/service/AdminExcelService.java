package com.kindly.backend.service;

import com.kindly.backend.dto.CustomerReportRowDto;
import com.kindly.backend.dto.ReservationReportRowDto;
import com.kindly.backend.mapper.AdminCustomerMapper;
import com.kindly.backend.mapper.ReservationMapper;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.util.CellReference;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminExcelService {

    private static final String TEMPLATE_PATH = "/template/kindly_dashboard.xlsx";

    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final AdminCustomerMapper adminCustomerMapper;
    private final ReservationMapper reservationMapper;

    public AdminExcelService(AdminCustomerMapper adminCustomerMapper,
                             ReservationMapper reservationMapper) {
        this.adminCustomerMapper = adminCustomerMapper;
        this.reservationMapper = reservationMapper;
    }

    public Workbook createWorkbookFromTemplate() throws IOException {
        InputStream is = getClass().getResourceAsStream(TEMPLATE_PATH);
        if (is == null) {
            throw new IOException("템플릿 파일을 찾을 수 없습니다: " + TEMPLATE_PATH);
        }

        Workbook workbook;
        try {
            workbook = WorkbookFactory.create(is);
        } catch (Exception e) {
            throw new IOException("템플릿 파일 로드 실패", e);
        }

        Sheet dashboardSheet = findSheet(workbook, "분석대시보드");
        Sheet reservationSheet = findSheet(workbook, "예약관리", "예약관리_raw");
        Sheet customerSheet = findSheet(workbook, "고객관리", "고객관리_raw");
        Sheet helperSheet = findSheet(workbook, "helper_data");

        List<ReservationReportRowDto> reservations = reservationMapper.findAllReservationReportRows();
        List<CustomerReportRowDto> customers = adminCustomerMapper.findCustomerReportRows();

        clearSheetData(reservationSheet, 1);
        clearSheetData(customerSheet, 1);
        clearSheetData(helperSheet, 1);

        fillReservationSheet(workbook, reservationSheet, reservations);
        fillCustomerSheet(customerSheet, customers);
        fillHelperSheet(helperSheet, dashboardSheet, reservationSheet, reservations);
        fillDashboardSheet(workbook, dashboardSheet, reservationSheet, helperSheet, reservations);

        workbook.setSheetHidden(workbook.getSheetIndex(helperSheet), true);

        FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();
        evaluator.evaluateAll();
        workbook.setForceFormulaRecalculation(true);

        return workbook;
    }

    private Sheet findSheet(Workbook workbook, String... candidates) {
        for (String name : candidates) {
            Sheet sheet = workbook.getSheet(name);
            if (sheet != null) {
                return sheet;
            }
        }
        throw new IllegalArgumentException("시트를 찾을 수 없습니다: " + Arrays.toString(candidates));
    }

    private void fillReservationSheet(Workbook workbook, Sheet sheet, List<ReservationReportRowDto> reservations) {
        String[] headers = {
                "예약 ID", "고객명", "연락처", "시술명", "예약 일시",
                "예약 날짜", "예약 시간", "원시 상태", "표시 상태", "지연 여부", "지연 메시지"
        };

        CellStyle dateStyle = createDateCellStyle(workbook);

        Row headerRow = getOrCreateRow(sheet, 0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = getOrCreateCell(headerRow, i);
            cell.setCellValue(headers[i]);
        }

        int rowIdx = 1;
        for (ReservationReportRowDto r : reservations) {
            Row row = getOrCreateRow(sheet, rowIdx++);

            setText(row, 0, String.valueOf(r.getReservationId()));
            setText(row, 1, nvl(r.getCustomerName()));
            setText(row, 2, formatPhone(r.getPhone()));
            setText(row, 3, nvl(r.getTreatmentName()));
            setText(row, 4, nvl(r.getDateTime()));

            Cell dateCell = getOrCreateCell(row, 5);
            if (r.getReservationDate() != null && !r.getReservationDate().isBlank()) {
                LocalDate date = LocalDate.parse(r.getReservationDate(), DATE_FORMATTER);
                dateCell.setCellValue(java.sql.Date.valueOf(date));

                CellStyle mergedStyle = workbook.createCellStyle();
                if (dateCell.getCellStyle() != null) {
                    mergedStyle.cloneStyleFrom(dateCell.getCellStyle());
                }
                mergedStyle.cloneStyleFrom(dateStyle);
                dateCell.setCellStyle(dateStyle);
            }

            setText(row, 6, nvl(r.getReservationTime()));
            setText(row, 7, nvl(r.getStatus()));
            setText(row, 8, getDisplayStatus(r.getStatus(), r.getDateTime()));
            setText(row, 9, "Y".equals(r.getDelayStatus()) ? "Y" : "N");
            setText(row, 10, nvl(r.getDelayMessage()));
        }
    }

    private void fillCustomerSheet(Sheet sheet, List<CustomerReportRowDto> customers) {
        String[] headers = {
                "이름", "연락처", "총 예약 수", "유효 방문 수", "노쇼 횟수",
                "노쇼율", "방문 구분", "위험 여부", "인기 시술", "최근 예약일"
        };

        Row headerRow = getOrCreateRow(sheet, 0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = getOrCreateCell(headerRow, i);
            cell.setCellValue(headers[i]);
        }

        int rowIdx = 1;
        for (CustomerReportRowDto c : customers) {
            int noShowRate = calculateNoShowRate(c.getNoShowCount(), c.getTotalReservations());
            boolean isRisk = noShowRate >= 30;

            Row row = getOrCreateRow(sheet, rowIdx++);
            setText(row, 0, nvl(c.getCustomerName()));
            setText(row, 1, formatPhone(c.getPhone()));
            setNumber(row, 2, c.getTotalReservations());
            setNumber(row, 3, c.getValidVisits());
            setNumber(row, 4, c.getNoShowCount());
            setText(row, 5, noShowRate + "%");
            setText(row, 6, nvl(c.getRevisitType()));
            setText(row, 7, isRisk ? "노쇼 위험 고객" : "정상");
            setText(row, 8, nvl(c.getFavoriteTreatment()));
            setText(row, 9, nvl(c.getLastReservationDate()));
        }
    }

    private void fillHelperSheet(Sheet helperSheet,
                                 Sheet dashboardSheet,
                                 Sheet reservationSheet,
                                 List<ReservationReportRowDto> reservations) {

        String dashboardName = quotedSheetName(dashboardSheet.getSheetName());
        String reservationName = quotedSheetName(reservationSheet.getSheetName());

        setText(getOrCreateRow(helperSheet, 0), 0, "날짜");
        setText(getOrCreateRow(helperSheet, 0), 1, "예약 수");
        setText(getOrCreateRow(helperSheet, 0), 3, "상태");
        setText(getOrCreateRow(helperSheet, 0), 4, "건수");
        setText(getOrCreateRow(helperSheet, 0), 6, "시술명");
        setText(getOrCreateRow(helperSheet, 0), 7, "건수");
        setText(getOrCreateRow(helperSheet, 0), 9, "시간");
        setText(getOrCreateRow(helperSheet, 0), 10, "건수");
        setText(getOrCreateRow(helperSheet, 0), 12, "고객키");
        setText(getOrCreateRow(helperSheet, 0), 13, "예약수");
        setText(getOrCreateRow(helperSheet, 0), 14, "노쇼수");
        setText(getOrCreateRow(helperSheet, 0), 15, "위험여부");

        Workbook workbook = helperSheet.getWorkbook();
        CellStyle dateStyle = createDateCellStyle(workbook);

        List<LocalDate> uniqueDates = reservations.stream()
                .map(ReservationReportRowDto::getReservationDate)
                .filter(Objects::nonNull)
                .filter(s -> !s.isBlank())
                .map(s -> LocalDate.parse(s, DATE_FORMATTER))
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        int row = 1;
        for (LocalDate date : uniqueDates) {
            Row r = getOrCreateRow(helperSheet, row);
            Cell dateCell = getOrCreateCell(r, 0);
            dateCell.setCellValue(java.sql.Date.valueOf(date));
            dateCell.setCellStyle(dateStyle);

            String formula = "IF(AND(A" + (row + 1) + ">=" + dashboardName + "!$B$6,A" + (row + 1) + "<=" + dashboardName + "!$F$6),COUNTIF(" +
                    reservationName + "!$F:$F,A" + (row + 1) + "),NA())";
            setFormula(r, 1, formula);
            row++;
        }

        String[] statuses = {"예약완료", "방문완료", "노쇼", "취소"};
        for (int i = 0; i < statuses.length; i++) {
            int excelRow = i + 2;
            Row r = getOrCreateRow(helperSheet, i + 1);
            setText(r, 3, statuses[i]);

            String formula = "COUNTIFS(" +
                    reservationName + "!$F:$F,\">=\"&" + dashboardName + "!$B$6," +
                    reservationName + "!$F:$F,\"<=\"&" + dashboardName + "!$F$6," +
                    reservationName + "!$I:$I,D" + excelRow + ")";
            setFormula(r, 4, formula);
        }

        List<String> treatments = reservations.stream()
                .map(ReservationReportRowDto::getTreatmentName)
                .filter(Objects::nonNull)
                .filter(s -> !s.isBlank())
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        row = 1;
        for (String treatment : treatments) {
            int excelRow = row + 1;
            Row r = getOrCreateRow(helperSheet, row);
            setText(r, 6, treatment);

            String formula = "COUNTIFS(" +
                    reservationName + "!$F:$F,\">=\"&" + dashboardName + "!$B$6," +
                    reservationName + "!$F:$F,\"<=\"&" + dashboardName + "!$F$6," +
                    reservationName + "!$D:$D,G" + excelRow + ")";
            setFormula(r, 7, formula);
            row++;
        }

        List<String> times = reservations.stream()
                .map(ReservationReportRowDto::getReservationTime)
                .filter(Objects::nonNull)
                .filter(s -> !s.isBlank())
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        row = 1;
        for (String time : times) {
            int excelRow = row + 1;
            Row r = getOrCreateRow(helperSheet, row);
            setText(r, 9, time);

            String formula = "COUNTIFS(" +
                    reservationName + "!$F:$F,\">=\"&" + dashboardName + "!$B$6," +
                    reservationName + "!$F:$F,\"<=\"&" + dashboardName + "!$F$6," +
                    reservationName + "!$G:$G,J" + excelRow + ")";
            setFormula(r, 10, formula);
            row++;
        }

        List<String> customerKeys = reservations.stream()
                .filter(r -> r.getCustomerName() != null && r.getPhone() != null)
                .map(r -> r.getCustomerName() + "|" + formatPhone(r.getPhone()))
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        int rawEndRow = Math.max(reservations.size() + 1, 2);

        row = 1;
        for (String key : customerKeys) {
            int excelRow = row + 1;
            Row r = getOrCreateRow(helperSheet, row);
            setText(r, 12, key);

            String totalFormula =
                    "SUMPRODUCT((" + reservationName + "!$B$2:$B$" + rawEndRow +
                            "&\"|\"&" + reservationName + "!$C$2:$C$" + rawEndRow +
                            "=M" + excelRow + ")*(" +
                            reservationName + "!$F$2:$F$" + rawEndRow + ">=" + dashboardName + "!$B$6)*(" +
                            reservationName + "!$F$2:$F$" + rawEndRow + "<=" + dashboardName + "!$F$6))";

            String noShowFormula =
                    "SUMPRODUCT((" + reservationName + "!$B$2:$B$" + rawEndRow +
                            "&\"|\"&" + reservationName + "!$C$2:$C$" + rawEndRow +
                            "=M" + excelRow + ")*(" +
                            reservationName + "!$F$2:$F$" + rawEndRow + ">=" + dashboardName + "!$B$6)*(" +
                            reservationName + "!$F$2:$F$" + rawEndRow + "<=" + dashboardName + "!$F$6)*(" +
                            reservationName + "!$I$2:$I$" + rawEndRow + "=\"노쇼\"))";

            setFormula(r, 13, totalFormula);
            setFormula(r, 14, noShowFormula);
            setFormula(r, 15, "IF(N" + excelRow + "=0,\"-\",IF(O" + excelRow + "/N" + excelRow + ">=0.3,\"위험\",\"정상\"))");
            row++;
        }
    }

    private void fillDashboardSheet(Workbook workbook,
                                    Sheet dashboardSheet,
                                    Sheet reservationSheet,
                                    Sheet helperSheet,
                                    List<ReservationReportRowDto> reservations) {

        LocalDate minDate = getMinDate(reservations);
        LocalDate maxDate = getMaxDate(reservations);

        setDateCell(dashboardSheet, "B6", minDate, workbook);
        setDateCell(dashboardSheet, "F6", maxDate, workbook);

        String reservationName = quotedSheetName(reservationSheet.getSheetName());
        String helperName = quotedSheetName(helperSheet.getSheetName());

        setFormula(dashboardSheet, "A9",
                "COUNTIFS(" + reservationName + "!$F:$F,\">=\"&$B$6," + reservationName + "!$F:$F,\"<=\"&$F$6)");
        setFormula(dashboardSheet, "C9",
                "COUNTIFS(" + reservationName + "!$F:$F,\">=\"&$B$6," + reservationName + "!$F:$F,\"<=\"&$F$6," + reservationName + "!$I:$I,\"예약완료\")");
        setFormula(dashboardSheet, "E9",
                "COUNTIFS(" + reservationName + "!$F:$F,\">=\"&$B$6," + reservationName + "!$F:$F,\"<=\"&$F$6," + reservationName + "!$J:$J,\"Y\")");
        setFormula(dashboardSheet, "G9",
                "COUNTIFS(" + reservationName + "!$F:$F,\">=\"&$B$6," + reservationName + "!$F:$F,\"<=\"&$F$6," + reservationName + "!$I:$I,\"방문완료\")");

        setFormula(dashboardSheet, "A11",
                "COUNTIFS(" + reservationName + "!$F:$F,\">=\"&$B$6," + reservationName + "!$F:$F,\"<=\"&$F$6," + reservationName + "!$I:$I,\"취소\")");
        setFormula(dashboardSheet, "C11",
                "COUNTIFS(" + reservationName + "!$F:$F,\">=\"&$B$6," + reservationName + "!$F:$F,\"<=\"&$F$6," + reservationName + "!$I:$I,\"노쇼\")");
        setFormula(dashboardSheet, "E11",
                "IF(A9=0,0,C11/A9)");
        setFormula(dashboardSheet, "G11",
                "COUNTIF(" + helperName + "!$P$2:$P$999,\"위험\")");

        setFormula(dashboardSheet, "A13",
                "IFERROR(INDEX(" + helperName + "!$J$2:$J$999,MATCH(MAX(" + helperName + "!$K$2:$K$999)," + helperName + "!$K$2:$K$999,0)),\"-\")");
        setFormula(dashboardSheet, "C13",
                "IFERROR(INDEX(" + helperName + "!$G$2:$G$999,MATCH(MAX(" + helperName + "!$H$2:$H$999)," + helperName + "!$H$2:$H$999,0)),\"-\")");

        Cell rateCell = getCell(dashboardSheet, "E11");
        if (rateCell != null) {
            CellStyle baseStyle = rateCell.getCellStyle();
            CellStyle style = workbook.createCellStyle();
            if (baseStyle != null) {
                style.cloneStyleFrom(baseStyle);
            }
            DataFormat df = workbook.createDataFormat();
            style.setDataFormat(df.getFormat("0.0%"));
            rateCell.setCellStyle(style);
        }

        setFormula(dashboardSheet, "A15",
                "\"• 선택 기간 전체 예약은 \"&A9&\"건입니다.\"&CHAR(10)&" +
                "\"• 노쇼는 \"&C11&\"건이며, 노쇼율은 \"&TEXT(E11,\"0.0%\")&\"입니다.\"&CHAR(10)&" +
                "\"• 방문완료는 \"&G9&\"건, 예약완료는 \"&C9&\"건입니다.\"&CHAR(10)&" +
                "\"• 가장 인기 있는 시술은 \"&C13&\"이며, 예약은 \"&A13&\" 시간대에 가장 집중됩니다.\"&CHAR(10)&" +
                "\"• 노쇼율 30% 이상 위험 고객은 \"&G11&\"명입니다.\"");

        applyInsightStyle(dashboardSheet, "A15", workbook);
    }

    private void applyInsightStyle(Sheet sheet, String ref, Workbook workbook) {
        CellReference cr = new CellReference(ref);
        Row row = getOrCreateRow(sheet, cr.getRow());
        Cell cell = getOrCreateCell(row, cr.getCol());

        CellStyle baseStyle = cell.getCellStyle();
        CellStyle newStyle = workbook.createCellStyle();

        if (baseStyle != null) {
            newStyle.cloneStyleFrom(baseStyle);
        }

        newStyle.setWrapText(true);
        newStyle.setAlignment(HorizontalAlignment.LEFT);
        newStyle.setVerticalAlignment(VerticalAlignment.TOP);

        cell.setCellStyle(newStyle);

        int startRow = cr.getRow();
        int endRow = startRow;

        for (int i = 0; i < sheet.getNumMergedRegions(); i++) {
            CellRangeAddress range = sheet.getMergedRegion(i);
            if (range.isInRange(cr.getRow(), cr.getCol())) {
                startRow = range.getFirstRow();
                endRow = range.getLastRow();
                break;
            }
        }

        for (int r = startRow; r <= endRow; r++) {
            Row targetRow = getOrCreateRow(sheet, r);
            targetRow.setHeightInPoints(24);
        }
    }

    private void clearSheetData(Sheet sheet, int startRowIndex) {
        for (int r = startRowIndex; r <= sheet.getLastRowNum(); r++) {
            Row row = sheet.getRow(r);
            if (row == null) continue;
            for (int c = 0; c < row.getLastCellNum(); c++) {
                Cell cell = row.getCell(c);
                if (cell != null) {
                    cell.setBlank();
                }
            }
        }
    }

    private Row getOrCreateRow(Sheet sheet, int rowIndex) {
        Row row = sheet.getRow(rowIndex);
        return row != null ? row : sheet.createRow(rowIndex);
    }

    private Cell getOrCreateCell(Row row, int colIndex) {
        Cell cell = row.getCell(colIndex);
        return cell != null ? cell : row.createCell(colIndex);
    }

    private Cell getCell(Sheet sheet, String ref) {
        CellReference cr = new CellReference(ref);
        Row row = sheet.getRow(cr.getRow());
        if (row == null) return null;
        return row.getCell(cr.getCol());
    }

    private void setText(Row row, int col, String value) {
        getOrCreateCell(row, col).setCellValue(nvl(value));
    }

    private void setNumber(Row row, int col, int value) {
        getOrCreateCell(row, col).setCellValue(value);
    }

    private void setFormula(Row row, int col, String formula) {
        getOrCreateCell(row, col).setCellFormula(formula);
    }

    private void setFormula(Sheet sheet, String ref, String formula) {
        CellReference cr = new CellReference(ref);
        Row row = getOrCreateRow(sheet, cr.getRow());
        Cell cell = getOrCreateCell(row, cr.getCol());
        cell.setCellFormula(formula);
    }

    private void setDateCell(Sheet sheet, String ref, LocalDate date, Workbook workbook) {
        CellReference cr = new CellReference(ref);
        Row row = getOrCreateRow(sheet, cr.getRow());
        Cell cell = getOrCreateCell(row, cr.getCol());

        CellStyle baseStyle = cell.getCellStyle();
        CellStyle newStyle = workbook.createCellStyle();

        if (baseStyle != null) {
            newStyle.cloneStyleFrom(baseStyle);
        }

        DataFormat dataFormat = workbook.createDataFormat();
        newStyle.setDataFormat(dataFormat.getFormat("yyyy-mm-dd"));

        cell.setCellValue(java.sql.Date.valueOf(date));
        cell.setCellStyle(newStyle);
    }

    private CellStyle createDateCellStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat dataFormat = workbook.createDataFormat();
        style.setDataFormat(dataFormat.getFormat("yyyy-mm-dd"));
        return style;
    }

    private String quotedSheetName(String sheetName) {
        return "'" + sheetName + "'";
    }

    private int calculateNoShowRate(int noShowCount, int totalReservations) {
        if (totalReservations <= 0) return 0;
        return (int) Math.round((double) noShowCount / totalReservations * 100);
    }

    private String getDisplayStatus(String status, String dateTime) {
        if ("RESERVED".equals(status)) {
            if (dateTime != null && !dateTime.isBlank()) {
                try {
                    LocalDateTime reservationTime = LocalDateTime.parse(dateTime, DATE_TIME_FORMATTER);
                    return reservationTime.isBefore(LocalDateTime.now()) ? "방문완료" : "예약완료";
                } catch (Exception e) {
                    return "예약완료";
                }
            }
            return "예약완료";
        }
        if ("NOSHOW".equals(status)) return "노쇼";
        if ("CANCELLED".equals(status)) return "취소";
        return nvl(status);
    }

    private LocalDate getMinDate(List<ReservationReportRowDto> reservations) {
        return reservations.stream()
                .map(ReservationReportRowDto::getReservationDate)
                .filter(Objects::nonNull)
                .filter(s -> !s.isBlank())
                .map(s -> LocalDate.parse(s, DATE_FORMATTER))
                .min(LocalDate::compareTo)
                .orElse(LocalDate.now());
    }

    private LocalDate getMaxDate(List<ReservationReportRowDto> reservations) {
        return reservations.stream()
                .map(ReservationReportRowDto::getReservationDate)
                .filter(Objects::nonNull)
                .filter(s -> !s.isBlank())
                .map(s -> LocalDate.parse(s, DATE_FORMATTER))
                .max(LocalDate::compareTo)
                .orElse(LocalDate.now());
    }

    private String formatPhone(String phone) {
        if (phone == null) return "-";
        String only = phone.replaceAll("-", "").trim();
        if (only.length() != 11) return phone;
        return only.substring(0, 3) + "-"
                + only.substring(3, 7) + "-"
                + only.substring(7);
    }

    private String nvl(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }
}