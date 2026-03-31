from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, TransactionViewSet, BudgetViewSet, dashboard_stats
from .simple_views import health_check, quick_stats

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'budgets', BudgetViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard-stats/', dashboard_stats, name='dashboard-stats'),
    path('health/', health_check, name='health-check'),
    path('quick-stats/', quick_stats, name='quick-stats'),
]
