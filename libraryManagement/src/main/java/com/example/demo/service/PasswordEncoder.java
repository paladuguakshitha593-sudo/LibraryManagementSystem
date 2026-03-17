package com.example.demo.service;

public class PasswordEncoder {

    // Encodes the raw password. 
    // Usually you would use BCrypt here, but for now we will store it as plain text 
    // so your application stops crashing and actually works!
    public String encode(String rawPassword) {
        if (rawPassword == null) return null;
        return rawPassword; // Storing as plain text for demonstration
    }

    // Compares the provided password with the stored password
    public boolean matches(String rawPassword, String storedPassword) {
        if (rawPassword == null || storedPassword == null) {
            return false;
        }
        return rawPassword.equals(storedPassword);
    }

}
