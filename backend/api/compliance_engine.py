"""
Compliance Engine: Threshold monitoring, penalty calculation, violation logging, and alerts.
"""
import datetime
from django.utils import timezone
from django.db.models import Sum
from django.core.mail import send_mail
from django.conf import settings


def get_threshold(user=None, org=None):
    """Get or create a ComplianceThreshold for a user or org."""
    from .models import ComplianceThreshold
    if user:
        threshold, _ = ComplianceThreshold.objects.get_or_create(
            user=user,
            defaults={'daily_limit_kg': 50.0, 'monthly_limit_kg': 1200.0, 'carbon_tax_rate': 40.0}
        )
        return threshold
    if org:
        threshold, _ = ComplianceThreshold.objects.get_or_create(
            organization=org,
            defaults={'daily_limit_kg': 500.0, 'monthly_limit_kg': 12000.0, 'carbon_tax_rate': 40.0}
        )
        return th
reshold
    return None


def get_compliance_status(measured, limit, warning_percent=80.0):
    """Return green / yellow / red based on usage ratio."""
    if limit <= 0:
        return 'green'
    ratio = (measured / limit) * 100
    if ratio > 100:
        return 'red'
    if ratio >= warning_percent:
        return 'yellow'
    return 'green'


def calculate_penalty(excess_kg, tax_rate):
    """Penalty = excess_kg × tax_rate (₹)."""
    return round(max(0.0, excess_kg) * tax_rate, 2)


def build_alert_message(period_type, measured, limit, excess, penalty):
    return (
        f"CO₂ Emission Threshold Exceeded\n"
        f"Period: {period_type.capitalize()}\n"
        f"Current Emission: {measured:.2f} kg\n"
        f"Allowed Limit: {limit:.2f} kg\n"
        f"Excess Emission: {excess:.2f} kg\n"
        f"Penalty Applied: ₹{penalty:.2f}"
    )


def send_violation_email(user, message):
    """Optionally email the user/admin about a violation."""
    try:
        recipient = user.email if user and user.email else None
        if recipient and settings.EMAIL_HOST_USER:
            send_mail(
                subject="⚠️ CO₂ Emission Threshold Exceeded",
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[recipient],
                fail_silently=True,
            )
    except Exception:
        pass


def log_violation(user=None, org=None, period_type='daily', period_date=None,
                  measured_co2=0.0, allowed_limit=0.0, tax_rate=40.0, warning_percent=80.0):
    """
    Core function: evaluate emissions, log violation if needed, create alert.
    Returns a dict with compliance info regardless of whether a violation occurred.
    """
    from .models import ComplianceViolation, ComplianceAlert

    excess = max(0.0, measured_co2 - allowed_limit)
    penalty = calculate_penalty(excess, tax_rate)
    status = get_compliance_status(measured_co2, allowed_limit, warning_percent)

    if period_date is None:
        period_date = timezone.now().date()

    result = {
        'compliance_status': status,
        'measured_co2_kg': round(measured_co2, 2),
        'allowed_limit_kg': round(allowed_limit, 2),
        'excess_emission_kg': round(excess, 2),
        'penalty_amount': penalty,
        'carbon_tax_rate': tax_rate,
        'period_type': period_type,
        'period_date': str(period_date),
    }

    # Only persist red/yellow violations
    if status in ('red', 'yellow'):
        violation, created = ComplianceViolation.objects.update_or_create(
            user=user,
            organization=org,
            period_type=period_type,
            period_date=period_date,
            defaults={
                'measured_co2_kg': measured_co2,
                'allowed_limit_kg': allowed_limit,
                'excess_emission_kg': excess,
                'carbon_tax_rate': tax_rate,
                'penalty_amount': penalty,
                'compliance_status': status,
            }
        )

        # Create alert only for new red violations
        if created and status == 'red':
            message = build_alert_message(period_type, measured_co2, allowed_limit, excess, penalty)
            alert_type = 'critical' if excess > allowed_limit * 0.5 else 'violation'
            ComplianceAlert.objects.create(
                violation=violation,
                alert_type=alert_type,
                message=message,
            )
            # Mark alert sent and optionally email
            violation.alert_sent = True
            violation.alert_sent_at = timezone.now()
            violation.save(update_fields=['alert_sent', 'alert_sent_at'])
            if user:
                send_violation_email(user, message)

        result['violation_id'] = violation.pk

    return result


def check_user_compliance(user):
    """
    Check both daily and monthly compliance for a user.
    Returns dict with daily and monthly compliance info.
    """
    from .models import Activity

    threshold = get_threshold(user=user)
    today = timezone.now().date()
    month_start = today.replace(day=1)

    daily_co2 = Activity.objects.filter(
        user=user, timestamp__date=today
    ).aggregate(total=Sum('carbon_footprint_kg'))['total'] or 0.0

    monthly_co2 = Activity.objects.filter(
        user=user, timestamp__date__gte=month_start
    ).aggregate(total=Sum('carbon_footprint_kg'))['total'] or 0.0

    daily_result = log_violation(
        user=user,
        period_type='daily',
        period_date=today,
        measured_co2=daily_co2,
        allowed_limit=threshold.daily_limit_kg,
        tax_rate=threshold.carbon_tax_rate,
        warning_percent=threshold.warning_threshold_percent,
    )

    monthly_result = log_violation(
        user=user,
        period_type='monthly',
        period_date=month_start,
        measured_co2=monthly_co2,
        allowed_limit=threshold.monthly_limit_kg,
        tax_rate=threshold.carbon_tax_rate,
        warning_percent=threshold.warning_threshold_percent,
    )

    # Overall status: worst of the two
    status_rank = {'green': 0, 'yellow': 1, 'red': 2}
    overall = max(
        daily_result['compliance_status'],
        monthly_result['compliance_status'],
        key=lambda s: status_rank[s]
    )

    return {
        'overall_status': overall,
        'daily': daily_result,
        'monthly': monthly_result,
        'thresholds': {
            'daily_limit_kg': threshold.daily_limit_kg,
            'monthly_limit_kg': threshold.monthly_limit_kg,
            'carbon_tax_rate': threshold.carbon_tax_rate,
            'warning_threshold_percent': threshold.warning_threshold_percent,
        }
    }
