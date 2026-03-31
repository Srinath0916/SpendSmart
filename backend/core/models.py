from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    CATEGORY_TYPES = [
        ("income", "Income"),
        ("expense", "Expense"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="categories")
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=CATEGORY_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"
        unique_together = ["user", "name"]

    def __str__(self):
        return f"{self.name} ({self.type})"


class Transaction(models.Model):
    SOURCE_CHOICES = [
        ("cash", "Cash"),
        ("bank", "Bank"),
        ("upi", "UPI"),
    ]

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("verified", "Verified"),
        ("conflict", "Conflict"),
    ]

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="transactions"
    )
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, related_name="transactions"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    description = models.TextField(blank=True)
    source = models.CharField(max_length=10, choices=SOURCE_CHOICES, default="cash")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="verified")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-created_at"]
        indexes = [
            models.Index(fields=["user", "date"]),
            models.Index(fields=["user", "status"]),
        ]

    def __str__(self):
        return f"{self.date} - {self.amount} - {self.description[:30]}"


class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="budgets")
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="budgets"
    )
    limit_amount = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.DateField()  # Store as first day of month
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["user", "category", "month"]

    def __str__(self):
        return f"{self.category.name} - {self.month.strftime('%B %Y')} - ₹{self.limit_amount}"
