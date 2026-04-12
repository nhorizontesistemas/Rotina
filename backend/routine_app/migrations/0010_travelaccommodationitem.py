from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('routine_app', '0009_travelitineraryitem'),
    ]

    operations = [
        migrations.CreateModel(
            name='TravelAccommodationItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('accommodation_type', models.CharField(max_length=100)),
                ('accommodation_name', models.CharField(max_length=200)),
                ('accommodation_total', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('notes', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('travel_plan', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='accommodation_items', to='routine_app.travelplan')),
            ],
            options={
                'ordering': ['-id'],
            },
        ),
    ]
