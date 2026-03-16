# Carbon Footprint Tracker (CFT) API Documentation

This document provides a comprehensive overview of the REST API endpoints available in the backend system, built with Django REST Framework (DRF). The base URL for all endpoints is `/api/`.

---

## 1. Authentication & User Management

### `POST /api/register/`
Registers a new standard user.
- **Payload:** `{ "username", "email", "password" }`
- **Response:** User data & dummy token.

### `POST /api/login/`
Authenticates a user via username or email.
- **Payload:** `{ "username" (optional), "email" (optional), "password" }`
- **Response (200 OK):** User data & dummy token (`{ "token": "dummy-token" }`).
- **Response (400 Bad Request):** `{ "error": "Invalid Credentials" }`

### `POST /api/auth/send-otp/`
Sends an OTP to the provided email address for passwordless/verified login.
- **Payload:** `{ "email" }`
- **Response:** Success message.

### `POST /api/auth/verify-otp/`
Verifies the OTP sent to the user's email.
- **Payload:** `{ "email", "otp" }`
- **Response:** Authentication token and user payload.

### `PUT /api/update-profile-by-email/`
Updates user profile information such as location, department, or preferences.
- **Payload:** `{ "email": "user@example.com", "profile": { "department": "HR", "state": "Delhi" } }`
- **Response:** Updated profile object.

---

## 2. Activity Logging & Carbon Tracking

### `GET /api/log-activity/`
Retrieves a list of logged activities. Supports filtering via query parameters.
- **Query Params:** 
  - `email` (str): User's email to fetch records for.
  - `date` (YYYY-MM-DD): Filter by specific date.
  - `category` (str): Filter by category (e.g., `transport`, `food`, `energy`).
- **Response:** Array of activity objects ordered by timestamp descending.

### `POST /api/log-activity/`
Logs a new carbon-emitting activity. Automatically triggers the ML Engine (`EmissionPredictor`) to calculate `carbon_footprint_kg`.
- **Payload:** `{ "email", "category", "value", "mode" (optional), "dietType" (optional) }`
- **Response:** Created activity object including ML-predicted `carbon_footprint_kg`.

### `DELETE /api/log-activity/<int:pk>/`
Deletes a specific logged activity by ID.
- **Response:** 204 No Content.

---

## 3. Dashboards & Gamification (User)

### `GET /api/dashboard-stats/`
Retrieves aggregated statistics for the user dashboard.
- **Query Params:** `email` 
- **Response:**
  ```json
  {
      "footprint_data": [ ... 6 months of data ],
      "category_data": { "transport": X, "energy": Y, ... },
      "total_emissions": 124.5
  }
  ```

### `GET /api/gamification-stats/`
Retrieves the user's gamification profile.
- **Query Params:** `email`
- **Response:** Level, XP, EcoCoins, streak, sustainability score (0-100), and `is_iot_connected` flag.

### `GET /api/leaderboard/`
Retrieves the global leaderboard ranking top users by XP.
- **Response:** Array of user profiles sorted by descending XP.

---

## 4. Maps & Open Data

### `GET /api/community-impact-map/`
Generates and returns an HTML string of the Folium 3D Hexbin heatmap for India, mapped against user locations.
- **Response:** `{ "map_html": "<div id='map_...'></div>" }`

### `GET /api/global-impact/`
Fetches high-level global impact stats.
- **Response:** Aggregated active users, total global kg CO₂ offset, planted trees equivalent.

### `GET /api/satellite-hotspots/`
**(New)** Uses Machine Learning (Isolation Forest) on Sentinel-5P CSV data to detect emission anomalies in Indian cities.
- **Response:** 
  ```json
  {
      "all_points": [...], 
      "hotspots": [...], 
      "total_points": 20, 
      "hotspot_count": 5, 
      "trend_data": [...], // 5-year global CO2 regression
      "avg_no2_ppb": 629.35
  }
  ```

---

## 5. IoT & AI Features

### `GET /api/energy-forecast/`
Predicts energy usage based on historical trends using an LSTM model approximation.
- **Response:** Array of historical data points and 6 future forecasted points indicating Watt usage.

### `GET /api/iot-live/`
Connects directly to COM7 (Serial Port) to pull live ESP32 Smart Plug readings (Voltage, Current, Power).
- **Response (Connected):** 
  ```json
  {
      "status": "online",
      "live_data": { "voltage": 230.5, "current": 0.045, "power": 10.37 }
  }
  ```
- **Response (Disconnected/Timeout):** `{ "status": "offline", "error": "Timeout..." }`

### `POST /api/chat/`
Endpoints for the AI Co-Pilot (e.g., Gemini) to provide contextual sustainability advice.
- **Payload:** `{ "message": "...", "context": {...} }`
- **Response:** `{ "response": "AI reply text" }`

---

## 6. Community & Social

### `GET /api/communities/`
Lists all available user communities/groups.

### `GET /api/communities/<int:pk>/`
Details of a specific community, including its members and collective impact.

### `POST /api/communities/<int:pk>/join/` & `POST /api/communities/<int:pk>/leave/`
Actions for a user to join or leave a specific community.

---

## 7. Organization / Corporate Features

### `POST /api/organization/register/` & `POST /api/organization/create/`
Registers a new corporate organization entity.

### `POST /api/organization/login/`
Authenticates an organization admin.

### `GET /api/organization/dashboard-stats/`
Retrieves high-level overview metrics for an organization (Total Emitted, Offset, Active Employees).
- **Query Params:** `org_id`

### `GET /api/organization/members/`
Retrieves a list of all employees attached to the organization.
- **Query Params:** `org_id`

### `GET /api/organization/emissions-graph/`
Returns a 12-month area chart dataset tracking the entire organization's carbon footprint.
- **Query Params:** `org_id`

### `GET /api/organization/department-graph/`
Returns a breakdown of emissions grouped by internal departments (e.g., Engineering, HR, Sales).
- **Query Params:** `org_id`
- **Response:** `[ { "name": "Engineering", "value": 4500 }, ... ]`

### `GET /api/organization/<str:org_id>/`
Gets specific details about the organization entity itself.
