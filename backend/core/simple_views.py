"""
Simple API views for demo purposes
These work without authentication for easy testing
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Transaction, Category, UserSettings
from django.db.models import Sum
from django.contrib.auth.models import User
from decimal import Decimal
from datetime import datetime, timedelta
from collections import defaultdict

@api_view(['GET'])
def health_check(request):
    """Simple endpoint to verify backend is running"""
    return Response({
        'status': 'Backend is running!',
        'message': 'SpendSmart API v1.0'
    })

@api_view(['GET'])
def quick_stats(request):
    """Get quick statistics for dashboard with dynamic balance"""
    from django.contrib.auth.models import User
    if request.user.is_authenticated:
        user = request.user
    else:
        user, created = User.objects.get_or_create(
            username='demo',
            defaults={'email': 'demo@example.com'}
        )
    
    # Get user settings for starting balance
    settings, _ = UserSettings.objects.get_or_create(user=user)
    starting_balance = settings.starting_balance
    
    # Get all transactions
    transactions = Transaction.objects.filter(user=user)
    
    # Calculate expenses and income separately
    total_expenses = Decimal('0')
    total_income = Decimal('0')
    
    for trans in transactions:
        if trans.amount < 0:  # Expenses
            total_expenses += abs(trans.amount)
        elif trans.amount > 0:  # Income
            total_income += trans.amount
    
    # Balance = starting balance - expenses (income not added to balance)
    total_balance = starting_balance - total_expenses
    
    return Response({
        'total_balance': float(total_balance),
        'monthly_income': float(total_income),  # Track income separately for display
        'monthly_expenses': float(total_expenses),
        'starting_balance': float(starting_balance),
        'total_transactions': transactions.count(),
        'status': 'success'
    })

@api_view(['GET'])
def analytics_data(request):
    """Get analytics data with time filters"""
    from django.contrib.auth.models import User
    if request.user.is_authenticated:
        user = request.user
    else:
        user, created = User.objects.get_or_create(
            username='demo',
            defaults={'email': 'demo@example.com'}
        )
    time_filter = request.GET.get('filter', 'month')  # week, month, year, all
    
    # Calculate date range
    today = datetime.now().date()
    if time_filter == 'week':
        start_date = today - timedelta(days=7)
    elif time_filter == 'month':
        start_date = today - timedelta(days=30)
    elif time_filter == 'year':
        start_date = today - timedelta(days=365)
    else:  # all
        start_date = None
    
    # Get transactions
    transactions = Transaction.objects.filter(user=user)
    if start_date:
        transactions = transactions.filter(date__gte=start_date)
    
    # Group by date for chart
    daily_data = defaultdict(lambda: {'income': 0, 'expenses': 0})
    for trans in transactions:
        date_str = trans.date.strftime('%Y-%m-%d')
        if trans.amount >= 0:
            daily_data[date_str]['income'] += float(trans.amount)
        else:
            daily_data[date_str]['expenses'] += abs(float(trans.amount))
    
    # Convert to chart format
    chart_data = []
    for date_str in sorted(daily_data.keys()):
        chart_data.append({
            'date': date_str,
            'income': daily_data[date_str]['income'],
            'expenses': daily_data[date_str]['expenses'],
            'net': daily_data[date_str]['income'] - daily_data[date_str]['expenses']
        })
    
    # Calculate best/worst months
    monthly_data = defaultdict(lambda: {'income': 0, 'expenses': 0})
    all_transactions = Transaction.objects.filter(user=user)
    
    for trans in all_transactions:
        month_key = trans.date.strftime('%Y-%m')
        if trans.amount >= 0:
            monthly_data[month_key]['income'] += float(trans.amount)
        else:
            monthly_data[month_key]['expenses'] += abs(float(trans.amount))
    
    # Find best and worst months
    best_month = None
    worst_month = None
    best_savings = float('-inf')
    worst_savings = float('inf')
    
    for month, data in monthly_data.items():
        savings = data['income'] - data['expenses']
        if savings > best_savings:
            best_savings = savings
            best_month = {'month': month, 'savings': savings}
        if savings < worst_savings:
            worst_savings = savings
            worst_month = {'month': month, 'savings': savings}
    
    return Response({
        'chart_data': chart_data,
        'best_month': best_month,
        'worst_month': worst_month
    })
