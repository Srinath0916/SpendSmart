#!/bin/bash

echo "🚀 Setting up SpendSmart Backend..."

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Populate sample data
python manage.py populate_data

echo "✅ Setup complete! Run: python manage.py runserver"
