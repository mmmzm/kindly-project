package com.kindly.backend.mapper;

import com.kindly.backend.dto.AdminCustomerReservationDto;
import com.kindly.backend.dto.AdminCustomerSummaryDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminCustomerMapper {

    List<AdminCustomerSummaryDto> findCustomerSummaries();

    List<AdminCustomerReservationDto> findCustomerReservations(
            @Param("name") String name,
            @Param("phone") String phone
    );
}