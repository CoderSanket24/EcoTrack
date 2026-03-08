from .models import Activity, Profile
from django.utils import timezone
from datetime import timedelta

def sync_pending_chatbot_activities(user):
    """
    Checks for 'chatbot_pending' activities for the given user,
    calculates their impact, updates the user's profile (XP, Coins, Emissions, Streak),
    and marks them as 'chatbot_processed'.
    """
    pending_activities = Activity.objects.filter(
        user=user, 
        source='chatbot_pending'
    ).order_by('timestamp') # Process in chronological order for streak logic

    if not pending_activities.exists():
        return

    try:
        profile = user.profile
    except Profile.DoesNotExist:
        return # Should not happen for logged-in users, but safety first

    # Emission Factors (Keep synchronized with views.py)
    emission_factors = {
        'transport': 0.2,
        'energy': 0.85,
        'food': 1.5,
        'consumption': 0.05,
        'waste': 1.2
    }

    accumulated_emission = 0.0
    accumulated_xp = 0
    accumulated_eco_coins = 0
    
    # Streak Logic State
    current_streak = profile.current_streak
    last_activity_date = profile.last_activity_date

    for activity in pending_activities:
        # 1. Calculate Carbon Footprint (if not already set or 0)
        if activity.carbon_footprint_kg == 0:
            factor = emission_factors.get(activity.category, 0.0)
            activity.carbon_footprint_kg = activity.value * factor
        
        accumulated_emission += activity.carbon_footprint_kg

        # 2. Gamification Rewards
        accumulated_xp += 20
        accumulated_eco_coins += 5

        # 3. Streak Logic
        activity_date = activity.timestamp.date()
        
        if last_activity_date is None:
            # First ever activity
            current_streak = 1
            last_activity_date = activity_date
        elif activity_date == last_activity_date:
            # Already logged today, streak doesn't change
            pass
        elif activity_date == last_activity_date + timedelta(days=1):
            # Consecutive day
            current_streak += 1
            last_activity_date = activity_date
        elif activity_date > last_activity_date + timedelta(days=1):
            # Streak broken
            current_streak = 1
            last_activity_date = activity_date
        # If activity_date < last_activity_date, it's an old log, ignore for streak

        # 4. Mark as Processed
        activity.source = 'chatbot_processed'
        activity.save()

    # 5. Update Profile
    profile.total_emission_kg += accumulated_emission
    profile.xp += accumulated_xp
    profile.eco_coins += accumulated_eco_coins
    
    # Update Streak and Last Activity
    profile.current_streak = current_streak
    profile.last_activity_date = last_activity_date

    # Recalculate Level (Simple logic: 1 Level per 100 XP)
    profile.level = (profile.xp // 100) + 1
    
    # Recalculate Avg Daily Emission (Simple approximation)
    # Avoid division by zero
    days_since_joined = (timezone.now() - profile.joined_at).days
    if days_since_joined > 0:
        profile.avg_daily_emission_kg = profile.total_emission_kg / days_since_joined
    else:
        profile.avg_daily_emission_kg = profile.total_emission_kg

    profile.save()