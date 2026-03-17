package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.DTO.LoginRequest;
import com.example.demo.DTO.RegisterRequest;
import com.example.demo.DTO.AuthResponse;
import com.example.demo.model.User;
import com.example.demo.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    // User registration
    @PostMapping("/register")
    public User registerUser(@RequestBody RegisterRequest request) {
        return userService.registerUser(request);
    }

    // Admin registration
    @PostMapping("/admin/register")
    public User registerAdmin(@RequestBody RegisterRequest request) {
        return userService.registerAdmin(request);
    }

    // User login
    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return userService.login(request);
    }

    // Admin login
    @PostMapping("/admin/login")
    public AuthResponse adminLogin(@RequestBody LoginRequest request) {
        return userService.adminLogin(request);
    }
}