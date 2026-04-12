from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('routine_app', '0006_routine_color'),
    ]

    operations = [
        migrations.CreateModel(
            name='MonthlyFinanceState',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.IntegerField()),
                ('month', models.PositiveSmallIntegerField()),
                ('initialized_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'unique_together': {('year', 'month')},
            },
        ),
    ]
