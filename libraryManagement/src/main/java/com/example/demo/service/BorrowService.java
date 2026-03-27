package com.example.demo.service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Book;
import com.example.demo.model.BorrowRecord;
import com.example.demo.repository.BookRepository;
import com.example.demo.repository.BorrowRepo;
import com.example.demo.repository.UserRepo;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.model.Notification;
import com.example.demo.model.User;

@Service
public class BorrowService {

    @Autowired
    private BorrowRepo borrowRepo;

    @Autowired
    private BookRepository bookRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private NotificationRepository notificationRepo;

    // Borrow a book with custom duration and cost calculation
    public BorrowRecord borrowBook(Long userId, Long bookId, int days) {
        if (borrowRepo.existsByUserIdAndBookIdAndReturnDateIsNull(userId, bookId)) {
            throw new RuntimeException("You have already borrowed this book.");
        }
        Book book = bookRepo.findById(bookId).orElseThrow(() -> new RuntimeException("Book not found."));
        
        if (book.getQuantity() <= 0) {
            throw new RuntimeException("Book is out of stock.");
        }

        BorrowRecord record = new BorrowRecord();
        record.setUserId(userId);
        record.setBookId(bookId);
        record.setBorrowDate(LocalDate.now());
        record.setReturnDate(null);
        record.setRequestedDays(days);
        
        // Calculate total cost (Price is daily rate)
        Double dailyRate = (book.getPrice() != null) ? book.getPrice() : 0.0;
        record.setTotalCost(dailyRate * days);
        
        // Decrement stock
        book.setQuantity(book.getQuantity() - 1);
        bookRepo.save(book);

        return borrowRepo.save(record);
    }

    // Return a book
    public BorrowRecord returnBook(Long userId, Long bookId) {
        List<BorrowRecord> records = borrowRepo.findByUserId(userId);
        Optional<BorrowRecord> activeRecord = records.stream()
            .filter(r -> r.getBookId().equals(bookId) && r.getReturnDate() == null)
            .findFirst();
        if (activeRecord.isEmpty()) {
            throw new RuntimeException("No active borrow record found for this book.");
        }
        BorrowRecord record = activeRecord.get();
        record.setReturnDate(LocalDate.now());
        
        // Increment stock
        Book book = bookRepo.findById(bookId).orElse(null);
        if (book != null) {
            book.setQuantity(book.getQuantity() + 1);
            bookRepo.save(book);
            
            // Notification for Admin
            User user = userRepo.findById(userId).orElse(null);
            String userName = (user != null) ? user.getUsername() : "User " + userId;
            notificationRepo.save(new Notification("Book '" + book.getTitle() + "' was returned by " + userName));
        }

        return borrowRepo.save(record);
    }

    // Process payment
    public BorrowRecord processPayment(Long recordId) {
        BorrowRecord record = borrowRepo.findById(recordId)
            .orElseThrow(() -> new RuntimeException("Record not found."));
        record.setPaid(true);
        return borrowRepo.save(record);
    }

