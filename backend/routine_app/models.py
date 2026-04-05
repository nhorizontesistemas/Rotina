from django.db import models

class Hydration(models.Model):
    date = models.DateField(unique=True)
    goal = models.IntegerField(default=2000) # ml
    consumed = models.IntegerField(default=0) # ml

    def __str__(self):
        return f"{self.date} - {self.consumed}/{self.goal}ml"

class Routine(models.Model):
    name = models.CharField(max_length=255)
    time = models.TimeField(null=True, blank=True)
    icon = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.icon} {self.name}" if self.icon else self.name

class RoutineLog(models.Model):
    routine = models.ForeignKey(Routine, on_delete=models.CASCADE)
    date = models.DateField()
    completed = models.BooleanField(default=False)
    notes = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ('routine', 'date')

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
