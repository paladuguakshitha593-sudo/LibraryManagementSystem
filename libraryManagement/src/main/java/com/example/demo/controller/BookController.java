package com.example.demo.controller;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.model.Book;
import com.example.demo.service.BookService;

@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookService bookService;

    // 1. STATIC PATHS FIRST (to avoid /{id} conflicts)
    
    @GetMapping("/test")
    public String test() {
        return "Backend is alive! Version 5.2 (AI Linkage Test)";
    }

    @GetMapping("/ai-diag")
    public String aiDiag() {
        return "BookController AI Diagnostic: Use this if /api/ai is failing.";
    }

    @GetMapping("/test-db")
    public String testDb() {
        try {
            return "Database OK! Books count: " + bookService.getAllBooks().size();
        } catch (Throwable e) {
            return "DB ERROR: " + e.getMessage();
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllBooks() {
        try {
            return ResponseEntity.ok(bookService.getAllBooks());
        } catch (Throwable e) {
            return ResponseEntity.ok("SERVICE ERROR: " + e.getMessage());
        }
    }

    // 2. POST ENDPOINTS
    
    @PostMapping("/add")
    public Book addBook(@RequestBody Book book) {
        return bookService.addBook(book);
    }

    // 3. DYNAMIC PATHS LAST
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(bookService.getBookById(id));
        } catch (Throwable e) {
            return ResponseEntity.ok("ERROR: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> likeBook(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(bookService.likeBook(id));
        } catch (Throwable e) {
            return ResponseEntity.ok("ERROR: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBook(@PathVariable Long id) {
        try {
            bookService.deleteBook(id);
            return ResponseEntity.ok("Book deleted successfully.");
        } catch (Throwable e) {
            return ResponseEntity.ok("ERROR: " + e.getMessage());
        }
    }
}