package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.Book;
import com.example.demo.model.BorrowRecord;
import com.example.demo.service.BorrowService;

@RestController
@RequestMapping("/api/borrow")
public class BorrowController {

    @Autowired
    private BorrowService borrowService;

    @PostMapping("/add/{userId}/{bookId}")
    public BorrowRecord borrowBook(
        @PathVariable Long userId, 
        @PathVariable Long bookId,
        @RequestParam(defaultValue = "14") int days
    ) {
        return borrowService.borrowBook(userId, bookId, days);
    }

    @PutMapping("/return/{userId}/{bookId}")
    public BorrowRecord returnBook(@PathVariable Long userId, @PathVariable Long bookId) {
        return borrowService.returnBook(userId, bookId);
    }

    @PostMapping("/pay/{recordId}")
    public BorrowRecord pay(@PathVariable Long recordId) {
        return borrowService.processPayment(recordId);
    }

    @GetMapping("/user-detailed/{userId}")
    public List<Map<String, Object>> getUserDetailedBorrows(@PathVariable Long userId) {
        return borrowService.getUserDetailedBorrows(userId);
    }

    @GetMapping("/user/{userId}")
    public List<BorrowRecord> getUserBorrows(@PathVariable Long userId) {
        return borrowService.getUserBorrows(userId);
    }

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        Map<String, Long> stats = borrowService.getStats();
        // stats.put("ver", 2L); // This might cause a type error if the map is Map<String, Long>
        return stats;
    }

    // Get overdue borrows for a user
    @GetMapping("/overdue/{userId}")
    public List<Map<String, Object>> getOverdueBorrows(@PathVariable Long userId) {
        return borrowService.getOverdueBorrows(userId);
    }

    // Get book recommendations for a user
    @GetMapping("/recommendations/{userId}")
    public List<Book> getRecommendations(@PathVariable Long userId) {
        return borrowService.getRecommendations(userId);
    }

    // Weekly chart data for admin dashboard
    @GetMapping("/chart/weekly")
    public List<Map<String, Object>> getWeeklyChartData() {
        return borrowService.getWeeklyChartData();
    }

    @GetMapping("/check-updated")
    public String checkUpdated() {
        return "Controller Updated: " + System.currentTimeMillis();
    }

    @GetMapping("/all-users-list")
    public List<com.example.demo.model.User> getAllUsers() {
        return borrowService.getAllUsers();
    }

    @GetMapping("/active-users-list")
    public List<com.example.demo.model.User> getUsersWithActiveLoans() {
        return borrowService.getUsersWithActiveLoans();
    }

    @GetMapping("/returned-users-list")
    public List<com.example.demo.model.User> getUsersWithReturnedBooks() {
        return borrowService.getUsersWithReturnedBooks();
    }

    @Autowired
    private com.example.demo.repository.NotificationRepository notificationRepo;

    @GetMapping("/notifications")
    public List<com.example.demo.model.Notification> getNotifications() {
        return notificationRepo.findByIsReadFalseOrderByTimestampDesc();
    }

    @PostMapping("/notifications/read-all")
    public void markAllRead() {
        List<com.example.demo.model.Notification> all = notificationRepo.findByIsReadFalseOrderByTimestampDesc();
        all.forEach(n -> n.setRead(true));
        notificationRepo.saveAll(all);
    }

    @GetMapping("/paid-records")
    public List<Map<String, Object>> getPaidRecords() {
        return borrowService.getPaidUsersDetailed();
    }
}

