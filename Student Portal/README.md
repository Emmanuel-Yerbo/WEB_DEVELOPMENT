# Geo University Student Portal

A modern, light-themed web application for student registration and admission management, developed for **Geo University**.

## Features

- **Responsive Landing Page**: Clean portal introduction with modern illustrations.
- **Student Registration Form**: Two-column responsive layout for entering student personal, geographical (Ghanaian Regions & Districts), and academic information (WASSCE scores). Includes live image preview.
- **Form Data Persistence**: Form inputs are preserved on backend validation errors, so users don't have to re-enter data.
- **Ghanaian Regional Selector**: Interactive dropdown populated with all 16 Ghanaian regions and their corresponding 261 districts/municipalities.
- **Records List**: Table view displaying registered students, including status badges, inline searching, and filter options (by gender, status, and WASSCE aggregate score).
- **Pagination**: Supports clean page navigation (10 records per page).
- **Student Profile details**: Profile page showing complete student information with a custom status sidebar card.
- **Asynchronous Status Updates**: Admissions officers can update student status (Admitted/Rejected/Undecided) inline via AJAX without page reloads.
- **Delete Functionality**: Admins can safely delete student records along with their uploaded headshots via a confirmation modal.

## Tech Stack

- **Backend**: Python 3.12+, Flask
- **Database**: PostgreSQL (with automatic database & table schema creation on startup)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla ES6)

## Setup & Running Instructions

1. **Clone & Navigate**:
   ```bash
   cd WEB_DEVELOPMENT
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Database**:
   Create a `.env` file in the root directory (or modify the existing one) with your PostgreSQL connection URL:
   ```ini
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/student_portal
   ```

4. **Run Application**:
   ```bash
   python app.py
   ```
   Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your browser.
