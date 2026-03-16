"""
ROI Engine: Green Investment Recommendation & Financial Return Calculator.

Emission factor (India grid average): 0.82 kg CO₂ per kWh
Electricity rate default: ₹6/kWh
"""

# ── Constants ────────────────────────────────────────────────────────────────
EMISSION_FACTOR_KG_PER_KWH = 0.82   # India CEA grid average
DEFAULT_ELECTRICITY_RATE   = 6.0    # ₹ per kWh
MONTHS_PER_YEAR            = 12

# ── Catalogue of green investments ───────────────────────────────────────────
# Each entry is a template; values are scaled by the user's actual usage.
INVESTMENT_CATALOGUE = [
    {
        "id": "led_lighting",
        "title": "Replace Lighting with LED Systems",
        "category": "energy",
        "icon": "💡",
        "description": "Swap conventional/CFL bulbs with energy-efficient LED lighting.",
        "savings_fraction": 0.50,        # LEDs use ~50 % less energy than CFL
        "installation_cost_base": 20000, # ₹ base cost
        "cost_per_kwh_saved": 80,        # ₹ per kWh/month of savings (scales cost)
        "applicable_to": ["energy"],
    },
    {
        "id": "solar_panels",
        "title": "Install Rooftop Solar Panels",
        "category": "energy",
        "icon": "☀️",
        "description": "Generate clean electricity on-site and reduce grid dependency.",
        "savings_fraction": 0.70,
        "installation_cost_base": 150000,
        "cost_per_kwh_saved": 600,
        "applicable_to": ["energy"],
    },
    {
        "id": "hvac_upgrade",
        "title": "Upgrade to 5-Star Rated HVAC",
        "category": "energy",
        "icon": "❄️",
        "description": "High-efficiency air conditioning cuts cooling energy by up to 40 %.",
        "savings_fraction": 0.40,
        "installation_cost_base": 45000,
        "cost_per_kwh_saved": 180,
        "applicable_to": ["energy"],
    },
    {
        "id": "ev_fleet",
        "title": "Switch Fleet to Electric Vehicles",
        "category": "transport",
        "icon": "🚗",
        "description": "Replace petrol/diesel vehicles with EVs for zero tailpipe emissions.",
        "savings_fraction": 0.65,
        "installation_cost_base": 800000,
        "cost_per_kwh_saved": 0,
        "fuel_cost_saving_monthly": 8000,  # ₹/month per vehicle
        "applicable_to": ["transport"],
    },
    {
        "id": "smart_meters",
        "title": "Deploy Smart Energy Meters",
        "category": "energy",
        "icon": "📊",
        "description": "Real-time monitoring identifies waste and reduces consumption by 15–20 %.",
        "savings_fraction": 0.18,
        "installation_cost_base": 12000,
        "cost_per_kwh_saved": 48,
        "applicable_to": ["energy"],
    },
    {
        "id": "waste_composting",
        "title": "On-Site Organic Waste Composting",
        "category": "waste",
        "icon": "♻️",
        "description": "Divert organic waste from landfill, cutting methane emissions.",
        "savings_fraction": 0.60,
        "installation_cost_base": 15000,
        "cost_per_kwh_saved": 0,
        "waste_disposal_saving_monthly": 2000,  # ₹/month
        "applicable_to": ["waste"],
    },
]


# ── Core calculation ──────────────────────────────────────────────────────────

