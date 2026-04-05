from rest_framework import viewsets
from .models import Hydration, Routine, RoutineLog, Transaction
from .serializers import HydrationSerializer, RoutineSerializer, RoutineLogSerializer, TransactionSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import date

class HydrationViewSet(viewsets.ModelViewSet):
    queryset = Hydration.objects.all()
    serializer_class = HydrationSerializer

    @action(detail=False, methods=['get'])
    def today(self, request):
        target_date = request.query_params.get('date', str(date.today()))
        hydration, created = Hydration.objects.get_or_create(date=target_date)
        serializer = self.get_serializer(hydration)
        return Response(serializer.data)

class RoutineViewSet(viewsets.ModelViewSet):
    queryset = Routine.objects.all()
    serializer_class = RoutineSerializer

class RoutineLogViewSet(viewsets.ModelViewSet):
    queryset = RoutineLog.objects.all()
    serializer_class = RoutineLogSerializer

    @action(detail=False, methods=['get'])
    def daily(self, request):
        target_date = request.query_params.get('date', date.today())
        logs = RoutineLog.objects.filter(date=target_date).select_related('routine')
        serializer = self.get_serializer(logs, many=True)
        return Response(serializer.data)

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    @action(detail=False, methods=['get'])
    def by_date(self, request):
        target_date = request.query_params.get('date', str(date.today()))
        transactions = Transaction.objects.filter(date=target_date)
        serializer = self.get_serializer(transactions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_month(self, request):
        target_date_str = request.query_params.get('date', str(date.today()))
        try:
            target_date = date.fromisoformat(target_date_str)
        except ValueError:
            target_date = date.today()
            
        transactions = Transaction.objects.filter(
            date__year=target_date.year,
            date__month=target_date.month
        ).order_by('-date', '-id')
        
        serializer = self.get_serializer(transactions, many=True)
        return Response(serializer.data)
