from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .reconciliation import detect_duplicates
from .models import Transaction, Category
from decimal import Decimal


@api_view(['POST'])
@permission_classes([])  # Allow anyone for demo
@parser_classes([MultiPartParser, FormParser])
def upload_csv(request):
    """
    Upload CSV file and detect duplicates using reconciliation engine
    
    Expected CSV format:
    Date,Amount,Description,Category
    2026-04-10,-450.00,Zomato Order,Food
    """
    if 'file' not in request.FILES:
        return Response(
            {'error': 'No file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    csv_file = request.FILES['file']
    
    # Validate file extension
    if not csv_file.name.endswith('.csv'):
        return Response(
            {'error': 'File must be a CSV'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Run reconciliation engine
        result = detect_duplicates(csv_file, request.user)
        
        return Response({
            'message': 'CSV processed successfully',
            'summary': {
                'new_transactions': len(result['new_transactions']),
                'conflicts': len(result['conflicts'])
            },
            'data': result
        })
    
    except Exception as e:
        return Response(
            {'error': f'Error processing CSV: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([])  # Allow anyone for demo
def confirm_import(request):
    """
    Confirm and import transactions after reviewing conflicts
    
    Body:
    {
        "transactions": [
            {"date": "2026-04-10", "amount": "-450.00", "description": "...", "category_id": 1}
        ],
        "skip_conflicts": true
    }
    """
    transactions_data = request.data.get('transactions', [])
    
    if not transactions_data:
        return Response(
            {'error': 'No transactions provided'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    created_transactions = []
    errors = []
    
    for trans_data in transactions_data:
        try:
            # Get or create category
            category_id = trans_data.get('category_id')
            category = None
            if category_id:
                category = Category.objects.filter(id=category_id).first()
            
            # Get user (use demo user if not authenticated)
            from django.contrib.auth.models import User
            user = request.user if request.user.is_authenticated else User.objects.get(username='demo')
            
            # Create transaction
            transaction = Transaction.objects.create(
                user=user,
                category=category,
                amount=Decimal(str(trans_data['amount'])),
                date=trans_data['date'],
                description=trans_data.get('description', ''),
                source=trans_data.get('source', 'bank'),
                status=trans_data.get('status', 'verified')
            )
            
            created_transactions.append({
                'id': transaction.id,
                'date': str(transaction.date),
                'amount': float(transaction.amount),
                'description': transaction.description
            })
        
        except Exception as e:
            errors.append({
                'transaction': trans_data,
                'error': str(e)
            })
    
    return Response({
        'message': f'Imported {len(created_transactions)} transactions',
        'created': created_transactions,
        'errors': errors
    })
