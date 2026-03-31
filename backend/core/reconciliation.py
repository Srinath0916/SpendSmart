"""
Reconciliation Engine - The Core Innovation of SpendSmart

This module prevents duplicate transactions when the same expense exists in both:
1. Manual cash entry (Quick-Add)
2. Bank CSV upload

Algorithm: Match transactions by Date + Amount
"""

import pandas as pd
from .models import Transaction

def detect_duplicates(csv_file, user):
    """
    Detect potential duplicate transactions from CSV upload
    
    Args:
        csv_file: Uploaded CSV file
        user: Current user object
    
    Returns:
        dict: {
            'new_transactions': [],
            'conflicts': []
        }
    """
    # Parse CSV using Pandas
    df = pd.read_csv(csv_file)
    
    new_transactions = []
    conflicts = []
    
    for index, row in df.iterrows():
        # Check if transaction already exists
        existing = Transaction.objects.filter(
            user=user,
            date=row['Date'],
            amount=row['Amount']
        ).first()
        
        if existing:
            # Potential duplicate found
            conflicts.append({
                'csv_row': {
                    'date': row['Date'],
                    'amount': row['Amount'],
                    'description': row['Description'],
                },
                'existing_transaction': {
                    'id': existing.id,
                    'date': str(existing.date),
                    'amount': float(existing.amount),
                    'description': existing.description,
                    'source': existing.source,
                }
            })
        else:
            # New transaction, safe to add
            new_transactions.append({
                'date': row['Date'],
                'amount': row['Amount'],
                'description': row['Description'],
                'source': 'bank',
                'status': 'verified'
            })
    
    return {
        'new_transactions': new_transactions,
        'conflicts': conflicts
    }
