from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('routine_app', '0007_monthlyfinancestate'),
    ]

    operations = [
        migrations.CreateModel(
            name='TravelPlan',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('destination_name', models.CharField(max_length=200)),
                ('total_distance', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('transport_type', models.CharField(choices=[('CAR', 'Carro'), ('BUS', 'Onibus'), ('PLANE', 'Aviao'), ('VAN', 'Van'), ('OTHER', 'Outro')], default='CAR', max_length=20)),
                ('toll_total', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('fuel_estimate', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('accommodation_type', models.CharField(blank=True, max_length=100, null=True)),
                ('accommodation_name', models.CharField(blank=True, max_length=200, null=True)),
                ('accommodation_total', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-updated_at', '-id'],
            },
        ),
        migrations.CreateModel(
            name='TravelComboItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('item_type', models.CharField(choices=[('TOUR', 'Passeio'), ('SHOP', 'Loja'), ('BREAKFAST', 'Cafe da manha'), ('AFTERNOON_COFFEE', 'Cafe da tarde'), ('LUNCH', 'Almoco'), ('DINNER', 'Jantar'), ('DESSERT', 'Sobremesa')], max_length=30)),
                ('place_name', models.CharField(max_length=200)),
                ('expected_value', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('real_value', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('travel_plan', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='combo_items', to='routine_app.travelplan')),
            ],
            options={
                'ordering': ['-id'],
            },
        ),
    ]
