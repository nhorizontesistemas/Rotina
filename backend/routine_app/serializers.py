from rest_framework import serializers
from .models import Hydration, Routine, RoutineLog, Transaction

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

    class Meta:
        model = RoutineLog
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
