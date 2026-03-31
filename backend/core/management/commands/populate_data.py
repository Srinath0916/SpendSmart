from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Category, Transaction, Budget
from datetime import date, timedelta
from decimal import Decimal

class Command(BaseCommand):
    help = 'Populate database with sample data for demo'

    def handle(self, *args, **kwargs):
        # Create demo user
        user, created = User.objects.get_or_create(
            username='demo',
            defaults={'email': 'demo@spendsmart.com'}
        )
        if created:
            user.set_password('demo123')
            user.save()
            self.stdout.write(self.style.SUCCESS('Created demo user'))

        # Create categories
        categories_data = [
            ('Food', 'expense'),
            ('Travel', 'expense'),
            ('Rent', 'expense'),
            ('Entertainment', 'expense'),
            ('Shopping', 'expense'),
            ('Income', 'income'),
        ]
        
        categories = {}
        for name, cat_type in categories_data:
            cat, _ = Category.objects.get_or_create(
                user=user,
                name=name,
                defaults={'type': cat_type}
            )
            categories[name] = cat
        
        self.stdout.write(self.style.SUCCESS(f'Created {len(categories)} categories'))

        # Create sample transactions
        today = date.today()
        transactions_data = [
            (today, 'Zomato Order', -450, 'Food', 'upi'),
            (today - timedelta(days=1), 'Uber Ride', -180, 'Travel', 'bank'),
            (today - timedelta(days=1), 'Grocery Shopping', -820, 'Food', 'cash'),
            (today - timedelta(days=2), 'Salary Credit', 30000, 'Income', 'bank'),
            (today - timedelta(days=3), 'Coffee', -120, 'Food', 'cash'),
            (today - timedelta(days=4), 'Netflix', -199, 'Entertainment', 'bank'),
            (today - timedelta(days=5), 'Petrol', -500, 'Travel', 'upi'),
        ]
        
        for trans_date, desc, amount, cat_name, source in transactions_data:
            Transaction.objects.get_or_create(
                user=user,
                date=trans_date,
                description=desc,
                defaults={
                    'amount': Decimal(str(amount)),
                    'category': categories[cat_name],
                    'source': source,
                    'status': 'verified'
                }
            )
        
        self.stdout.write(self.style.SUCCESS(f'Created sample transactions'))

        # Create budgets
        Budget.objects.get_or_create(
            user=user,
            category=categories['Food'],
            month=date(today.year, today.month, 1),
            defaults={'limit_amount': Decimal('5000')}
        )
        
        self.stdout.write(self.style.SUCCESS('Database populated successfully!'))
