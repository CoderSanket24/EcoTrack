import os
import django
import sys
from datetime import datetime, timedelta

# Setup Django Environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Organization, Profile, Activity
from django.db.models import Sum
from django.conf import settings

def debug_org_api():
    print("--- 1. CHECKING GEMINI API KEY ---")
    api_key = os.environ.get('GEMINI_API_KEY')
    if api_key:
        print(f"✅ GEMINI_API_KEY found: {api_key[:5]}...{api_key[-4:]}")
    else:
        print("❌ GEMINI_API_KEY NOT FOUND in environment variables.")

    print("\n--- 2. CHECKING ORGANIZATIONS ---")
    orgs = Organization.objects.all()
    print(f"Total Organizations: {orgs.count()}")
    
    if orgs.count() == 0:
        print("❌ No Organizations found in DB. Dashboard will be empty.")
        return

    for org in orgs:
        print(f"\n[Analysing Org: {org.name} (ID: {org.org_id})]")
        
        # Members
        members = Profile.objects.filter(organization=org)
        print(f"  - Members Found: {members.count()}")
        for m in members:
            print(f"    - User: {m.user.username}, Total Emission (Profile): {m.total_emission_kg}")

        # Activities
        activities = Activity.objects.filter(user__profile__organization=org)
        print(f"  - Activities Found (Total): {activities.count()}")
        
        if activities.count() > 0:
            total_emission = activities.aggregate(Sum('carbon_footprint_kg'))['carbon_footprint_kg__sum']
            print(f"  - Calculated Total Emission: {total_emission}")
            
            # Monthly Logic Test
            now = datetime.now()
            start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            this_month_activities = activities.filter(timestamp__gte=start_of_month)
            print(f"  - Activities This Month: {this_month_activities.count()}")
        else:
            print("  ⚠️ No Activities logged by members of this Org.")

if __name__ == "__main__":
    try:
        debug_org_api()
    except Exception as e:
        print(f"\n❌ CRITICAL ERROR: {e}")
