from rest_framework import viewsets
from .models import Hydration, Routine, RoutineLog, Transaction, MonthlyFinanceState
from .serializers import HydrationSerializer, RoutineSerializer, RoutineLogSerializer, TransactionSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import date, timedelta
from calendar import monthrange

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

    def _replicate_fixed_expenses_for_month(self, target_date):
        state, created = MonthlyFinanceState.objects.get_or_create(
            year=target_date.year,
            month=target_date.month,
        )

        if not created:
            return state

        month_already_has_fixed_expenses = Transaction.objects.filter(
            category='FIXED_EXPENSE',
            date__year=target_date.year,
            date__month=target_date.month,
        ).exists()

        if month_already_has_fixed_expenses:
            return state

        previous_month_last_day = target_date.replace(day=1) - timedelta(days=1)
        previous_month_expenses = Transaction.objects.filter(
            category='FIXED_EXPENSE',
            date__year=previous_month_last_day.year,
            date__month=previous_month_last_day.month,
        ).order_by('id')

        if not previous_month_expenses.exists():
            return state

        last_day_of_target_month = monthrange(target_date.year, target_date.month)[1]
        replicated_expenses = []

        for expense in previous_month_expenses:
            replicated_day = min(expense.date.day, last_day_of_target_month)
            replicated_expenses.append(Transaction(
                description=expense.description,
                amount=expense.amount,
                category='FIXED_EXPENSE',
                date=target_date.replace(day=replicated_day),
                is_completed=False,
                notes=expense.notes,
                icon=expense.icon,
            ))

        Transaction.objects.bulk_create(replicated_expenses)
        return state

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

        self._replicate_fixed_expenses_for_month(target_date)
            
        transactions = Transaction.objects.filter(
            date__year=target_date.year,
            date__month=target_date.month
        ).order_by('-date', '-id')
        
        serializer = self.get_serializer(transactions, many=True)
        return Response(serializer.data)
