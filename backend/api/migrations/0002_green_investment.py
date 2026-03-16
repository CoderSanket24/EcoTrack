from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='GreenInvestment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('investment_id', models.CharField(max_length=100)),
                ('title', models.CharField(max_length=200)),
                ('category', models.CharField(choices=[('energy', 'Energy'), ('transport', 'Transport'), ('waste', 'Waste'), ('other', 'Other')], default='energy', max_length=20)),
                ('description', models.TextField(blank=True)),
                ('current_monthly_kwh', models.FloatField(default=0.0)),
                ('electricity_rate', models.FloatField(default=6.0)),
                ('investment_cost', models.FloatField(default=0.0)),
                ('monthly_savings', models.FloatField(default=0.0)),
                ('annual_savings', models.FloatField(default=0.0)),
                ('annual_co2_reduction_kg', models.FloatField(default=0.0)),
                ('payback_months', models.FloatField(blank=True, null=True)),
                ('roi_percent_5yr', models.FloatField(default=0.0)),
                ('is_implemented', models.BooleanField(default=False)),
                ('implemented_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='green_investments', to=settings.AUTH_USER_MODEL)),
                ('organization', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='green_investments', to='api.organization')),
            ],
            options={'ordering': ['-created_at']},
        ),
    ]
