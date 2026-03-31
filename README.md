# SpendSmart: Intelligent Expense & Budget Visualization Dashboard

A modern web application for personal finance management with bulk CSV import and smart duplicate detection.

## 🎯 Problem Statement

Managing personal finances is tedious due to scattered data across multiple apps and the burden of manual entry. SpendSmart solves this with a hybrid tracking system combining bulk CSV uploads and quick-add interface, powered by a smart reconciliation engine.

## ✨ Key Features

- **Hybrid Data Entry:** Bulk CSV upload + Quick-add button for cash expenses
- **Smart Reconciliation:** Automatic duplicate detection prevents double-counting
- **Visual Dashboard:** Interactive charts for spending trends and category breakdown
- **Budget Tracking:** Set limits with real-time progress monitoring
- **Transaction Management:** Filter by category, source, and date range

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Tailwind CSS
- Recharts
- React Router
- Vite

**Backend:**
- Django 4.2
- Django REST Framework
- Pandas (CSV processing)
- PostgreSQL / SQLite

## 🚀 Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit: http://localhost:3000

### Backend (Setup pending)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## 👨‍💻 Developer

**Mattapalli Srinath Rao**  
Roll No: 240410700077  
2nd Year, SEM-4  
OJT Project - 2024
