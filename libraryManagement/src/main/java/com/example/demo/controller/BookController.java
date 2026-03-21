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
        return "Database OK! Books count: " + bookService.getAllBooks().size();
    }

    @GetMapping("/all")
    public List<Book> getAllBooks() {
        return bookService.getAllBooks();
    }

    // 2. POST ENDPOINTS
    
    @PostMapping("/add")
    public Book addBook(@RequestBody Book book) {
        return bookService.addBook(book);
    }

    // 3. DYNAMIC PATHS LAST
    
    @GetMapping("/{id}")
    public Book getBookById(@PathVariable Long id) {
        return bookService.getBookById(id)
            .orElseThrow(() -> new RuntimeException("Book not found"));
    }

    @PostMapping("/{id}/like")
    public Book likeBook(@PathVariable Long id) {
        return bookService.likeBook(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok("Book deleted successfully.");
    }
}