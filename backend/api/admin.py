from django.contrib import admin
from .models import Profile, Achievement, UserAchievement, Community, Challenge, UserChallengeProgress, Activity, Organization, ComplianceThreshold, ComplianceViolation, ComplianceAlert

class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'profile_name', 'level', 'xp', 'total_emission_kg')
    search_fields = ('user__username', 'user__email', 'profile_name')

@admin.register(ComplianceViolation)
class ComplianceViolationAdmin(admin.ModelAdmin):
    list_display = ('user', 'period_type', 'period_date', 'measured_co2_kg', 'allowed_limit_kg', 'excess_emission_kg', 'penalty_amount', 'compliance_status')
    list_filter = ('compliance_status', 'period_type')
    search_fields = ('user__username', 'user__email')

@admin.register(ComplianceAlert)
class ComplianceAlertAdmin(admin.ModelAdmin):
    list_display = ('violation', 'alert_type', 'is_read', 'is_dismissed', 'created_at')
    list_filter = ('alert_type', 'is_read', 'is_dismissed')

admin.site.register(Profile, ProfileAdmin)
admin.site.register(Achievement)
admin.site.register(UserAchievement)
admin.site.register(Community)
admin.site.register(Challenge)
admin.site.register(UserChallengeProgress)
admin.site.register(Activity)
admin.site.register(Organization)
admin.site.register(ComplianceThreshold)
