import serial
import json
import time
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from itertools import count
import sys

# --- CONFIGURATION ---
SERIAL_PORT = 'COM7'   
BAUD_RATE = 115200

# --- SETUP SERIAL CONNECTION ---
try:
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    print(f"Successfully connected to {SERIAL_PORT}")
except Exception as e:
    print(f"Error opening {SERIAL_PORT}: {e}")
    sys.exit()

# --- DATA LISTS & TRACKERS ---
x_vals = []
power_vals = []
voltage_vals = []
current_vals = []
index = count()

last_valid_data_time = time.time()

def animate(i):
    global last_valid_data_time
    
    connected = False
    v, i_curr, p = 0.0, 0.0, 0.0

    # 1. READ SERIAL DATA
    if ser.in_waiting > 0:
        try:
            raw_line = ser.readline().decode('utf-8').strip()
            
            # Print exactly what the ESP32 is saying to the terminal
            print(f"ESP32 Sent: {raw_line}") 
            
            data = json.loads(raw_line)
            v = float(data.get("V", 0))
            i_curr = float(data.get("I", 0))
            p = float(data.get("P", 0))
            
            last_valid_data_time = time.time()
            connected = True
            
        except (json.JSONDecodeError, ValueError):
            pass 

    # 2. WATCHDOG TIMEOUT 
    # If 3 seconds pass with no valid data, force 0
    if time.time() - last_valid_data_time > 3:
        v, i_curr, p = 0.0, 0.0, 0.0
        connected = False
        print("Waiting for data from ESP32...")
    else:
        connected = True

    # Note: We completely REMOVED the Python noise gate here.
    # Whatever the ESP32 sends, Python will plot it directly.

    # 3. UPDATE GRAPH LISTS
    idx = next(index)
    x_vals.append(idx)
    power_vals.append(p)
    voltage_vals.append(v)
    current_vals.append(i_curr)

    if len(x_vals) > 60:
        x_vals.pop(0)
        power_vals.pop(0)
        voltage_vals.pop(0)
        current_vals.pop(0)

    # 4. DRAW THE DASHBOARD
    plt.cla() 
    plt.plot(x_vals, power_vals, label='Live Power (W)', color='#d62728', linewidth=2.5)
    plt.ylim(bottom=0)
    
    avg_p = sum(power_vals) / len(power_vals) if power_vals else 0

    status_text = "🟢 CONNECTED & READING" if connected else "🔴 DISCONNECTED"

    stats = (
        f"{status_text}\n"
        f"--------------------------\n"
        f"Live Power:   {p:6.2f} W\n"
        f"Live Current: {i_curr:6.3f} A\n"
        f"Live Voltage: {v:6.1f} V\n"
        f"--------------------------\n"
        f"Avg Power:    {avg_p:6.2f} W"
    )
    
    plt.text(0.02, 0.95, stats, transform=plt.gca().transAxes, 
             fontsize=12, verticalalignment='top', fontfamily='monospace',
             bbox=dict(boxstyle='round', facecolor='#f8f9fa', alpha=0.9, edgecolor='#dee2e6'))

    plt.title("Live Energy Monitor Dashboard (RAW DATA)")
    plt.xlabel("Time (Seconds)")
    plt.ylabel("Power (Watts)")
    plt.grid(True, linestyle='--', alpha=0.6)
    plt.legend(loc='upper right')

# --- START ANIMATION ---
print("Starting Python Dashboard... Look at this terminal for raw data!")
ani = FuncAnimation(plt.gcf(), animate, interval=1000)
plt.tight_layout()
plt.show()