package com.example.demo.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import com.example.demo.model.Book;

@Service
public class AIService {
    public static final String LOGIC_VERSION = "5.3-STABLE";

    public String generateReply(String message, List<Book> allBooks) {
        if (allBooks == null) {
            return "I'm sorry, I cannot access the library database (CONNECTION ERROR). Please check your password in application.properties.";
        }
        if (allBooks.isEmpty()) {
            System.out.println("AI: Database is connected but the 'book' table is empty!");
        }
        if (message == null) {
            return "I didn't receive a message. How can I help?";
        }
        String msg = message.toLowerCase();
        
        // 1. Mood Detection
        if (msg.contains("sad") || msg.contains("lonely") || msg.contains("depressed")) {
            return "I'm sorry to hear that. Reading is a great way to lift your spirits! I recommend 'The Hitchhiker's Guide to the Galaxy' for some humor, or a good Fiction book to escape into another world. Would you like a fiction recommendation?";
        }
        if (msg.contains("happy") || msg.contains("good mood")) {
            return "That's wonderful! To celebrate your good mood, how about a light-hearted story or a fascinating book on Science?";
        }

        // 2. Direct Genre / Recommendation Check
        if (msg.contains("recommend") || msg.contains("suggest") || msg.contains("want") || 
            msg.contains("recommand") || msg.contains("book") || 
            msg.contains("science") || msg.contains("fiction") || msg.contains("engineering") || msg.contains("history") || msg.contains("horror")) {
            return handleRecommendations(msg, allBooks);
        }
        
        // 3. Greeting & General
        if (msg.contains("hello") || msg.contains("hi") || msg.contains("hey")) {
            return "Hello! I am your AI Librarian. I can help you find books, suggest categories, or answer questions about our collection. What are you looking for today?";
        } else if (msg.contains("how many") && msg.contains("books")) {
            return "We currently have " + allBooks.size() + " books in our library. You can browse them all in the catalog!";
        } else if (msg.contains("price") || msg.contains("cost") || msg.contains("how much")) {
            return "Our books have different daily rates (like ₹5/day). You can see the specific rate on each book card!";
        } else {
            return "I'm here to help you find the perfect book! Try asking 'Give me a fiction recommendation' or 'What science books do we have?'";
        }
    }

    private String handleRecommendations(String message, List<Book> books) {
        System.out.println("AI: Handling recommendations for: " + message);
        if (books == null) {
            return "I'm sorry, I cannot access the books list right now.";
        }
        System.out.println("AI: Total books available: " + books.size());

        String category = null;
        if (message.contains("science")) category = "science";
        else if (message.contains("engineering")) category = "engineering";
        else if (message.contains("fiction") || message.contains("story")) category = "fiction";
        else if (message.contains("history")) category = "history";
        else if (message.contains("horror") || message.contains("scary")) category = "horror";

        List<Book> filtered = new ArrayList<>();
        if (category != null) {
            String target = category.toLowerCase();
            for (Book b : books) {
                if (b.getCategory() != null && b.getCategory().toLowerCase().contains(target)) {
                    filtered.add(b);
                    if (filtered.size() >= 3) break;
                }
            }
        } else {
            List<Book> shuffleList = new ArrayList<>(books);
            Collections.shuffle(shuffleList);
            for (int i = 0; i < Math.min(3, shuffleList.size()); i++) {
                filtered.add(shuffleList.get(i));
            }
        }

        if (filtered.isEmpty()) {
            return "I couldn't find any books in that category, but you can explore our full catalog!";
        }

        StringBuilder sb = new StringBuilder("I found some great options: ");
        for (int i = 0; i < filtered.size(); i++) {
            Book b = filtered.get(i);
            sb.append("'").append(b.getTitle()).append("' by ").append(b.getAuthor());
            if (i < filtered.size() - 1) sb.append(", ");
        }
        sb.append(". They are highly recommended!");
        return sb.toString();
    }
}
