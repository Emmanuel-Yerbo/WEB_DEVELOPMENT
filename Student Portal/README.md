# 🎓 Geo University Student Portal

A modern, responsive, and light-themed web application for student registration and admission management, custom-designed for **Geo University**.

* **Live Deployment URL**: [https://web-development-0f8x.onrender.com/](https://web-development-0f8x.onrender.com/)
* **Status**: Deployed & Operational
* **Author**: Emmanuel Yerbo

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [System Directory Structure](#system-directory-structure)
4. [Database Schema Design](#database-schema-design)
5. [Local Development Setup](#local-development-setup)
6. [Production Deployment Configuration](#production-deployment-configuration)
7. [API & Application Routes](#api--application-routes)

---

## Project Overview

The **Geo University Student Portal** is a full-stack Flask application integrated with a PostgreSQL database. It allows prospective students to submit registrations (complete with personal details, geographic information, academic scores, and a profile photo). Admissions officers can review these submissions in an interactive directory table, filter/search entries, paginate records, view a details profile sheet, toggle admission status in real-time via AJAX, and delete obsolete entries along with their local image files.

---

## Key Features

* **🎨 Rich Premium UI**: Clean light-themed design with smooth fade-in entry transitions, hover elevations, custom status badges, and styled system forms.
* **📱 Mobile Responsive Hamburger Menu**: Custom navigation bar that collapses into an animated mobile hamburger overlay on smaller screens.
* **📂 Client-Side Image Preview**: Uses a JavaScript `FileReader` listener to generate an instant upload thumbnail preview before submitting.
* **🔄 Form Input Persistence**: Retains all user inputs and dynamic dropdown states if server-side validation fails.
* **🇬🇭 Ghanaian Regional Selector**: Uses client-side asynchronous JS (`regions.js`) to dynamically populate the 16 Ghanaian regions and filter their corresponding 261 districts/municipalities.
* **📊 Directory Table Filters**: Features real-time query parameters for text searches, gender filtering, status filtering, and maximum WASSCE score ranges.
* **📄 Pagination Controls**: Keeps directories clean by paginating student lists in blocks of 10 records.
* **⚡ Inline Status Toggling (AJAX)**: Allows admissions staff to toggle a student's status (`Undecided`, `Admitted`, `Rejected`) instantly without reloading the page.
* **🗑️ Secure Record Deletion**: Triggers an overlay modal prompt before deleting database records and purging their profile images from the filesystem.

---

## System Directory Structure

```text
Student Portal/
├── app.py                     # Flask backend routing and controllers
├── requirements.txt           # Python package dependencies
├── .python-version            # Locks Render's Python runtime to 3.12.3
├── static/
│   ├── student_portal_hero.png # Landing page illustration
│   ├── css/
│   │   └── style.css          # Global styling framework
│   ├── js/
│   │   └── regions.js         # Dynamic dropdown scripts (Ghana data)
│   └── uploads/
│       └── .gitkeep           # Storage directory for profile pictures
└── templates/
    ├── base.html              # Global navigation, hamburger menu, and footer layout
    ├── landing.html           # Landing page with Call-to-Action button
    ├── form.html              # Registration form (validation, preview, selectors)
    ├── index.html             # Directory table (filters, badges, pagination)
    └── details.html           # Details profile view (AJAX updates, delete confirmation)
```

---

## Database Schema Design

The application utilizes a single PostgreSQL table named `students`. It automatically initializes the table schema on startup if it does not already exist.

```sql
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    date_of_birth VARCHAR(50) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    state_of_origin VARCHAR(100) NOT NULL,    -- Maps to Ghanaian Region
    local_govt VARCHAR(100) NOT NULL,         -- Maps to Ghanaian District/Municipality
    next_of_kin VARCHAR(255) NOT NULL,
    jamb_score INTEGER NOT NULL,               -- Maps to WASSCE Score (Aggregate 6-54)
    image_filename VARCHAR(255) NOT NULL,      -- Relative path to saved profile image
    admission_status VARCHAR(50) DEFAULT 'undecided', -- 'undecided', 'admitted', or 'rejected'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Local Development Setup

### 1. Prerequisites
* Python 3.11 or Python 3.12 installed locally.
* A running local PostgreSQL instance.

### 2. Installation Steps
Clone your repository and navigate into the `Student Portal` folder:
```bash
cd WEB_DEVELOPMENT/"Student Portal"
```

Create a virtual environment and activate it:
```bash
# On Windows:
python -m venv venv
venv\Scripts\activate

# On Mac/Linux:
python3 -m venv venv
source venv/bin/activate
```

Install the required packages:
```bash
pip install -r requirements.txt
```

### 3. Environment Variables
Create a file named `.env` in the `Student Portal/` folder and add your local PostgreSQL connection string:
```env
DATABASE_URL=postgresql://<YOUR_USER>:<YOUR_PASSWORD>@localhost:5432/<YOUR_DB_NAME>
```

### 4. Running the Server
Run the Flask developmental server:
```bash
python app.py
```
Open **`http://127.0.0.1:5000`** in your web browser.

---

## Production Deployment Configuration

This project is configured to run out-of-the-box on **Render.com**:

1. **Root Directory**: `Student Portal`
2. **Runtime**: `Python`
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `gunicorn app:app`
5. **Environment Variable**: Set `DATABASE_URL` under the **Environment** settings page to your Render PostgreSQL connection string.
6. **Python Version Lock**: The `.python-version` file tells Render to install Python `3.12.3`, preventing C-extension conflicts with compiled packages like `psycopg2`.

---

## API & Application Routes

| Route | HTTP Method | Description |
| :--- | :--- | :--- |
| `/` | `GET` | Landing Page with the Call-to-Action button. |
| `/form` | `GET`, `POST` | Renders registration form, validates submissions, saves photos, and inserts into DB. |
| `/students` | `GET` | Displays database records table with sorting, search filters, and page navigation. |
| `/student/<id>` | `GET` | Renders a profile detail sheet for a specific student. |
| `/student/<id>/status` | `POST` | Accepts a JSON payload `{"status": "..."}` to toggle admission status via AJAX. |
| `/student/<id>/delete` | `POST` | Safely deletes the database record and removes the upload photo file. |
