package com.kindly.backend.mapper;

import com.kindly.backend.domain.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserMapper {

    User findByUsername(@Param("username") String username);

    User findByUserId(@Param("userId") Long userId);

    List<User> findAdminUsers();

    int countByUsername(@Param("username") String username);

    int countSuperAdmins();

    void insertAdminUser(User user);

    void deleteUser(@Param("userId") Long userId);
}