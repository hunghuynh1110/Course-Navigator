# UQ Course Navigator

![Python Version](https://img.shields.io/badge/python-3.13-blue)
![React Version](https://img.shields.io/badge/react-19-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**UQ Course Navigator** is a comprehensive academic planning tool for University of Queensland (UQ) students. It goes beyond simple course listings by visualizing complex prerequisite chains, enabling students to plan their semesters strategically and calculate their GPA targets.

---

👉 **Live Demo:** [https://uq_course-navigator.vercel.app](https://uq-course-navigator.vercel.app/?courses=%5B%5D&page=1)

---

## 🌟 Key Features

---

- ** Interactive Dependency Graphs:** Visualizes course hierarchies (Prerequisites, Incompatible, Companion) using a force-directed graph (React Flow + ELK). Handles circular dependencies gracefully.
- ** Real-time Search:** Instant search across thousands of courses and programs using Supabase text search.
- ** Grade Calculator:** Built-in tool to calculate required scores for final exams based on continuous assessment weightings.
- ** Responsive Grid Layout:** Optimized interface that switches between Data Grid (Desktop) and Card View (Mobile).
- ** Optimized Performance:** Implements server-side pagination and caching to render large datasets with zero lag.

---

##  Architecture & Tech Stack

### Frontend (Client)

- **Framework:** React 19 + Vite (Fast HMR)
- **Language:** TypeScript
- **Routing:** TanStack Router (Type-safe file-based routing)
- **UI System:** Material UI (MUI v6) + Lucide Icons
- **State Management:** React Hooks + Supabase Realtime
- **Visualization:** React Flow + Dagre/ELK (Auto-layout algorithms)

### Backend & Data Pipeline

- **Database:** PostgreSQL (managed by Supabase)
- **ORM/API:** Supabase JS Client (Restful & Realtime)
- **Scraper:** Python 3.13 (Requests, BeautifulSoup4, Selenium)
  - _Features:_ Recursive crawling, deadlock detection, multi-threaded fetching.

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **PNPM** (Recommended) or NPM
- **Python** (v3.10 or higher)
- **Git**

---

##  Local Development Guide

### 1. Database Setup (Supabase)

This project requires a Supabase project.

1.  Create a new project at [database.new](https://database.new).
2.  Go to the **SQL Editor** in Supabase and run the schema scripts found in `database/init.sql` (or manually create `courses`, `programs`, and `program_courses` tables).
3.  **Important:** Enable Row Level Security (RLS) and create a policy to allow `SELECT` for the `anon` role.

### 2. Frontend Setup

Navigate to the client directory and install dependencies:

```bash
cd client
pnpm install
```

Configuration: Create a **.env** file in the **client/** directory:

```bash
# client/.env
VITE_SUPABASE_URL= "https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY= "your-public-anon-key"
```

Run the development server:

```bash
pnpm run dev
```

## Contributing
1. Fork the repository.

2. Create your feature branch (git checkout -b feature/NewFeature).

3. Commit your changes.

4. Push to the branch.

5. Open a Pull Request.


### 📄 License
Distributed under the MIT License.

---

Developed by Hung Huynh
