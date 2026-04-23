from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, TransactionViewSet, BudgetViewSet, UserSettingsViewSet, EventViewSet, dashboard_stats
from .simple_views import health_check, quick_stats, analytics_data
from .auth_views import register, login, logout, change_password
from .csv_views import upload_statement, resolve_conflicts

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'budgets', BudgetViewSet)
router.register(r'settings', UserSettingsViewSet, basename='settings')
router.register(r'events', EventViewSet, basename='events')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard-stats/', dashboard_stats, name='dashboard-stats'),
    path('health/', health_check, name='health-check'),
    path('quick-stats/', quick_stats, name='quick-stats'),
    path('analytics/', analytics_data, name='analytics-data'),
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/logout/', logout, name='logout'),
    path('auth/change-password/', change_password, name='change-password'),
    path('statement/upload/', upload_statement, name='statement-upload'),
    path('statement/resolve/', resolve_conflicts, name='statement-resolve'),
]
