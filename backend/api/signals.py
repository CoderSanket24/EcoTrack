from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Activity, Profile
from datetime import timedelta

@receiver(post_save, sender=Activity)
def update_profile_stats(sender, instance, created, **kwargs):
    if created:
        try:
            profile = instance.user.profile
        except Profile.DoesNotExist:
            profile = Profile.objects.create(user=instance.user, profile_name=f"user_{instance.user.username}")

        
        # 1. Update Total Emissions
        profile.total_emission_kg += instance.carbon_footprint_kg
        
        # 2. Update Average Daily Emissions
        days_since_joined = (timezone.now() - profile.joined_at).days
        if days_since_joined < 1:
            days_since_joined = 1
        profile.avg_daily_emission_kg = profile.total_emission_kg / days_since_joined
        
        # 3. Streak Logic
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)
        
        if profile.last_activity_date == yesterday:
            profile.current_streak += 1
        elif profile.last_activity_date != today:
            # If last activity was before yesterday (streak broken) or never (None)
            profile.current_streak = 1
            
        profile.last_activity_date = today
        
        # 4. Gamification (XP, Coins, Level, Score)
        profile.xp += 20
        profile.eco_coins += 5
        profile.level = (profile.xp // 1000) + 1
        
        # Simple Sustainability Score Logic (0-100)
        # Assuming avg daily emission of 10kg is "bad" (0 score), 0kg is "perfect" (100 score)
        # Formula: 100 - (avg * 10). Clamped between 0 and 100.
        raw_score = 100 - (profile.avg_daily_emission_kg * 5) # Adjusted factor
        profile.sustainability_score = max(0, min(100, int(raw_score)))
        
        profile.save()