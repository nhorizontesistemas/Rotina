from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('routine_app', '0019_desafioitem'),
    ]

    operations = [
        migrations.AddField(
            model_name='desafioitem',
            name='color',
            field=models.CharField(
                choices=[('green', 'Verde'), ('yellow', 'Amarelo'), ('red', 'Vermelho')],
                default='green',
                max_length=10,
            ),
        ),
    ]
