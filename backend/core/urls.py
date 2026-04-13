from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, TransactionViewSet, BudgetViewSet, dashboard_stats
from .simple_views import health_check, quick_stats
from .auth_views import register, login, logout
from .csv_views import upload_csv, confirm_import

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'budgets', BudgetViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard-stats/', dashboard_stats, name='dashboard-stats'),
    path('health/', health_check, name='health-check'),
    path('quick-stats/', quick_stats, name='quick-stats'),
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/logout/', logout, name='logout'),
    path('csv/upload/', upload_csv, name='csv-upload'),
    path('csv/confirm/', confirm_import, name='csv-confirm'),
]
