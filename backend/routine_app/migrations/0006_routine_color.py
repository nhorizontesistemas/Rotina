from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('routine_app', '0005_routine_icon_transaction_icon'),
    ]

    operations = [
        migrations.AddField(
            model_name='routine',
            name='color',
            field=models.CharField(blank=True, max_length=7, null=True),
        ),
    ]
