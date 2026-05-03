#!/bin/bash
# Run migrations
python manage.py migrate --noinput

# Start gunicorn
gunicorn spendsmart.wsgi:application
