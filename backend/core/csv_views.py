from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from .pdf_parser import parse_pdf_statement
from .models import Transaction, Category
from decimal import Decimal
import pandas as pd


@api_view(['POST'])
@permission_classes([])
@parser_classes([MultiPartParser, FormParser])
def upload_statement(request):
    """
    Upload CSV or PDF bank statement and detect duplicates
    
    Expected CSV format:
    Date,Amount,Description,Category
    2026-04-10,-450.00,Zomato Order,Food
    
    PDF: Automatically extracts Date, Amount, Description
    Password: Optional 'password' field for encrypted PDFs
    """
    if 'file' not in request.FILES:
        return Response(
            {'error': 'No file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    uploaded_file = request.FILES['file']
    file_name = uploaded_file.name.lower()
    password = request.data.get('password', None)  # Get password if provided
    
    try:
        # Parse based on file type
        if file_name.endswith('.pdf'):
            # Parse PDF with optional password
            transactions_data = parse_pdf_statement(uploaded_file, password=password)
            if not transactions_data:
                return Response(
                    {'error': 'No transactions found in PDF'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif file_name.endswith('.csv'):
            # Parse CSV
            df = pd.read_csv(uploaded_file)
            transactions_data = []
            for _, row in df.iterrows():
                transactions_data.append({
                    'date': row['Date'],
                    'amount': row['Amount'],
                    'description': row.get('Description', 'Transaction')
                })
        else:
            return Response(
                {'error': 'File must be CSV or PDF'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check for duplicates
        new_transactions = []
        conflicts = []
        
        for trans_data in transactions_data:
            # Check if transaction already exists
            existing = Transaction.objects.filter(
                date=trans_data['date'],
                amount=trans_data['amount']
            ).first()
            
            if existing:
                # Conflict found
                conflicts.append({
                    'uploaded': {
                        'date': trans_data['date'],
                        'amount': trans_data['amount'],
                        'description': trans_data['description'],
                    },
                    'existing': {
                        'id': existing.id,
                        'date': str(existing.date),
                        'amount': str(existing.amount),
                        'description': existing.description,
                        'source': existing.source,
                        'category_name': existing.category.name if existing.category else None
                    }
                })
            else:
                # New transaction
                new_transactions.append(trans_data)
        
        return Response({
            'message': 'File processed successfully',
            'file_type': 'pdf' if file_name.endswith('.pdf') else 'csv',
            'summary': {
                'total': len(transactions_data),
                'new_transactions': len(new_transactions),
                'conflicts': len(conflicts)
            },
            'data': {
                'new_transactions': new_transactions,
                'conflicts': conflicts
            }
        })
    
    except Exception as e:
        error_msg = str(e)
        return Response(
            {'error': f'Error processing file: {error_msg}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([])
def resolve_conflicts(request):
    """
    Resolve conflicts with user choices
    
    Body:
    {
        "new_transactions": [...],  # Import these
        "conflict_resolutions": [
            {"existing_id": 1, "action": "keep_existing"},  # or "replace" or "keep_both"
            ...
        ]
    }
    """
    new_transactions = request.data.get('new_transactions', [])
    conflict_resolutions = request.data.get('conflict_resolutions', [])
    
    from django.contrib.auth.models import User
    user = request.user if request.user.is_authenticated else User.objects.get(username='demo')
    
    created = []
    updated = []
    errors = []
    
    # Handle new transactions
    for trans_data in new_transactions:
        try:
            transaction = Transaction.objects.create(
                user=user,
                amount=Decimal(str(trans_data['amount'])),
                date=trans_data['date'],
                description=trans_data.get('description', ''),
                source='bank',
                status='verified'
            )
            created.append({
                'id': transaction.id,
                'description': transaction.description,
                'amount': str(transaction.amount)
            })
        except Exception as e:
            errors.append({'transaction': trans_data, 'error': str(e)})
    
    # Handle conflict resolutions
    for resolution in conflict_resolutions:
        try:
            existing_id = resolution['existing_id']
            action = resolution['action']
            uploaded_data = resolution['uploaded_data']
            
            if action == 'replace':
                # Replace existing transaction
                transaction = Transaction.objects.get(id=existing_id)
                transaction.description = uploaded_data['description']
                transaction.amount = Decimal(str(uploaded_data['amount']))
                transaction.date = uploaded_data['date']
                transaction.source = 'bank'
                transaction.save()
                updated.append({'id': transaction.id, 'action': 'replaced'})
            
            elif action == 'keep_both':
                # Create new transaction alongside existing
                transaction = Transaction.objects.create(
                    user=user,
                    amount=Decimal(str(uploaded_data['amount'])),
                    date=uploaded_data['date'],
                    description=uploaded_data['description'] + ' (from upload)',
                    source='bank',
                    status='verified'
                )
                created.append({
                    'id': transaction.id,
                    'description': transaction.description,
                    'amount': str(transaction.amount)
                })
            
            # If 'keep_existing', do nothing
        
        except Exception as e:
            errors.append({'resolution': resolution, 'error': str(e)})
    
    return Response({
        'message': 'Conflicts resolved successfully',
        'created': len(created),
        'updated': len(updated),
        'errors': len(errors),
        'details': {
            'created': created,
            'updated': updated,
            'errors': errors
        }
    })
