
import requests
import time
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_dashboard_performance():
    print("Testing Dashboard Performance...")
    # Need a user context. Actually the prompts implies dummy auth fallback via email exists in views.
    # Let's try to pass an email query param, but we need a valid email from DB.
    # Since I cannot easily know a valid email without querying DB/looking at logs, I'll try a common one or create one via register if needed.
    # But wait, I have `db.sqlite3` access via `check_credentials.py` style scripts.
    # I'll rely on the assumption that 'test@example.com' or similar might exist, OR I will just register a new user first.
    
    # Register a test user to be sure
    session = requests.Session()
    username = f"perf_test_{int(time.time())}"
    email = f"{username}@example.com"
    password = "password123"
    
    reg_resp = session.post(f"{BASE_URL}/register/", json={
        "username": username,
        "email": email,
        "password": password
    })
    
    if reg_resp.status_code == 201:
        print(f"User {username} registered.")
        token_resp = session.post(f"{BASE_URL}/login/", json={"username":username, "password":password})
        token = token_resp.json().get('token')
        # The view uses request.user, so for DRF session auth (default in browser) or token auth.
        # But wait, looking at views.py: 
        # `user = request.user` ... `if not user.is_authenticated: email = request.query_params.get('email')`
        # So I can just use the email param!
    else:
        print("Registration failed or user exists. Using fallback email param.")
    
    # Test Dashboard Stats
    start_time = time.time()
    resp = session.get(f"{BASE_URL}/dashboard-stats/?email={email}")
    end_time = time.time()
    
    if resp.status_code == 200:
        data = resp.json()
        print(f"Dashboard Stats Response Time: {end_time - start_time:.4f}s")
        print("Keys present:", data.keys())
        # Basic validation
        assert "trend_data" in data
        assert "emission_stats" in data
        assert "budget" in data
    else:
        print("Dashboard Stats Failed:", resp.status_code, resp.text)

def test_leaderboard():
    print("\nTesting Leaderboard...")
    # Using the same email from above
    # We might need some dummy data to see ranks, but empty is also a valid state to verify structure.
    
    # We need to make sure the user works. I'll reuse the email variable, but I need to make sure it's set.
    # I'll just use a made up one if valid one not found, outcome will be default ranks.
    email = "test@example.com" 
    
    resp = requests.get(f"{BASE_URL}/leaderboard/?email={email}")
    
    if resp.status_code == 200:
        data = resp.json()
        print("Leaderboard Response OK")
        print("My Ranks:", data.get('my_ranks'))
        print("Leaderboard Count:", len(data.get('leaderboard', [])))
        if len(data.get('leaderboard', [])) > 0:
            print("Top User:", data['leaderboard'][0])
    else:
        print("Leaderboard Failed:", resp.status_code, resp.text)


def test_global_impact():
    print("\nTesting Global Impact...")
    resp = requests.get(f"{BASE_URL}/global-impact/")

    if resp.status_code == 200:
        data = resp.json()
        print("Global Impact Response OK")
        print("Data:", data)
        assert "total_users" in data
        assert "co2_saved_tons" in data
        assert "trees_planted_equivalent" in data
    else:
        print("Global Impact Failed:", resp.status_code, resp.text)

def test_communities():
    print("\nTesting Communities...")
    
    # 1. List
    resp = requests.get(f"{BASE_URL}/communities/")
    if resp.status_code == 200:
        data = resp.json()
        print(f"Community List OK. Found {len(data)} communities.")
        if len(data) > 0:
            c = data[0]
            print(f"Sample Community: {c['name']} ({c['type']}) - Members: {c.get('members_count')}")
            
            # 2. Detail
            cid = c['id']
            resp_detail = requests.get(f"{BASE_URL}/communities/{cid}/")
            if resp_detail.status_code == 200:
                 print(f"Community Detail OK for ID {cid}")
            else:
                 print(f"Community Detail Failed: {resp_detail.status_code}")

            # 3. Join (Using dummy auth fallback if implemented or expecting 401/404 if no auth)
            # Since verify_changes doesn't auth, this might fail or return error, which is expected.
            # But we can try passing email if the view supports it (CommunityActionView code added fallback)
            # Need a valid user email. I'll pick one from previous steps or hardcode 'admin@example.com' from seeder
            
            headers = {'Content-Type': 'application/json'}
            # I added fallback in CommunityActionView to accept email in body if not authenticated
            payload = {'email': 'admin@example.com'} 
            
            resp_join = requests.post(f"{BASE_URL}/communities/{cid}/join/", json=payload)
            print(f"Join Attempt: {resp_join.status_code} - {resp_join.text}")
            
    else:
        print("Community List Failed:", resp.status_code, resp.text)

if __name__ == "__main__":
    try:
        test_dashboard_performance()
        test_leaderboard()
        test_global_impact()
        test_communities()
    except Exception as e:
        print(f"An error occurred: {e}")
