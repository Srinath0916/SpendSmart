from django.db import migrations


def create_default_categories(apps, schema_editor):
    """Add default categories to all existing users"""
    User = apps.get_model('auth', 'User')
    Category = apps.get_model('core', 'Category')
    
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
    
    # Create categories for all existing users
    for user in User.objects.all():
        for name, cat_type in default_categories:
            Category.objects.get_or_create(
                user=user,
                name=name,
                defaults={'type': cat_type}
            )


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_usersettings_event'),
    ]

    operations = [
        migrations.RunPython(create_default_categories),
    ]
