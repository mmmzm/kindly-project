package com.kindly.backend.service;

import com.kindly.backend.domain.User;
import com.kindly.backend.dto.AdminCreateRequestDto;
import com.kindly.backend.dto.AdminUserResponseDto;
import com.kindly.backend.mapper.UserMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminManagerService {

    private final UserMapper userMapper;

    public AdminManagerService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public List<AdminUserResponseDto> findAdminUsers() {
        return userMapper.findAdminUsers()
                .stream()
                .map(user -> new AdminUserResponseDto(
                        user.getUserId(),
                        user.getUsername(),
                        user.getName(),
                        user.getPhone(),
                        user.getRole()
                ))
                .collect(Collectors.toList());
    }

    public void createAdminUser(AdminCreateRequestDto requestDto) {
        validateCreateRequest(requestDto);

        String username = requestDto.getUsername().trim();

        if (userMapper.countByUsername(username) > 0) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(requestDto.getPassword().trim());
        user.setName(requestDto.getName().trim());
        user.setPhone(requestDto.getPhone().replace("-", "").trim());
        user.setRole(requestDto.getRole().trim());

        userMapper.insertAdminUser(user);
    }

    public void deleteAdminUser(Long targetUserId, Long loginUserId) {
        if (targetUserId == null) {
            throw new IllegalArgumentException("삭제할 관리자 정보가 없습니다.");
        }

        if (loginUserId == null) {
            throw new IllegalArgumentException("로그인 관리자 정보를 확인할 수 없습니다.");
        }

        User targetUser = userMapper.findByUserId(targetUserId);

        if (targetUser == null) {
            throw new IllegalArgumentException("존재하지 않는 관리자 계정입니다.");
        }

        if (!isAdminRole(targetUser.getRole())) {
            throw new IllegalArgumentException("관리자 계정만 삭제할 수 있습니다.");
        }

        if (targetUserId.equals(loginUserId)) {
            throw new IllegalArgumentException("현재 로그인한 계정은 삭제할 수 없습니다.");
        }

        if ("SUPER_ADMIN".equals(targetUser.getRole()) && userMapper.countSuperAdmins() <= 1) {
            throw new IllegalArgumentException("마지막 SUPER_ADMIN 계정은 삭제할 수 없습니다.");
        }

        userMapper.deleteUser(targetUserId);
    }

    private void validateCreateRequest(AdminCreateRequestDto requestDto) {
        if (requestDto == null) {
            throw new IllegalArgumentException("관리자 등록 정보가 없습니다.");
        }

        if (requestDto.getUsername() == null || requestDto.getUsername().isBlank()) {
            throw new IllegalArgumentException("아이디를 입력해주세요.");
        }

        if (requestDto.getPassword() == null || requestDto.getPassword().isBlank()) {
            throw new IllegalArgumentException("비밀번호를 입력해주세요.");
        }

        if (requestDto.getName() == null || requestDto.getName().isBlank()) {
            throw new IllegalArgumentException("이름을 입력해주세요.");
        }

        validateManagerName(requestDto.getName());

        if (requestDto.getPhone() == null || requestDto.getPhone().isBlank()) {
            throw new IllegalArgumentException("연락처를 입력해주세요.");
        }

        String normalizedPhone = requestDto.getPhone().replace("-", "").trim();

        if (!normalizedPhone.matches("^010\\d{8}$")) {
            throw new IllegalArgumentException("연락처는 010으로 시작하는 11자리 숫자로 입력해주세요.");
        }

        if (requestDto.getRole() == null || requestDto.getRole().isBlank()) {
            throw new IllegalArgumentException("권한을 선택해주세요.");
        }

        if (!isAdminRole(requestDto.getRole().trim())) {
            throw new IllegalArgumentException("유효하지 않은 권한입니다.");
        }
    }

    private void validateManagerName(String name) {
        String trimmedName = name.trim();

        if (!trimmedName.matches("^[가-힣a-zA-Z]{2,10}$")) {
            throw new IllegalArgumentException("이름은 한글 또는 영문 2~10자로 입력해주세요.");
        }
    }

    private boolean isAdminRole(String role) {
        return "ADMIN".equals(role) || "SUPER_ADMIN".equals(role);
    }
}