package com.kindly.backend.service;

import com.kindly.backend.dto.AdminCustomerDetailDto;
import com.kindly.backend.dto.AdminCustomerReservationDto;
import com.kindly.backend.dto.AdminCustomerSummaryDto;
import com.kindly.backend.mapper.AdminCustomerMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminCustomerService {

    private final AdminCustomerMapper adminCustomerMapper;

    public AdminCustomerService(AdminCustomerMapper adminCustomerMapper) {
        this.adminCustomerMapper = adminCustomerMapper;
    }

    public List<AdminCustomerSummaryDto> findCustomerSummaries() {
        List<AdminCustomerSummaryDto> customers = adminCustomerMapper.findCustomerSummaries();

        for (AdminCustomerSummaryDto customer : customers) {
            customer.setRevisit(customer.getValidVisits() >= 2);
        }

        return customers;
    }

    public AdminCustomerDetailDto findCustomerDetail(String name, String phone) {
        validateCustomerKey(name, phone);

        List<AdminCustomerSummaryDto> customers = adminCustomerMapper.findCustomerSummaries();

        AdminCustomerSummaryDto matchedCustomer = customers.stream()
                .filter(customer ->
                        customer.getName().equals(name.trim()) &&
                        customer.getPhone().equals(phone.replace("-", "").trim()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("해당 고객 정보를 찾을 수 없습니다."));

        matchedCustomer.setRevisit(matchedCustomer.getValidVisits() >= 2);

        List<AdminCustomerReservationDto> reservations =
                adminCustomerMapper.findCustomerReservations(
                        name.trim(),
                        phone.replace("-", "").trim()
                );

        AdminCustomerDetailDto detailDto = new AdminCustomerDetailDto();
        detailDto.setCustomerKey(matchedCustomer.getCustomerKey());
        detailDto.setName(matchedCustomer.getName());
        detailDto.setPhone(matchedCustomer.getPhone());
        detailDto.setTotalReservations(matchedCustomer.getTotalReservations());
        detailDto.setValidVisits(matchedCustomer.getValidVisits());
        detailDto.setNoShowCount(matchedCustomer.getNoShowCount());
        detailDto.setRevisit(matchedCustomer.isRevisit());
        detailDto.setLastReservationDate(matchedCustomer.getLastReservationDate());
        detailDto.setReservations(reservations);

        return detailDto;
    }

    private void validateCustomerKey(String name, String phone) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("고객 이름이 필요합니다.");
        }

        if (phone == null || phone.isBlank()) {
            throw new IllegalArgumentException("고객 연락처가 필요합니다.");
        }
    }
}