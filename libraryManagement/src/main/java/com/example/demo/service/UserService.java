package com.example.demo.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.DTO.LoginRequest;
import com.example.demo.DTO.RegisterRequest;
import com.example.demo.DTO.AuthResponse;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepo;
import com.example.demo.SecurityConfig.JwtUtils;

@Service
public class UserService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    // USER REGISTER
    public User registerUser(RegisterRequest request) {

        if (userRepo.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");

        return userRepo.save(user);
    }

    // ADMIN REGISTER
    public User registerAdmin(RegisterRequest request) {

        if (userRepo.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User admin = new User();
        admin.setUsername(request.getFullName());
        admin.setEmail(request.getEmail());
        admin.setPhoneNumber(request.getPhoneNumber());
        admin.setPassword(passwordEncoder.encode(request.getPassword()));
        admin.setRole("ADMIN");

        return userRepo.save(admin);
    }

    // USER LOGIN
    public AuthResponse login(LoginRequest request) {

        Optional<User> userOptional = userRepo.findByEmail(request.getEmail());

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        if (!user.getRole().equals("USER")) {
            throw new RuntimeException("Not a user account");
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(user, token);
    }

    // ADMIN LOGIN
    public AuthResponse adminLogin(LoginRequest request) {

        Optional<User> userOptional = userRepo.findByEmail(request.getEmail());

        if (userOptional.isEmpty()) {
            throw new RuntimeException("Admin not found");
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        if (!user.getRole().equals("ADMIN")) {
            throw new RuntimeException("Not an admin account");
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(user, token);
    }
}