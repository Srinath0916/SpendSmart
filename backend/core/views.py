from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum
from .models import Category, Transaction, Budget
from .serializers import CategorySerializer, TransactionSerializer, BudgetSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    
    def get_queryset(self):
        # Filter by category if provided
        queryset = Transaction.objects.all().order_by('-date')
        category = self.request.query_params.get('category', None)
        source = self.request.query_params.get('source', None)
        
        if category:
            queryset = queryset.filter(category__name=category)
        if source:
            queryset = queryset.filter(source=source)
            
        return queryset

class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer

@api_view(['GET'])
def dashboard_stats(request):
    """
    Calculate dashboard statistics
    """
    transactions = Transaction.objects.filter(status='verified')
    
    # Calculate totals
    income = transactions.filter(category__type='income').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    expenses = transactions.filter(category__type='expense').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    balance = income - abs(expenses)
    
    return Response({
        'balance': balance,
        'income': income,
        'expenses': abs(expenses),
        'transaction_count': transactions.count()
    })
