package com.example.demo.controller;

import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.demo.service.BookService;
import com.example.demo.service.AIService;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*") // Explicitly allow frontend access
public class AIController {

    @Autowired
    private BookService bookService;

    @Autowired
    private AIService aiService;

    @GetMapping("/debug")
    public Map<String, Object> debug() {
        Map<String, Object> info = new HashMap<>();
        try {
            info.put("status", "Reachable");
            info.put("bookCount", bookService.getAllBooks().size());
            // We can't easily get user count without autowiring UserRepo here, 
            // but let's just check books for now as that's what the AI needs.
            info.put("database", "Connected");
        } catch (Throwable e) {
            info.put("status", "Error");
            info.put("error", e.toString());
        }
        return info;
    }

    @GetMapping("/test")
    public String test() {
        return "AI Controller is reachable. Current Logic Version: " + AIService.LOGIC_VERSION;
    }

    @PostMapping("/chat")
    public Map<String, String> chat(@RequestBody Map<String, String> request) {
        Map<String, String> result = new HashMap<>();
        try {
            String message = request != null ? request.get("message") : null;
            if (message == null) {
                result.put("reply", "I didn't receive a message. How can I help?");
                return result;
            }
            
            String reply = aiService.generateReply(message, bookService.getAllBooks());
            result.put("reply", reply);
        } catch (Throwable e) {
            e.printStackTrace(); // Log to server console
            result.put("reply", "AI SERVER CRITICAL ERROR: " + e.toString());
        }
        return result;
    }
}
