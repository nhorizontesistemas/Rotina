from rest_framework import serializers
from .models import Hydration, Routine, RoutineLog, Transaction, TravelPlan, TravelComboItem, TravelItineraryItem, TravelAccommodationItem, BudgetCalculator, BudgetDebt

class HydrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hydration
        fields = '__all__'

class RoutineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Routine
        fields = '__all__'

class RoutineLogSerializer(serializers.ModelSerializer):
    routine_name = serializers.CharField(source='routine.name', read_only=True)
    routine_time = serializers.TimeField(source='routine.time', read_only=True)
    routine_icon = serializers.CharField(source='routine.icon', read_only=True)
    routine_color = serializers.CharField(source='routine.color', read_only=True)

    class Meta:
        model = RoutineLog
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'


class TravelComboItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelComboItem
        fields = '__all__'


class TravelItineraryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelItineraryItem
        fields = '__all__'


class TravelAccommodationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelAccommodationItem
        fields = '__all__'


class TravelPlanSerializer(serializers.ModelSerializer):
    combo_items = TravelComboItemSerializer(many=True, read_only=True)
    itinerary_items = TravelItineraryItemSerializer(many=True, read_only=True)
    accommodation_items = TravelAccommodationItemSerializer(many=True, read_only=True)

    class Meta:
        model = TravelPlan
        fields = '__all__'


class BudgetDebtSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetDebt
        fields = '__all__'

class BudgetCalculatorSerializer(serializers.ModelSerializer):
    debts = BudgetDebtSerializer(many=True, read_only=True)

    class Meta:
        model = BudgetCalculator
        fields = '__all__'
