from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
import uuid

class Organization(models.Model):
    org_id = models.CharField(max_length=50, unique=True, db_index=True, help_text="Unique Secret Key for the Organization")
    name = models.CharField(max_length=100)
    admin_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True, null=True, blank=True) # Making null=True initially to avoid defaults issue on existing rows, or provide default
    org_pin = models.CharField(max_length=6, default="202510", help_text="6-digit PIN for Org Login")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.org_id})"

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    # --- Link to Organization ---
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True, related_name='members')

    # --- Existing Fields (Unchanged) ---
    profile_name = models.CharField(max_length=100, unique=True, blank=True)
    first_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    phone_no = models.CharField(max_length=20, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    
    DEPARTMENT_CHOICES = [
        ('IT', 'IT'),
        ('HR', 'Human Resources'),
        ('Sales', 'Sales'),
        ('Marketing', 'Marketing'),
        ('Operations', 'Operations'),
        ('Finance', 'Finance'),
        ('Engineering', 'Engineering'),
        ('Legal', 'Legal'),
        ('Other', 'Other'),
    ]
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES, null=True, blank=True, default=None)

    carbon_budget_kg = models.FloatField(default=500.0)
    total_emission_kg = models.FloatField(default=0.0, help_text="Lifetime emission")
    avg_daily_emission_kg = models.FloatField(default=0.0, help_text="Used for Heatmap coloring")

    level = models.IntegerField(default=1)
    xp = models.IntegerField(default=0) # Experience Points
    current_streak = models.IntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)

    # Metadata
    joined_at = models.DateTimeField(auto_now_add=True)

    # --- NEW ADDITIONS (Novelty Features) ---
    
    # 1. Virtual Currency (Wallet)
    eco_coins = models.IntegerField(default=0, help_text="Currency earned via sustainable actions. Can be spent on rewards.")
    
    # 2. IoT Integration Status
    is_iot_connected = models.BooleanField(default=False, help_text="True if the user has linked a hardware energy meter.")
    
    # 3. Sustainability Score (Gamification)
    sustainability_score = models.IntegerField(default=0, help_text="A normalized score (0-100) indicating user eco-performance.")

    # 4. Email Verification
    is_email_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.profile_name

class EmailVerification(models.Model):
    email = models.EmailField(unique=True)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.email} - {'Verified' if self.is_verified else 'Pending'}"

# --- Signals (Unchanged) ---
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        # Generate a unique profile name
        unique_name = f"user_{uuid.uuid4().hex[:8]}"
        Profile.objects.create(user=instance, profile_name=unique_name)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


# --- 2. ACHIEVEMENTS & BADGES (Static Definitions) ---
class Achievement(models.Model):
    TIER_CHOICES = [('bronze', 'Bronze'), ('silver', 'Silver'), ('gold', 'Gold')]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, help_text="FontAwesome class e.g. 'fas fa-leaf'")
    tier = models.CharField(max_length=10, choices=TIER_CHOICES, default='bronze')
    
    # The Logic Key (Important!)
    condition_key = models.CharField(max_length=100, unique=True, 
                                     help_text="Code reference, e.g., 'log_7_days_streak'")
    xp_reward = models.IntegerField(default=50)

    def __str__(self):
        return f"{self.name} ({self.tier})"

# --- 3. USER EARNED ACHIEVEMENTS ---
class UserAchievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    date_earned = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'achievement')

    def __str__(self):
        return f"{self.user.username} - {self.achievement.name}"

