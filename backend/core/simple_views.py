"""
Simple API views for demo purposes
These work without authentication for easy testing
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Transaction, Category
from django.db.models import Sum

@api_view(['GET'])
def health_check(request):
    """Simple endpoint to verify backend is running"""
    return Response({
        'status': 'Backend is running!',
        'message': 'SpendSmart API v1.0'
    })

@api_view(['GET'])
def quick_stats(request):
    """Get quick statistics for demo"""
    total_transactions = Transaction.objects.count()
    total_categories = Category.objects.count()
    
    return Response({
        'total_transactions': total_transactions,
        'total_categories': total_categories,
        'status': 'success'
    })
