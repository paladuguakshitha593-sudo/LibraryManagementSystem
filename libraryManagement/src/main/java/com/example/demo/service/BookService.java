package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Book;
import com.example.demo.repository.BookRepository;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepo;

    public Book addBook(Book book) {
        return bookRepo.save(book);
    }

    public List<Book> getAllBooks() {
        return bookRepo.findAll();
    }

    public Optional<Book> getBookById(Long id) {
        return bookRepo.findById(id);
    }

    public void deleteBook(Long id) {
        bookRepo.deleteById(id);
    }

    public Book likeBook(Long id) {
        Book book = bookRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Book not found"));
        Integer currentLikes = book.getLikes();
        book.setLikes((currentLikes == null ? 0 : currentLikes) + 1);
        return bookRepo.save(book);
    }
}