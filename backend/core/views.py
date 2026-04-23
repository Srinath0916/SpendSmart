from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.db.models import Sum
from .models import Category, Transaction, Budget, UserSettings, Event
from .serializers import CategorySerializer, TransactionSerializer, BudgetSerializer, UserSettingsSerializer, EventSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def perform_create(self, serializer):
        # Automatically assign user when creating category
        from django.contrib.auth.models import User
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            user, created = User.objects.get_or_create(
                username='demo',
                defaults={'email': 'demo@example.com'}
            )
            serializer.save(user=user)

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
    
    def perform_create(self, serializer):
        # Automatically assign user when creating transaction
        from django.contrib.auth.models import User
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            # Try to get or create demo user for unauthenticated requests
            user, created = User.objects.get_or_create(
                username='demo',
                defaults={'email': 'demo@example.com'}
            )
            serializer.save(user=user)

class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    
    def perform_create(self, serializer):
        # Automatically assign user when creating budget
        from django.contrib.auth.models import User
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            user, created = User.objects.get_or_create(
                username='demo',
                defaults={'email': 'demo@example.com'}
            )
            serializer.save(user=user)

class UserSettingsViewSet(viewsets.ModelViewSet):
    serializer_class = UserSettingsSerializer

    def get_queryset(self):
        from django.contrib.auth.models import User
        if self.request.user.is_authenticated:
            return UserSettings.objects.filter(user=self.request.user)
        user, created = User.objects.get_or_create(
            username='demo',
            defaults={'email': 'demo@example.com'}
        )
        return UserSettings.objects.filter(user=user)

    def perform_create(self, serializer):
        from django.contrib.auth.models import User
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            user, created = User.objects.get_or_create(
                username='demo',
                defaults={'email': 'demo@example.com'}
            )
            serializer.save(user=user)

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current user's settings"""
        from django.contrib.auth.models import User
        if request.user.is_authenticated:
            user = request.user
        else:
            user, created = User.objects.get_or_create(
                username='demo',
                defaults={'email': 'demo@example.com'}
            )
        settings, created = UserSettings.objects.get_or_create(user=user)
        serializer = self.get_serializer(settings)
        return Response(serializer.data)

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer

    def get_queryset(self):
        from django.contrib.auth.models import User
        if self.request.user.is_authenticated:
            return Event.objects.filter(user=self.request.user)
        user, created = User.objects.get_or_create(
            username='demo',
            defaults={'email': 'demo@example.com'}
        )
        return Event.objects.filter(user=user)

    def perform_create(self, serializer):
        from django.contrib.auth.models import User
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            user, created = User.objects.get_or_create(
                username='demo',
                defaults={'email': 'demo@example.com'}
            )
            serializer.save(user=user)

    @action(detail=True, methods=['get'])
    def transactions(self, request, pk=None):
        """Get all transactions for this event's date range"""
        from django.contrib.auth.models import User
        event = self.get_object()
        if request.user.is_authenticated:
            user = request.user
        else:
            user, created = User.objects.get_or_create(
                username='demo',
                defaults={'email': 'demo@example.com'}
            )
        
        transactions = Transaction.objects.filter(
            user=user,
            date__gte=event.start_date,
            date__lte=event.end_date
        )
        
        serializer = TransactionSerializer(transactions, many=True)
        
        # Calculate totals
        total_spent = sum(abs(float(t.amount)) for t in transactions if float(t.amount) < 0)
        
        return Response({
            'event': EventSerializer(event).data,
            'transactions': serializer.data,
            'summary': {
                'budget': float(event.budget),
                'spent': total_spent,
                'remaining': float(event.budget) - total_spent,
                'transaction_count': transactions.count()
            }
        })

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
