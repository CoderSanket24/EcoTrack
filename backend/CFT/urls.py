"""
URL configuration for CFT project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.urls import path
from .views import RegisterView, LoginView, update_profile_by_email, OrganizationCreateView, OrganizationDetailView, OrganizationRegisterView, OrganizationLoginView, OrganizationDashboardStatsView, OrganizationMembersView, OrganizationEmissionsGraphView, OrganizationDepartmentGraphView
urlpatterns = [
    path('admin/', admin.site.urls),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('update-profile-by-email/', update_profile_by_email, name='update-profile-by-email'),
    path('organization/create/', OrganizationCreateView.as_view(), name='create-org'), # Keeping this for generic creation, or replace with register
    path('organization/register/', OrganizationRegisterView.as_view(), name='org-register'),
    path('organization/login/', OrganizationLoginView.as_view(), name='org-login'),
    path('organization/dashboard-stats/', OrganizationDashboardStatsView.as_view(), name='org-dashboard-stats'),
    path('organization/members/', OrganizationMembersView.as_view(), name='org-members'),
    path('organization/emissions-graph/', OrganizationEmissionsGraphView.as_view(), name='org-emissions-graph'),
    path('organization/department-graph/', OrganizationDepartmentGraphView.as_view(), name='org-department-graph'),
    path('organization/<str:org_id>/', OrganizationDetailView.as_view(), name='org-detail'),
]
