from django.db import models

class Hydration(models.Model):
    date = models.DateField(unique=True)
    goal = models.IntegerField(default=3000) # ml
    consumed = models.IntegerField(default=0) # ml

    def __str__(self):
        return f"{self.date} - {self.consumed}/{self.goal}ml"

class Routine(models.Model):
    name = models.CharField(max_length=255)
    time = models.TimeField(null=True, blank=True)
    icon = models.CharField(max_length=20, null=True, blank=True)
    color = models.CharField(max_length=7, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.icon} {self.name}" if self.icon else self.name

class RoutineLog(models.Model):
    routine = models.ForeignKey(Routine, on_delete=models.CASCADE)
    date = models.DateField()
    completed = models.BooleanField(default=False)
    notes = models.TextField(null=True, blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        unique_together = ('routine', 'date')
        ordering = ['order']

    def __str__(self):
        return f"{self.routine.name} on {self.date}: {self.completed}"

class Transaction(models.Model):
    CATEGORY_CHOICES = [
        ('EARNING', 'Ganho'),
        ('FIXED_EXPENSE', 'Gasto Fixo'),
        ('DAILY_EXPENSE', 'Gasto Diário'),
    ]
    description = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    date = models.DateField()
    is_completed = models.BooleanField(default=False)
    notes = models.TextField(null=True, blank=True)
    icon = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return f"{self.icon} {self.description} ({self.category})" if self.icon else f"{self.description} ({self.category})"


class MonthlyFinanceState(models.Model):
    year = models.IntegerField()
    month = models.PositiveSmallIntegerField()
    initialized_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('year', 'month')

    def __str__(self):
        return f"{self.month:02d}/{self.year}"


class TravelPlan(models.Model):
    TRANSPORT_CHOICES = [
        ('CAR', 'Carro'),
        ('BUS', 'Onibus'),
        ('PLANE', 'Aviao'),
        ('VAN', 'Van'),
        ('OTHER', 'Outro'),
    ]

    destination_name = models.CharField(max_length=200)
    departure_date = models.DateField(null=True, blank=True)
    return_date = models.DateField(null=True, blank=True)
    total_distance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    transport_type = models.CharField(max_length=20, choices=TRANSPORT_CHOICES, default='CAR')
    toll_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fuel_estimate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    accommodation_type = models.CharField(max_length=100, blank=True, null=True)
    accommodation_name = models.CharField(max_length=200, blank=True, null=True)
    accommodation_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at', '-id']

    def __str__(self):
        return self.destination_name


class TravelComboItem(models.Model):
    ITEM_TYPE_CHOICES = [
        ('TOUR', 'Passeio'),
        ('SHOP', 'Loja'),
        ('BREAKFAST', 'Cafe da manha'),
        ('AFTERNOON_COFFEE', 'Cafe da tarde'),
        ('LUNCH', 'Almoco'),
        ('DINNER', 'Jantar'),
        ('DESSERT', 'Sobremesa'),
    ]

    travel_plan = models.ForeignKey(TravelPlan, on_delete=models.CASCADE, related_name='combo_items')
    item_type = models.CharField(max_length=30, choices=ITEM_TYPE_CHOICES)
    place_name = models.CharField(max_length=200)
    expected_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    real_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-id']

    def __str__(self):
        return f"{self.place_name} - {self.item_type}"


class TravelItineraryItem(models.Model):
    ITEM_TYPE_CHOICES = [
        ('BREAKFAST', 'Cafe da manha'),
        ('AFTERNOON', 'Cafe da tarde'),
        ('TOUR', 'Ponto turistico'),
        ('SHOP', 'Lojas'),
        ('LUNCH', 'Almoco'),
        ('DINNER', 'Jantar'),
        ('DESSERT', 'Sobremesa'),
        ('OTHER', 'Outros'),
    ]

    travel_plan = models.ForeignKey(TravelPlan, on_delete=models.CASCADE, related_name='itinerary_items')
    event_date = models.DateField(null=True, blank=True)
    event_time = models.TimeField(null=True, blank=True)
    item_type = models.CharField(max_length=30, choices=ITEM_TYPE_CHOICES)
    description = models.CharField(max_length=200)
    is_completed = models.BooleanField(default=False)
    value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    expected_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    real_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(null=True, blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['event_date', 'order', 'id']

    def __str__(self):
        return f"{self.description} - {self.item_type}"


class TravelAccommodationItem(models.Model):
    travel_plan = models.ForeignKey(TravelPlan, on_delete=models.CASCADE, related_name='accommodation_items')
    event_date = models.DateField(null=True, blank=True)
    event_time = models.TimeField(null=True, blank=True)
    entry_date = models.DateField(null=True, blank=True)
    exit_date = models.DateField(null=True, blank=True)
    checkin_time = models.TimeField(null=True, blank=True)
    checkout_time = models.TimeField(null=True, blank=True)
    accommodation_type = models.CharField(max_length=100)
    accommodation_name = models.CharField(max_length=200)
    is_completed = models.BooleanField(default=False)
    accommodation_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    expected_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    real_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(null=True, blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['entry_date', 'order', 'id']

    def __str__(self):
        return f"{self.accommodation_name} - {self.accommodation_type}"


class BudgetCalculator(models.Model):
    name = models.CharField(max_length=255)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class BudgetDebt(models.Model):
    budget = models.ForeignKey(BudgetCalculator, on_delete=models.CASCADE, related_name='debts')
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.description} - {self.amount}"


class DesafioItem(models.Model):
    COLOR_CHOICES = [('green', 'Verde'), ('yellow', 'Amarelo'), ('red', 'Vermelho')]

    number = models.IntegerField(unique=True)
    notes = models.TextField(blank=True, default='')
    is_marked = models.BooleanField(default=False)
    color = models.CharField(max_length=10, choices=COLOR_CHOICES, default='green')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['number']

    def __str__(self):
        return f"Desafio {self.number}"
