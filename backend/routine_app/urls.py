from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HydrationViewSet, RoutineViewSet, RoutineLogViewSet, TransactionViewSet, TravelPlanViewSet, TravelComboItemViewSet, TravelItineraryItemViewSet, TravelAccommodationItemViewSet

router = DefaultRouter()
router.register(r'hydration', HydrationViewSet)
router.register(r'routines', RoutineViewSet)
router.register(r'logs', RoutineLogViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'travel-plans', TravelPlanViewSet)
router.register(r'travel-combo-items', TravelComboItemViewSet)
router.register(r'travel-itinerary-items', TravelItineraryItemViewSet)
router.register(r'travel-accommodation-items', TravelAccommodationItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