    // Get detailed history with book titles
    public List<Map<String, Object>> getUserDetailedBorrows(Long userId) {
        List<BorrowRecord> records = borrowRepo.findByUserId(userId);
        List<Map<String, Object>> detailed = new ArrayList<>();
        
        for (BorrowRecord r : records) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("userId", r.getUserId());
            map.put("bookId", r.getBookId());
            map.put("borrowDate", r.getBorrowDate());
            map.put("returnDate", r.getReturnDate());
            map.put("totalCost", r.getTotalCost());
            map.put("requestedDays", r.getRequestedDays());
            map.put("isPaid", r.isPaid());
            
            bookRepo.findById(r.getBookId()).ifPresent(b -> {
                map.put("bookTitle", b.getTitle());
                map.put("bookAuthor", b.getAuthor());
                
                // Calculate due date
                int days = (r.getRequestedDays() != null && r.getRequestedDays() > 0) ? r.getRequestedDays() : 14;
                LocalDate dueDate = r.getBorrowDate().plusDays(days);
                map.put("dueDate", dueDate.toString());
            });
            
            detailed.add(map);
        }
        return detailed;
    }

    // Get all borrows for a user
    public List<BorrowRecord> getUserBorrows(Long userId) {
        return borrowRepo.findByUserId(userId);
    }

    // Check overdue borrows for a user
    public List<Map<String, Object>> getOverdueBorrows(Long userId) {
        List<BorrowRecord> records = borrowRepo.findByUserId(userId);
        List<Map<String, Object>> overdue = new ArrayList<>();

        for (BorrowRecord r : records) {
            if (r.getReturnDate() != null) continue;
            Optional<Book> bookOpt = bookRepo.findById(r.getBookId());
            if (bookOpt.isEmpty()) continue;
            Book book = bookOpt.get();
            
            // Prioritize record's requested days, fallback to book's default, fallback to 14
            int days = (r.getRequestedDays() != null && r.getRequestedDays() > 0) ? r.getRequestedDays() : 
                      (book.getBorrowDays() != null && book.getBorrowDays() > 0 ? book.getBorrowDays() : 14);
            LocalDate dueDate = r.getBorrowDate().plusDays(days);
            if (LocalDate.now().isAfter(dueDate)) {
                Map<String, Object> alert = new HashMap<>();
                alert.put("bookId", book.getId());
                alert.put("title", book.getTitle());
                alert.put("borrowDate", r.getBorrowDate().toString());
                alert.put("dueDate", dueDate.toString());
                overdue.add(alert);
            }
        }
        return overdue;
    }

    // Book recommendations for a user (by category of previously borrowed books)
    public List<Book> getRecommendations(Long userId) {
        List<BorrowRecord> records = borrowRepo.findByUserId(userId);
        Set<Long> borrowedBookIds = records.stream().map(BorrowRecord::getBookId).collect(Collectors.toSet());

        // Get categories of borrowed books
        Set<String> categories = borrowedBookIds.stream()
            .map(id -> bookRepo.findById(id))
            .filter(Optional::isPresent)
            .map(opt -> opt.get().getCategory())
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

        // Find books in same categories not yet borrowed
        return bookRepo.findAll().stream()
            .filter(b -> !borrowedBookIds.contains(b.getId()))
            .filter(b -> b.getCategory() != null && categories.contains(b.getCategory()))
            .limit(6)
            .collect(Collectors.toList());
    }

    // Dashboard stats
    public Map<String, Long> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalBooks", bookRepo.count());
        stats.put("totalUsers", userRepo.count());
        stats.put("activeBorrows", borrowRepo.countByReturnDateIsNull());
        stats.put("returnedBooks", borrowRepo.countByReturnDateIsNotNull());
        return stats;
    }

    // Get all users
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    // Get users with active loans
    public List<User> getUsersWithActiveLoans() {
        List<Long> userIds = borrowRepo.findAll().stream()
            .filter(r -> r.getReturnDate() == null)
            .map(BorrowRecord::getUserId)
            .distinct()
            .collect(Collectors.toList());
        return userRepo.findAllById(userIds);
    }

    // Get users with returned books
    public List<User> getUsersWithReturnedBooks() {
        List<Long> userIds = borrowRepo.findAll().stream()
            .filter(r -> r.getReturnDate() != null)
            .map(BorrowRecord::getUserId)
            .distinct()
            .collect(Collectors.toList());
        return userRepo.findAllById(userIds);
    }

    // Weekly borrow chart data for admin (last 7 days)
    public List<Map<String, Object>> getWeeklyChartData() {
        List<Map<String, Object>> result = new ArrayList<>();
        List<BorrowRecord> allRecords = borrowRepo.findAll();

        for (int i = 6; i >= 0; i--) {
            LocalDate day = LocalDate.now().minusDays(i);
            final LocalDate finalDay = day;

            long borrows = allRecords.stream()
                .filter(r -> r.getBorrowDate() != null && r.getBorrowDate().equals(finalDay))
                .count();
            long returns = allRecords.stream()
                .filter(r -> r.getReturnDate() != null && r.getReturnDate().equals(finalDay))
                .count();

            Map<String, Object> point = new LinkedHashMap<>();
            point.put("date", day.toString());
            point.put("borrows", borrows);
            point.put("returns", returns);
            result.add(point);
        }
        return result;
    }

    // Get list of paid borrow records with user and book details
    public List<Map<String, Object>> getPaidUsersDetailed() {
        List<BorrowRecord> records = borrowRepo.findByIsPaidTrue();
        List<Map<String, Object>> detailed = new ArrayList<>();
        
        for (BorrowRecord r : records) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("userId", r.getUserId());
            map.put("bookId", r.getBookId());
            map.put("borrowDate", r.getBorrowDate());
            map.put("returnDate", r.getReturnDate());
            map.put("totalCost", r.getTotalCost());
            map.put("isPaid", r.isPaid());
            
            userRepo.findById(r.getUserId()).ifPresent(u -> {
                map.put("userName", u.getUsername());
                map.put("userEmail", u.getEmail());
            });
            
            bookRepo.findById(r.getBookId()).ifPresent(b -> {
                map.put("bookTitle", b.getTitle());
            });
            
            detailed.add(map);
        }
        return detailed;
    }
}