# --- 4. COMMUNITY & GROUPS ---
class Community(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    type = models.CharField(max_length=50, choices=[('University', 'University'), ('Corporate', 'Corporate'), ('Neighborhood', 'Neighborhood')])
    
    # Admin & Members
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_communities')
    members = models.ManyToManyField(User, related_name='joined_communities', blank=True)
    
    # Assets
    image = models.ImageField(upload_to='community_images/', null=True, blank=True)
    image_url = models.URLField(null=True, blank=True, help_text="Fallback or stock image URL")
    created_at = models.DateTimeField(default=timezone.now)

    # Stats
    total_community_emission = models.FloatField(default=0.0)

    def __str__(self):
        return self.name

# --- 5. CHALLENGES ---
class Challenge(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='challenges')
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Goal Parameters
    target_metric = models.CharField(max_length=50, choices=[('emission_reduction', 'Emission Reduction'), ('activity_count', 'Log Count')])
    target_value = models.FloatField()
    
    start_date = models.DateField()
    end_date = models.DateField()
    
    reward_xp = models.IntegerField(default=100)

    def __str__(self):
        return self.title

class UserChallengeProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    current_value = models.FloatField(default=0.0)
    is_completed = models.BooleanField(default=False)

# --- 6. ACTIVITY LOGGING (The Core) ---
class Activity(models.Model):
    CATEGORY_CHOICES = [
        ('transport', 'Transportation'),
        ('energy', 'Home Energy'),
        ('food', 'Food'),
        ('consumption', 'Purchases'),
        ('waste', 'Waste'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.CharField(max_length=255)
    
    # Input Data
    value = models.FloatField()
    unit = models.CharField(max_length=20)
    
    # Output Data (The Footprint)
    # Storing this directly in Activity saves you a JOIN operation on every query
    carbon_footprint_kg = models.FloatField(help_text="Calculated result")
    
    timestamp = models.DateTimeField(default=timezone.now)
    
    # Optional: Link to IoT Device if automated
    source = models.CharField(max_length=20, default='manual', choices=[
        ('manual', 'Manual'), 
        ('iot', 'IoT Device'),
        ('chatbot_pending', 'Chatbot (Pending)'),
        ('chatbot_processed', 'Chatbot (Processed)')
    ])

    def __str__(self):
        return f"{self.user.username} - {self.category} ({self.carbon_footprint_kg}kg)"


# --- 7. COMPLIANCE & VIOLATION TRACKING ---
class ComplianceThreshold(models.Model):
    """Configurable CO₂ emission limits for compliance monitoring"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='compliance_threshold', null=True, blank=True)
    organization = models.OneToOneField(Organization, on_delete=models.CASCADE, related_name='compliance_threshold', null=True, blank=True)

    # Thresholds
    daily_limit_kg = models.FloatField(default=50.0, help_text="Daily CO₂ emission limit in kg")
    monthly_limit_kg = models.FloatField(default=1200.0, help_text="Monthly CO₂ emission limit in kg")

    # Carbon Tax Configuration
    carbon_tax_rate = models.FloatField(default=40.0, help_text="Penalty rate per kg of excess CO₂ (in ₹)")

    # Alert Configuration
    warning_threshold_percent = models.FloatField(default=80.0, help_text="Percentage at which to show yellow warning (80-100%)")

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(user__isnull=False) | models.Q(organization__isnull=False),
                name='threshold_user_or_org'
            )
        ]

    def __str__(self):
        if self.user:
            return f"Threshold for {self.user.username}"
        return f"Threshold for {self.organization.name}"


class ComplianceViolation(models.Model):
    """Log of CO₂ emission threshold violations"""
    COMPLIANCE_STATUS_CHOICES = [
        ('green', 'Green - Within Limit'),
        ('yellow', 'Yellow - Near Threshold'),
        ('red', 'Red - Exceeded Threshold'),
    ]

    PERIOD_TYPE_CHOICES = [
        ('daily', 'Daily'),
        ('monthly', 'Monthly'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='violations', null=True, blank=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='violations', null=True, blank=True)

    # Violation Details
    timestamp = models.DateTimeField(default=timezone.now)
    period_type = models.CharField(max_length=10, choices=PERIOD_TYPE_CHOICES)
    period_date = models.DateField(help_text="Date of the violation (day or month start)")

    # Emission Data
    measured_co2_kg = models.FloatField(help_text="Total CO₂ measured for the period")
    allowed_limit_kg = models.FloatField(help_text="Allowed CO₂ limit for the period")
    excess_emission_kg = models.FloatField(help_text="Amount exceeding the limit")

    # Penalty
    carbon_tax_rate = models.FloatField(help_text="Tax rate applied (₹/kg)")
    penalty_amount = models.FloatField(help_text="Calculated penalty in ₹")

    # Status
    compliance_status = models.CharField(max_length=10, choices=COMPLIANCE_STATUS_CHOICES)

    # Alert Status
    alert_sent = models.BooleanField(default=False)
    alert_sent_at = models.DateTimeField(null=True, blank=True)

    # Notes
    notes = models.TextField(blank=True, help_text="Additional notes or actions taken")

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['organization', '-timestamp']),
            models.Index(fields=['compliance_status']),
            models.Index(fields=['period_date']),
        ]

    def __str__(self):
        entity = self.user.username if self.user else self.organization.name
        return f"{entity} - {self.compliance_status} - {self.period_type} - {self.period_date}"


class ComplianceAlert(models.Model):
    """Real-time alerts for compliance violations"""
    ALERT_TYPE_CHOICES = [
        ('warning', 'Warning - Near Threshold'),
        ('violation', 'Violation - Exceeded Threshold'),
        ('critical', 'Critical - Severe Violation'),
    ]

    violation = models.ForeignKey(ComplianceViolation, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=10, choices=ALERT_TYPE_CHOICES)

    message = models.TextField()
    is_read = models.BooleanField(default=False)
    is_dismissed = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.alert_type} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"

