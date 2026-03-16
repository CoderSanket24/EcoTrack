from django.urls import path
from .views import (
    RegisterView, LoginView, update_profile_by_email, community_impact_map,
    LogActivityView, ActivityDetailView, UserDashboardStatsView, UserGamificationStatsView,
    EnergyForecastView, LeaderboardView, GlobalImpactView, CommunityListView,
    CommunityDetailView, CommunityActionView, SendOTPView, VerifyOTPView, ChatBotView,
    OrganizationCreateView, OrganizationDetailView, OrganizationRegisterView,
    OrganizationLoginView, OrganizationDashboardStatsView, OrganizationMembersView,
    OrganizationEmissionsGraphView, OrganizationDepartmentGraphView,
    # Compliance
    ComplianceStatusView, ComplianceThresholdView, ComplianceViolationListView, ComplianceAlertListView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('update-profile-by-email/', update_profile_by_email, name='update-profile-by-email'),
    path('community-impact-map/', community_impact_map, name='community-impact-map'),
    path('log-activity/', LogActivityView.as_view(), name='log-activity'),
    path('log-activity/<int:pk>/', ActivityDetailView.as_view(), name='delete-activity'),
    path('dashboard-stats/', UserDashboardStatsView.as_view(), name='dashboard-stats'),
    path('gamification-stats/', UserGamificationStatsView.as_view(), name='gamification-stats'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('global-impact/', GlobalImpactView.as_view(), name='global-impact'),
    path('energy-forecast/', EnergyForecastView.as_view(), name='energy-forecast'),
    path('communities/', CommunityListView.as_view(), name='community-list'),
    path('communities/<int:pk>/', CommunityDetailView.as_view(), name='community-detail'),
    path('communities/<int:pk>/join/', CommunityActionView.as_view(), {'action': 'join'}, name='community-join'),
    path('communities/<int:pk>/leave/', CommunityActionView.as_view(), {'action': 'leave'}, name='community-leave'),
    path('auth/send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('chat/', ChatBotView.as_view(), name='chat-bot'),
    
    # Organization
    path('organization/create/', OrganizationCreateView.as_view(), name='create-org'), # Keeping this for generic creation, or replace with register
    path('organization/register/', OrganizationRegisterView.as_view(), name='org-register'),
    path('organization/login/', OrganizationLoginView.as_view(), name='org-login'),
    path('organization/dashboard-stats/', OrganizationDashboardStatsView.as_view(), name='org-dashboard-stats'),
    path('organization/members/', OrganizationMembersView.as_view(), name='org-members'),
    path('organization/emissions-graph/', OrganizationEmissionsGraphView.as_view(), name='org-emissions-graph'),
    path('organization/department-graph/', OrganizationDepartmentGraphView.as_view(), name='org-department-graph'),
    path('organization/<str:org_id>/', OrganizationDetailView.as_view(), name='org-detail'),

    # Compliance
    path('compliance/status/', ComplianceStatusView.as_view(), name='compliance-status'),
    path('compliance/thresholds/', ComplianceThresholdView.as_view(), name='compliance-thresholds'),
    path('compliance/violations/', ComplianceViolationListView.as_view(), name='compliance-violations'),
    path('compliance/alerts/', ComplianceAlertListView.as_view(), name='compliance-alerts'),
]
