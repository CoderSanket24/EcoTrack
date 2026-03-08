from django.contrib import admin
from .models import Profile, Achievement, UserAchievement, Community, Challenge, UserChallengeProgress, Activity, Organization

class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'profile_name', 'level', 'xp', 'total_emission_kg')
    search_fields = ('user__username', 'user__email', 'profile_name')

admin.site.register(Profile, ProfileAdmin)
admin.site.register(Achievement)
admin.site.register(UserAchievement)
admin.site.register(Community)
admin.site.register(Challenge)
admin.site.register(UserChallengeProgress)
admin.site.register(Activity)
admin.site.register(Organization)
