from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('routine_app', '0010_travelaccommodationitem'),
    ]

    operations = [
        migrations.AddField(
            model_name='travelitineraryitem',
            name='value',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
    ]
