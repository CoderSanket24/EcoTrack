import requests
import time
import sys

def poll_iot_live():
    url = "http://localhost:8000/api/iot-live/"
    print(f"Starting to poll {url} every 2 seconds...\n")
    print("-" * 50)
    
    while True:
        try:
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                status = data.get("status")
                
                if status == "online":
                    live_data = data.get("live_data", {})
                    v = live_data.get("voltage", 0.0)
                    i = live_data.get("current", 0.0)
                    p = live_data.get("power", 0.0)
                    print(f"✅ [ONLINE]  Voltage: {v:>6.2f} V  |  Current: {i:>6.3f} A  |  Power: {p:>6.2f} W")
                else:
                    error_msg = data.get('error', 'No specific error')
                    print(f"❌ [OFFLINE] Status: {status} | Error: {error_msg}")
                    
            else:
                print(f"⚠️ [HTTP ERROR] Status Code: {response.status_code} | Text: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"🚨 [CONNECTION ERROR] Failed to connect to server: {e}")
            
        time.sleep(2)

if __name__ == "__main__":
    try:
        poll_iot_live()
    except KeyboardInterrupt:
        print("\nExiting...")
        sys.exit(0)
