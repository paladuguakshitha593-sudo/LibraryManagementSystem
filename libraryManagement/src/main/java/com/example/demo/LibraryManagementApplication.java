package com.example.demo;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class LibraryManagementApplication {

	public static void main(String[] args) {

		Dotenv dotenv = Dotenv.configure()
				.ignoreIfMissing()
				.load();

		// Map .env keys to the placeholders used in application.properties
		String dbUrl = dotenv.get("DB_URL");
		if (dbUrl == null) dbUrl = dotenv.get("url"); // fallback

		String dbUser = dotenv.get("DB_USERNAME");
		if (dbUser == null) dbUser = dotenv.get("username"); // fallback

		String dbPass = dotenv.get("DB_PASSWORD");
		if (dbPass == null) dbPass = dotenv.get("password"); // fallback

		if (dbUrl != null) System.setProperty("DB_URL", dbUrl);
		if (dbUser != null) System.setProperty("DB_USERNAME", dbUser);
		if (dbPass != null) System.setProperty("DB_PASSWORD", dbPass);

		// Also load JWT secret if present
		String jwtSecret = dotenv.get("JWT_SECRET");
		if (jwtSecret != null) System.setProperty("JWT_SECRET", jwtSecret);

		SpringApplication.run(LibraryManagementApplication.class, args);
	}

}
