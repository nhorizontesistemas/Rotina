from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('routine_app', '0011_travelitineraryitem_value'),
    ]

    operations = [
        migrations.AddField(
            model_name='travelaccommodationitem',
            name='expected_value',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name='travelaccommodationitem',
            name='real_value',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name='travelitineraryitem',
            name='expected_value',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name='travelitineraryitem',
            name='real_value',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
    ]
