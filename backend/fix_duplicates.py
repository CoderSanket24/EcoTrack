import os
import django

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

email = "adishahil346@gmail.com"
password = "202510"

print(f"Cleaning up users with email: {email}")

users = User.objects.filter(email=email)
count = users.count()
print(f"Found {count} users.")

if count > 0:
    users.delete()
    print("Deleted all duplicate users.")

print("Creating new user...")
username = "adityashahil" # Derived from email
user = User.objects.create_user(username=username, email=email, password=password)
print(f"Created user: {user.username} with email: {user.email}")
