from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('routine_app', '0018_budgetcalculator_budgetdebt'),
    ]

    operations = [
        migrations.CreateModel(
            name='DesafioItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('number', models.IntegerField(unique=True)),
                ('notes', models.TextField(blank=True, default='')),
                ('is_marked', models.BooleanField(default=False)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['number'],
            },
        ),
    ]