def calculate_roi(investment: dict, monthly_kwh: float, electricity_rate: float = DEFAULT_ELECTRICITY_RATE) -> dict:
    """
    Given an investment template and the user's monthly energy use (kWh),
    return a fully calculated ROI dict.

    For non-energy categories (transport, waste) monthly_kwh is used only
    for CO₂ reduction; monetary savings come from the template's fixed fields.
    """
    sid = investment["id"]
    savings_fraction = investment["savings_fraction"]

    # ── Energy & CO₂ ─────────────────────────────────────────────────────────
    monthly_kwh_saved   = round(monthly_kwh * savings_fraction, 2)
    annual_kwh_saved    = round(monthly_kwh_saved * MONTHS_PER_YEAR, 2)
    annual_co2_reduction_kg = round(annual_kwh_saved * EMISSION_FACTOR_KG_PER_KWH, 2)

    # ── Monetary savings ──────────────────────────────────────────────────────
    if sid == "ev_fleet":
        monthly_savings = investment.get("fuel_cost_saving_monthly", 8000)
    elif sid == "waste_composting":
        monthly_savings = investment.get("waste_disposal_saving_monthly", 2000)
    else:
        monthly_savings = round(monthly_kwh_saved * electricity_rate, 2)

    annual_savings = round(monthly_savings * MONTHS_PER_YEAR, 2)

    # ── Investment cost (scales with savings magnitude) ───────────────────────
    base_cost = investment["installation_cost_base"]
    cost_per_unit = investment.get("cost_per_kwh_saved", 0)
    investment_cost = round(base_cost + cost_per_unit * monthly_kwh_saved, 2)

    # ── Payback period ────────────────────────────────────────────────────────
    if monthly_savings > 0:
        payback_months = round(investment_cost / monthly_savings, 1)
        payback_years  = round(payback_months / MONTHS_PER_YEAR, 1)
    else:
        payback_months = None
        payback_years  = None

    # ── 5-year net benefit ────────────────────────────────────────────────────
    five_year_savings  = round(annual_savings * 5, 2)
    five_year_net      = round(five_year_savings - investment_cost, 2)
    roi_percent_5yr    = round((five_year_net / investment_cost) * 100, 1) if investment_cost > 0 else 0

    return {
        "id":                      sid,
        "title":                   investment["title"],
        "category":                investment["category"],
        "icon":                    investment["icon"],
        "description":             investment["description"],
        # Energy
        "current_monthly_kwh":     round(monthly_kwh, 2),
        "monthly_kwh_saved":       monthly_kwh_saved,
        "annual_kwh_saved":        annual_kwh_saved,
        # CO₂
        "emission_factor":         EMISSION_FACTOR_KG_PER_KWH,
        "annual_co2_reduction_kg": annual_co2_reduction_kg,
        # Financial
        "investment_cost":         investment_cost,
        "monthly_savings":         monthly_savings,
        "annual_savings":          annual_savings,
        "payback_months":          payback_months,
        "payback_years":           payback_years,
        # 5-year outlook
        "five_year_savings":       five_year_savings,
        "five_year_net_benefit":   five_year_net,
        "roi_percent_5yr":         roi_percent_5yr,
    }


# ── User-aware recommendation generator ──────────────────────────────────────

def generate_recommendations(user=None, org=None, electricity_rate: float = DEFAULT_ELECTRICITY_RATE) -> list:
    """
    Pull the user/org's actual activity data, derive monthly kWh equivalent,
    then score and return ranked ROI recommendations.
    """
    from django.db.models import Sum
    from django.utils import timezone
    from .models import Activity

    # Determine monthly energy kWh from logged activities (last 30 days)
    today = timezone.now().date()
    month_start = today.replace(day=1)

    filters = {"timestamp__date__gte": month_start}
    if user:
        filters["user"] = user
    elif org:
        filters["user__profile__organization"] = org

    # Energy activities are stored in kWh-equivalent value
    energy_qs = Activity.objects.filter(category="energy", **filters)
    transport_qs = Activity.objects.filter(category="transport", **filters)
    waste_qs = Activity.objects.filter(category="waste", **filters)

    monthly_energy_kwh   = energy_qs.aggregate(t=Sum("value"))["t"] or 200.0
    monthly_transport_co2 = transport_qs.aggregate(t=Sum("carbon_footprint_kg"))["t"] or 50.0
    monthly_waste_co2    = waste_qs.aggregate(t=Sum("carbon_footprint_kg"))["t"] or 20.0

    # Map category → representative monthly kWh for ROI calc
    category_kwh = {
        "energy":    monthly_energy_kwh,
        "transport": monthly_transport_co2 / EMISSION_FACTOR_KG_PER_KWH,  # back-convert
        "waste":     monthly_waste_co2 / EMISSION_FACTOR_KG_PER_KWH,
    }

    results = []
    for inv in INVESTMENT_CATALOGUE:
        kwh = category_kwh.get(inv["category"], 200.0)
        roi = calculate_roi(inv, kwh, electricity_rate)
        # Relevance score: higher CO₂ reduction + shorter payback = better rank
        payback_score = (1 / roi["payback_months"]) * 1000 if roi["payback_months"] else 0
        roi["relevance_score"] = round(roi["annual_co2_reduction_kg"] * 0.5 + payback_score, 2)
        results.append(roi)

    # Sort by relevance (best first)
    results.sort(key=lambda r: r["relevance_score"], reverse=True)
    return results
