from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Category, UserSettings


@receiver(post_save, sender=User)
def create_default_categories(sender, instance, created, **kwargs):
    """
    Automatically create default categories when a new user is created
    """
    if created:
        # Create default expense categories
        default_categories = [
            ('Food', 'expense'),
            ('Travel', 'expense'),
            ('Shopping', 'expense'),
            ('Utilities', 'expense'),
            ('Housing', 'expense'),
            ('Entertainment', 'expense'),
            ('Healthcare', 'expense'),
            ('Education', 'expense'),
            ('Income', 'income'),
            ('Salary', 'income'),
            ('Freelance', 'income'),
            ('Investment', 'income'),
        ]
        
        for name, cat_type in default_categories:
            Category.objects.get_or_create(
                user=instance,
                name=name,
                defaults={'type': cat_type}
            )
        
        # Create default user settings
        UserSettings.objects.get_or_create(
            user=instance,
            defaults={'starting_balance': 0}
        )
