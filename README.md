<br />
<div align="center">
  <a href="#">
    <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="Logo" width="80" height="80">
  </a>

  <h1 align="center">LuxeWay - Premium Vehicle Rental Platform</h1>

  <p align="center">
    <strong>A modern, high-performance e-commerce platform for seamless vehicle rentals.</strong>
    <br />
    <br />
    <a href="#-about-the-project">Explore the docs</a>
    ·
    <a href="#-features">View Features</a>
    ·
    <a href="#-getting-started">Getting Started</a>
  </p>
</div>

<!-- Badges -->
<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Spring_Boot-F2F4F9?style=for-the-badge&logo=spring-boot" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/SQL_Server-CC292B?style=for-the-badge&logo=microsoft-sql-server&logoColor=white" alt="SQL Server" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <br />
  📑 **Swagger API Docs:** http://localhost:8080/swagger-ui/index.html
</div>

<hr />

## 📖 About The Project

**LuxeWay** is a production-ready, highly secure, and scalable e-commerce platform designed to bridge the gap between vehicle owners and customers. Built with modern web technologies, it ensures a seamless booking experience while providing powerful fleet management tools.

### 🎯 Core Objectives
- Deliver a frictionless, premium UI/UX.
- Ensure high availability and fast response times.
- Implement bank-grade security for user data and transactions.

---

## ✨ Features

- **🚗 Advanced Vehicle Search:** Filter by type, brand, price, and availability in real-time.
- **🔐 Secure Authentication:** JWT-based authentication with encrypted password storage.
- **💳 Seamless Booking Workflow:** Interactive booking process with state management.
- **👑 Role-based Access Control:**
  - `Admin`: Full platform analytics and management.
  - `Owner`: Fleet oversight, booking approvals, and revenue tracking.
  - `Customer`: Easy rentals, profile management, and review system.
- **📈 Real-time Analytics:** Dashboard with key metrics for business owners.

---

## 🏗 System Architecture

The application follows a modern client-server architecture with separation of concerns:

- **Frontend Application:** React.js Single Page Application (SPA) utilizing Vite for lightning-fast HMR and optimized builds. State managed efficiently with modern hooks.
- **Backend Service:** Spring Boot RESTful API ensuring robust business logic, transaction management, and security constraints.
- **Persistence Layer:** Relational database management using Microsoft SQL Server for data integrity and complex querying.

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18.x or newer)
- Java Development Kit (JDK 17)
- Microsoft SQL Server
- Maven

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nguyendang2005/LuxeWay.git
   cd LuxeWay
   ```

2. **Configure Environment Variables**
   - Copy the `.env.example` file and rename it to `.env`.
   - Update the variables (Database credentials, JWT secret keys, etc.) to match your local configuration.
   > **Warning:** Do not expose your `.env` file or commit it to version control.

3. **Database Initialization**
   - Execute the SQL scripts provided in `src/Back_end/import-data.sql` to initialize schemas.

4. **Start the Backend Server**
   ```bash
   cd src/Back_end
   mvn spring-boot:run
   ```

5. **Start the Frontend Client**
   ```bash
   cd src/Front_end
   npm install
   npm run dev
   ```

---

## 🛡️ Security Guidelines

Security is treated as a first-class citizen in LuxeWay. We enforce:
- No hardcoded secrets.
- Environment-based configuration.
- Robust input validation and sanitization.

For detailed security deployment steps, refer to our comprehensive deployment guides included in the repository.

---

## 👨‍💻 Creator

<a href="https://github.com/Nguyendang2005">
  <img src="https://github.com/Nguyendang2005.png" width="60" style="border-radius:50%" alt="Nguyendang2005"/>
</a>

**Nguyễn Văn Dạng** - *Lead Engineer & Creator*

[![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?style=flat&logo=github)](https://github.com/Nguyendang2005)

---

<p align="center">
  <i>Crafted with passion for building scalable systems.</i>
</p>
