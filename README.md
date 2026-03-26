# 📚 Library Management System

A modern, full-stack Library Management System built with **Spring Boot** and **React**. This project features secure JWT authentication, real-time borrow tracking, and a sleek user dashboard for managing your reading activity.

## 🚀 Live Demo
- **Frontend:** [Your Vercel URL here]
- **Backend API:** `https://librarymanagementsystem-4-gi0b.onrender.com`

---

## ✨ Features

### For Users
- **Secure Authentication:** Register and login with JWT-protected sessions.
- **Book Catalog:** Browse available books with categories and stock tracking.
- **Borrowing System:** Borrow books with real-time cost calculation and customized durations.
- **Dashboard:** Track your active borrows, returned books, and overdue alerts.
- **AI Recommendations:** Get personalized book suggestions based on your reading history.

### For Admins
- **Dashboard Overview:** View project-wide statistics and interactive charts.
- **Inventory Management:** Add, update, or remove books from the library.
- **User Activity:** Monitor borrowing patterns and manage return records.
- **Notifications:** Real-time updates on book returns and library activity.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Axios, Lucide React (Icons), Recharts (Data Viz), Vanilla CSS.
- **Backend:** Spring Boot 3.3, Java 17, Spring Security, JWT (JJWT), Spring Data JPA.
- **Database:** MySQL.
- **Deployment:** Vercel (Frontend), Render (Backend).

---

## 📦 Project Structure

```text
LibraryManagementSystem/
├── frontend/             # React application (Vite)
│   ├── src/              # Page components and state management
│   ├── vercel.json       # Vercel routing configuration
│   └── package.json
├── libraryManagement/   # Spring Boot backend
│   ├── src/              # Controller, Service, and Repository layers
│   ├── pom.xml           # Maven dependencies
│   └── .env              # Local environment variables
└── vercel.json          # Root-level deployment config
```

---

## ⚙️ Setup & Installation

### Local Backend Setup
1. Navigate to `libraryManagement/`.
2. Configure your MySQL database in `src/main/resources/application.properties`.
3. Set your environment variables:
   - `DB_URL`: Your MySQL JDBC URL.
   - `DB_USERNAME`: Database username.
   - `DB_PASSWORD`: Database password.
   - `JWT_SECRET`: A secure random string for token signing.
4. Run `./mvnw spring-boot:run`.

### Local Frontend Setup
1. Navigate to `frontend/`.
2. Run `npm install`.
3. Create a `.env` file and set `VITE_API_BASE_URL=http://localhost:8080/api`.
4. Run `npm run dev`.

---

## 🌐 Deployment Notes

### Vercel (Frontend)
Ensure the **Root Directory** is set to `frontend` (or use the root `vercel.json`). Add the `VITE_API_BASE_URL` environment variable pointing to your Render backend.

### Render (Backend)
The backend is Dockerized (or uses Maven auto-build). Ensure `JWT_SECRET` and database credentials are set in the Render Dashboard environment variables.

---

## 📝 License
This project is for educational purposes as part of a portfolio project.
