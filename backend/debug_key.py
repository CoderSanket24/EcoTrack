import os
import sys

# Setup just enough to check env
def check_key():
    print("--- API KEY CHECK ---")
    key = os.environ.get('GEMINI_API_KEY')
    if key:
        print(f"✅ GEMINI_API_KEY IS SET: {key[:5]}...{key[-4:]}")
    else:
        print("❌ GEMINI_API_KEY IS MISSING or None")
        
    print(f"Current Working Directory: {os.getcwd()}")
    # Check .env file existence
    if os.path.exists('../.env'):
        print("✅ .env file found in parent directory")
    elif os.path.exists('.env'):
        print("✅ .env file found in current directory")
    else:
        print("❌ .env file NOT found")

if __name__ == "__main__":
    check_key()
