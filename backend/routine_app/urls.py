from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HydrationViewSet, RoutineViewSet, RoutineLogViewSet, TransactionViewSet

router = DefaultRouter()
router.register(r'hydration', HydrationViewSet)
router.register(r'routines', RoutineViewSet)
router.register(r'logs', RoutineLogViewSet)
router.register(r'transactions', TransactionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
