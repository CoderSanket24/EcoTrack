import requests
import json

try:
    url = "http://127.0.0.1:8000/api/organization/department-graph/?org_id=ORG-AELFQ"
    print(f"Testing URL: {url}")
    response = requests.get(url)
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Response JSON:")
        print(json.dumps(response.json(), indent=2))
    else:
        print("Error Response:")
        print(response.text)
except Exception as e:
    print(f"Test failed: {e}")
