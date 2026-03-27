package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.BorrowRecord;

@Repository
public interface BorrowRepo extends JpaRepository<BorrowRecord, Long> {

    // Active borrows = returnDate is null
    long countByReturnDateIsNull();

    // Returned books = returnDate is set
    long countByReturnDateIsNotNull();

    // Get all borrow records for a specific user
    List<BorrowRecord> findByUserId(Long userId);

    // Check if a user has already borrowed this book (and not returned it)
    boolean existsByUserIdAndBookIdAndReturnDateIsNull(Long userId, Long bookId);

    // Get all paid borrow records
    List<BorrowRecord> findByIsPaidTrue();
}