from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Organization',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('org_id', models.CharField(db_index=True, max_length=50, unique=True)),
                ('name', models.CharField(max_length=100)),
                ('admin_name', models.CharField(max_length=100)),
                ('email', models.EmailField(blank=True, max_length=254, null=True, unique=True)),
                ('org_pin', models.CharField(default='202510', max_length=6)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Achievement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('icon', models.CharField(max_length=50)),
                ('tier', models.CharField(choices=[('bronze', 'Bronze'), ('silver', 'Silver'), ('gold', 'Gold')], default='bronze', max_length=10)),
                ('condition_key', models.CharField(max_length=100, unique=True)),
                ('xp_reward', models.IntegerField(default=50)),
            ],
        ),
        migrations.CreateModel(
            name='EmailVerification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('otp', models.CharField(max_length=6)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_verified', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('profile_name', models.CharField(blank=True, max_length=100, unique=True)),
                ('first_name', models.CharField(blank=True, max_length=100, null=True)),
                ('last_name', models.CharField(blank=True, max_length=100, null=True)),
                ('phone_no', models.CharField(blank=True, max_length=20, null=True)),
                ('city', models.CharField(blank=True, max_length=100, null=True)),
                ('state', models.CharField(blank=True, max_length=100, null=True)),
                ('department', models.CharField(blank=True, choices=[('IT', 'IT'), ('HR', 'Human Resources'), ('Sales', 'Sales'), ('Marketing', 'Marketing'), ('Operations', 'Operations'), ('Finance', 'Finance'), ('Engineering', 'Engineering'), ('Legal', 'Legal'), ('Other', 'Other')], default=None, max_length=50, null=True)),
                ('carbon_budget_kg', models.FloatField(default=500.0)),
                ('total_emission_kg', models.FloatField(default=0.0)),
                ('avg_daily_emission_kg', models.FloatField(default=0.0)),
                ('level', models.IntegerField(default=1)),
                ('xp', models.IntegerField(default=0)),
                ('current_streak', models.IntegerField(default=0)),
                ('last_activity_date', models.DateField(blank=True, null=True)),
                ('joined_at', models.DateTimeField(auto_now_add=True)),
                ('eco_coins', models.IntegerField(default=0)),
                ('is_iot_connected', models.BooleanField(default=False)),
                ('sustainability_score', models.IntegerField(default=0)),
                ('is_email_verified', models.BooleanField(default=False)),
                ('organization', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='members', to='api.organization')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Community',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('type', models.CharField(choices=[('University', 'University'), ('Corporate', 'Corporate'), ('Neighborhood', 'Neighborhood')], max_length=50)),
                ('image', models.ImageField(blank=True, null=True, upload_to='community_images/')),
                ('image_url', models.URLField(blank=True, null=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('total_community_emission', models.FloatField(default=0.0)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_communities', to=settings.AUTH_USER_MODEL)),
                ('members', models.ManyToManyField(blank=True, related_name='joined_communities', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Challenge',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('target_metric', models.CharField(choices=[('emission_reduction', 'Emission Reduction'), ('activity_count', 'Log Count')], max_length=50)),
                ('target_value', models.FloatField()),
                ('start_date', models.DateField()),
                ('end_date', models.DateField()),
                ('reward_xp', models.IntegerField(default=100)),
                ('community', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='challenges', to='api.community')),
            ],
        ),
        migrations.CreateModel(
            name='UserAchievement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_earned', models.DateTimeField(auto_now_add=True)),
                ('achievement', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.achievement')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='achievements', to=settings.AUTH_USER_MODEL)),
            ],
            options={'unique_together': {('user', 'achievement')}},
        ),
        migrations.CreateModel(
            name='UserChallengeProgress',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('current_value', models.FloatField(default=0.0)),
                ('is_completed', models.BooleanField(default=False)),
                ('challenge', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.challenge')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Activity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(choices=[('transport', 'Transportation'), ('energy', 'Home Energy'), ('food', 'Food'), ('consumption', 'Purchases'), ('waste', 'Waste')], max_length=20)),
                ('description', models.CharField(max_length=255)),
                ('value', models.FloatField()),
                ('unit', models.CharField(max_length=20)),
                ('carbon_footprint_kg', models.FloatField()),
                ('timestamp', models.DateTimeField(default=django.utils.timezone.now)),
                ('source', models.CharField(choices=[('manual', 'Manual'), ('iot', 'IoT Device'), ('chatbot_pending', 'Chatbot (Pending)'), ('chatbot_processed', 'Chatbot (Processed)')], default='manual', max_length=20)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='activities', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        # ── Compliance Models ──────────────────────────────────────────────────
        migrations.CreateModel(
            name='ComplianceThreshold',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('daily_limit_kg', models.FloatField(default=50.0)),
                ('monthly_limit_kg', models.FloatField(default=1200.0)),
                ('carbon_tax_rate', models.FloatField(default=40.0)),
                ('warning_threshold_percent', models.FloatField(default=80.0)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='compliance_threshold', to=settings.AUTH_USER_MODEL)),
                ('organization', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='compliance_threshold', to='api.organization')),
            ],
        ),
        migrations.AddConstraint(
            model_name='compliancethreshold',
            constraint=models.CheckConstraint(
                check=models.Q(user__isnull=False) | models.Q(organization__isnull=False),
                name='threshold_user_or_org',
            ),
        ),
        migrations.CreateModel(
            name='ComplianceViolation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(default=django.utils.timezone.now)),
                ('period_type', models.CharField(choices=[('daily', 'Daily'), ('monthly', 'Monthly')], max_length=10)),
                ('period_date', models.DateField()),
                ('measured_co2_kg', models.FloatField()),
                ('allowed_limit_kg', models.FloatField()),
                ('excess_emission_kg', models.FloatField()),
                ('carbon_tax_rate', models.FloatField()),
                ('penalty_amount', models.FloatField()),
                ('compliance_status', models.CharField(choices=[('green', 'Green - Within Limit'), ('yellow', 'Yellow - Near Threshold'), ('red', 'Red - Exceeded Threshold')], max_length=10)),
                ('alert_sent', models.BooleanField(default=False)),
                ('alert_sent_at', models.DateTimeField(blank=True, null=True)),
                ('notes', models.TextField(blank=True)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='violations', to=settings.AUTH_USER_MODEL)),
                ('organization', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='violations', to='api.organization')),
            ],
            options={'ordering': ['-timestamp']},
        ),
        migrations.AddIndex(
            model_name='complianceviolation',
            index=models.Index(fields=['user', '-timestamp'], name='api_complia_user_id_idx'),
        ),
        migrations.AddIndex(
            model_name='complianceviolation',
            index=models.Index(fields=['compliance_status'], name='api_complia_status_idx'),
        ),
        migrations.AddIndex(
            model_name='complianceviolation',
            index=models.Index(fields=['period_date'], name='api_complia_period_idx'),
        ),
        migrations.CreateModel(
            name='ComplianceAlert',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('alert_type', models.CharField(choices=[('warning', 'Warning - Near Threshold'), ('violation', 'Violation - Exceeded Threshold'), ('critical', 'Critical - Severe Violation')], max_length=10)),
                ('message', models.TextField()),
                ('is_read', models.BooleanField(default=False)),
                ('is_dismissed', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('read_at', models.DateTimeField(blank=True, null=True)),
                ('violation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='alerts', to='api.complianceviolation')),
            ],
            options={'ordering': ['-created_at']},
        ),
    ]
