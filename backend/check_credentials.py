import os
import django
from django.conf import settings

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from django.contrib.auth import authenticate

email = "adishahil346@gmail.com"
password = "202510"

print(f"Checking user with email: {email}")

try:
    user_obj = User.objects.get(email=email)
    print(f"User found: {user_obj.username}")
    
    user = authenticate(username=user_obj.username, password=password)
    if user:
        print("Authentication SUCCESS")
    else:
        print("Authentication FAILED (Wrong Password)")

except User.DoesNotExist:
    print("User NOT FOUND")
