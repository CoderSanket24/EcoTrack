from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile, Achievement, UserAchievement, Community, Challenge, UserChallengeProgress, Activity, Organization, ComplianceThreshold, ComplianceViolation, ComplianceAlert

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        exclude = ('org_pin', 'email') # Hide sensitive info from public API

class ProfileSerializer(serializers.ModelSerializer):
    org_id = serializers.CharField(source='organization.org_id', read_only=True)
    org_name = serializers.CharField(source='organization.name', read_only=True)
    target_org_id = serializers.CharField(write_only=True, required=False, allow_blank=True, help_text="Provide Org ID to join")

    class Meta:
        model = Profile
        fields = (
            'profile_name', 'first_name', 'last_name', 'phone_no', 'city', 'state',
            'carbon_budget_kg', 'total_emission_kg', 'avg_daily_emission_kg',
            'level', 'xp', 'current_streak', 'last_activity_date',
            'eco_coins', 'is_iot_connected', 'sustainability_score',
            'org_id', 'org_name', 'target_org_id'
        )

    def update(self, instance, validated_data):
        target_org_id = validated_data.pop('target_org_id', None)
        if target_org_id:
            try:
                org = Organization.objects.get(org_id=target_org_id)
                instance.organization = org
            except Organization.DoesNotExist:
                raise serializers.ValidationError({"target_org_id": "Organization with this ID not found."})
        
        return super().update(instance, validated_data)


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = '__all__'

class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)
    
    class Meta:
        model = UserAchievement
        fields = ('id', 'achievement', 'date_earned')

class ContributorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(read_only=True)
    profile_name = serializers.CharField(source='profile.profile_name', read_only=True)
    xp = serializers.IntegerField(source='profile.xp', read_only=True)
    level = serializers.IntegerField(source='profile.level', read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'profile_name', 'xp', 'level')

class CommunitySerializer(serializers.ModelSerializer):
    members_count = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()
    top_contributors = serializers.SerializerMethodField()
    active_challenge = serializers.SerializerMethodField()
    challenge_progress = serializers.SerializerMethodField()

    class Meta:
        model = Community
        fields = '__all__'
        read_only_fields = ('created_by', 'members', 'total_community_emission', 'created_at')

    def get_members_count(self, obj):
        return obj.members.count()

    def get_is_member(self, obj):
        request = self.context.get('request')
        user = None
        
        if request and request.user.is_authenticated:
            user = request.user
        elif request:
             # Fallback for anon requests using query param if available
             email = request.query_params.get('email')
             if email:
                 try:
                     user = User.objects.get(email=email)
                 except User.DoesNotExist:
                     pass
        
        if user:
            return obj.members.filter(id=user.id).exists()
        return False
    
    def get_top_contributors(self, obj):
        # Get top 3 members sorted by XP (descending)
        # We need to join with Profile to sort by xp
        # Filter profile__isnull=False to avoid crashes if user has no profile
        top_members = obj.members.filter(profile__isnull=False).select_related('profile').order_by('-profile__xp')[:3]
        return ContributorSerializer(top_members, many=True).data

    def get_active_challenge(self, obj):
        from django.utils import timezone
        today = timezone.now().date()
        challenge = obj.challenges.filter(end_date__gte=today).first()
        return challenge.title if challenge else None

    def get_challenge_progress(self, obj):
        from django.utils import timezone
        from django.db.models import Sum
        today = timezone.now().date()
        challenge = obj.challenges.filter(end_date__gte=today).first()
        
        if challenge and challenge.target_value > 0:
            total_progress = UserChallengeProgress.objects.filter(challenge=challenge).aggregate(Sum('current_value'))['current_value__sum'] or 0
            return min(int((total_progress / challenge.target_value) * 100), 100)
        return 0

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Handle image logic: if image exists, use it, else use image_url
        if instance.image:
             # Let DRF handle the full URL for the image field
             pass
        elif instance.image_url:
             representation['image'] = instance.image_url
        return representation

class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = '__all__'

