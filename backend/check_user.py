import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

try:
    user = User.objects.get(username='header_test_user')
    print(f"User found: {user.username}")
    print(f"Check password: {user.check_password('password123')}")
except User.DoesNotExist:
    print("User not found")