class UserChallengeProgressSerializer(serializers.ModelSerializer):
    challenge = ChallengeSerializer(read_only=True)
    
    class Meta:
        model = UserChallengeProgress
        fields = ('id', 'challenge', 'current_value', 'is_completed')

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = '__all__'
        read_only_fields = ('user', 'carbon_footprint_kg', 'timestamp')

    def to_internal_value(self, data):
        # Polymorphic mapping logic
        category = data.get('category')
        mutable_data = data.copy()
        
        description = ""
        value = 0.0
        unit = ""

        try:
            if category == 'transport':
                mode = data.get('mode', 'Unknown')
                distance = float(data.get('distance', 0))
                description = f"Travel: {mode}"
                value = distance
                unit = 'km'
            
            elif category == 'energy':
                source = data.get('source', 'Unknown')
                usage = float(data.get('usage', 0))
                description = f"Energy: {source}"
                value = usage
                unit = 'kWh'
            
            elif category == 'food':
                diet_type = data.get('dietType', 'Unknown')
                meal_type = data.get('mealType', 'Unknown')
                quantity = float(data.get('quantity', 1))
                description = f"Food: {diet_type} ({meal_type})"
                value = quantity
                unit = data.get('unit', 'serving')
            
            elif category == 'consumption':
                purchase_category = data.get('purchaseCategory', 'Unknown')
                amount = float(data.get('amount', 0))
                description = f"Purchase: {purchase_category}"
                value = amount
                unit = 'INR'
            
            elif category == 'waste':
                waste_type = data.get('wasteType', 'Unknown')
                weight = float(data.get('weight', 0))
                description = f"Waste: {waste_type}"
                value = weight
                unit = 'kg'
                
        except (ValueError, TypeError):
            raise serializers.ValidationError("Invalid data format for value fields.")

        # Set the mapped fields
        mutable_data['description'] = description
        mutable_data['value'] = value
        mutable_data['unit'] = unit
        
        return super().to_internal_value(mutable_data)

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'profile')

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        profile = instance.profile

        instance.email = validated_data.get('email', instance.email)
        instance.save()

        profile.first_name = profile_data.get('first_name', profile.first_name)
        profile.last_name = profile_data.get('last_name', profile.last_name)
        profile.phone_no = profile_data.get('phone_no', profile.phone_no)
        profile.city = profile_data.get('city', profile.city)
        profile.state = profile_data.get('state', profile.state)
        
        # Update new fields if provided
        profile.carbon_budget_kg = profile_data.get('carbon_budget_kg', profile.carbon_budget_kg)
        profile.is_iot_connected = profile_data.get('is_iot_connected', profile.is_iot_connected)
        
        # Org Linking Logic
        target_org_id = profile_data.get('target_org_id')
        if target_org_id:
            try:
                org = Organization.objects.get(org_id=target_org_id)
                profile.organization = org
            except Organization.DoesNotExist:
                raise serializers.ValidationError({"profile": {"target_org_id": "Organization with this ID not found."}})
        
        profile.save()

        return instance

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class ComplianceThresholdSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplianceThreshold
        fields = (
            'id', 'daily_limit_kg', 'monthly_limit_kg',
            'carbon_tax_rate', 'warning_threshold_percent', 'is_active',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class ComplianceAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplianceAlert
        fields = ('id', 'alert_type', 'message', 'is_read', 'is_dismissed', 'created_at', 'read_at')


class ComplianceViolationSerializer(serializers.ModelSerializer):
    alerts = ComplianceAlertSerializer(many=True, read_only=True)

    class Meta:
        model = ComplianceViolation
        fields = (
            'id', 'timestamp', 'period_type', 'period_date',
            'measured_co2_kg', 'allowed_limit_kg', 'excess_emission_kg',
            'carbon_tax_rate', 'penalty_amount', 'compliance_status',
            'alert_sent', 'alert_sent_at', 'notes', 'alerts',
        )


from .models import GreenInvestment

class GreenInvestmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = GreenInvestment
        fields = (
            'id', 'investment_id', 'title', 'category', 'description',
            'current_monthly_kwh', 'electricity_rate',
            'investment_cost', 'monthly_savings', 'annual_savings',
            'annual_co2_reduction_kg', 'payback_months', 'roi_percent_5yr',
            'is_implemented', 'implemented_at', 'created_at',
        )
        read_only_fields = ('id', 'created_at')
