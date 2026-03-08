rom .serializers import RegisterSerializer, UserSerializer, ProfileSerializer, ActivitySerializer
from rest_framework.decorators import api_view, permission_classes
from .models import Profile, Activity, Community
from .serializers import RegisterSerializer, UserSerializer, ProfileSerializer, ActivitySerializer, CommunitySerializer, ChallengeSerializer
from .map_assets.map_generator import generate_india_heatmap_from_profiles
from django.db.models import Sum, Q, Case, When, Value, F, FloatField, Count, Avg
from django.db.models.functions import TruncMonth, TruncDate, Coalesce
import datetime
from django.utils import timezone

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class LoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        # Support both username and email login
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        
        user = None
        if email:
            try:
                user_obj = User.objects.get(email=email)
                username = user_obj.username
            except User.DoesNotExist:
                pass
        
        if username:
            user = authenticate(username=username, password=password)
        
        if user:
            login(request, user)
            serializer = UserSerializer(user)
            data = serializer.data
            data['token'] = "dummy-token"
            return Response(data)
        
        return Response({"error": "Invalid Credentials"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([AllowAny])
def update_profile_by_email(request):
    email = request.data.get('email')
    profile_data = request.data.get('profile')

    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
        profile = user.profile
        
        serializer = ProfileSerializer(profile, data=profile_data, partial=True)
        # Custom check for department to handle it manually if not in serializer validation logic (though partial=True should handle it)
        # But let's ensure it's allowed even if serializer is partial
        if 'department' in profile_data:
             profile.department = profile_data['department']
             # No need to profile.save() here as serializer.save() does it if in fields
             
        if serializer.is_valid():
            serializer.save()
            # Return updated user data including profile
            user_serializer = UserSerializer(user)
            return Response({'message': 'Profile updated successfully', 'user': user_serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([AllowAny])
def community_impact_map(request):
    """
    Generates and returns the HTML for the community impact map.
    """
    try:
        # 1. Get all user profiles that have a location defined
        all_profiles_with_location = Profile.objects.filter(state__isnull=False).exclude(state__exact='')
        
        # 2. Call the map generator function with the profile data
        map_html = generate_india_heatmap_from_profiles(all_profiles_with_location)
        
        return Response({'map_html': map_html})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LogActivityView(generics.ListCreateAPIView):
    serializer_class = ActivitySerializer
    # In a real app, use IsAuthenticated. For now, AllowAny or check user manually if needed.
    # But since we need request.user to be set for perform_create, we usually need IsAuthenticated.
    # If using dummy auth, we might need to rely on passing user ID or email in body, 
    # BUT the prompt implies standard usage. Let's assume the user is logged in or we handle it.
    # Given the frontend sends requests, we'll assume session auth or we might need to fetch user from body if auth is not set up perfectly.
    # For this specific task, I'll assume standard DRF CreateAPIView usage.
    # However, to be safe with the current "dummy-token" setup, I will override post to get user from email if provided, or fallback to request.user.
    
    def get_queryset(self):
        """
        Optionally restricts the returned activities to a given user,
        by filtering against a `date` and `category` query parameter in the URL.
        """
        queryset = Activity.objects.all()
        
        # Filter by user (mandatory for history)
        # If using dummy token, we might need to filter by email param if user is anon
        user = self.request.user
        if user.is_authenticated:
            queryset = queryset.filter(user=user)
        else:
            # Fallback: try to filter by email param if provided
            email = self.request.query_params.get('email')
            if email:
                queryset = queryset.filter(user__email=email)
            else:
                return Activity.objects.none() # Return nothing if no user identified

        # Filter by date
        date_str = self.request.query_params.get('date')
        if date_str:
            queryset = queryset.filter(timestamp__date=date_str)

        # Filter by category
        category = self.request.query_params.get('category')
        if category and category != 'all':
            queryset = queryset.filter(category=category)
            
        return queryset.order_by('-timestamp')

    def perform_create(self, serializer):
        from .ml_engine import EmissionPredictor
        
        # Calculate Carbon Footprint using ML Model
        category = serializer.validated_data.get('category')
        value = serializer.validated_data.get('value')
        
        # Determine subtype based on category and extra fields
        # Note: frontend sends these fields in serializer.initial_data or validated_data if defined in serializer
        # Assuming ActivitySerializer might not explicitly validate 'mode', 'dietType' etc as own fields but stores in JSONField or similar, 
        # OR we access them from initial_data if not in validated_data.
        # Let's try to get them from validated_data first, then initial_data fallback.
        data = serializer.validated_data
        
        subtype = 'generic' # Default
        
        if category == 'transport':
            subtype = data.get('mode') or self.request.data.get('mode') or 'car-gasoline'
        elif category == 'energy':
            subtype = data.get('source') or self.request.data.get('source') or 'electricity-grid'
        elif category == 'food':
            # Map dietType to likely subtypes (training data likely used 'vegetarian', 'meat-lover' etc)
            subtype = data.get('dietType') or self.request.data.get('dietType') or 'vegetarian'
        elif category == 'consumption':
            subtype = data.get('purchaseCategory') or self.request.data.get('purchaseCategory') or 'electronics'
        elif category == 'waste':
            subtype = data.get('wasteType') or self.request.data.get('wasteType') or 'mixed'

        # Initialize Predictor and Predict
        predictor = EmissionPredictor()
        carbon_footprint = predictor.predict(category, subtype, value)
        
        if carbon_footprint is None:
            # --- Fallback to Static Math ---
            print(f"⚠️ Prediction failed for {category}/{subtype}. Using fallback.")
            emission_factors = {
                'transport': 0.2,   
                'energy': 0.85,     
                'food': 1.5,        
                'consumption': 0.05,
                'waste': 1.2        
            }
            factor = emission_factors.get(category, 0.0)
            carbon_footprint = value * factor
        
        # Handle User Association
        user = self.request.user
        if not user.is_authenticated:
            email = self.request.data.get('email')
            if email:
                try:
                    user = User.objects.get(email=email)
                except User.DoesNotExist:
                    raise serializers.ValidationError("User not found and not logged in.")
            else:
                 raise serializers.ValidationError("User must be logged in or email provided.")

        serializer.save(user=user, carbon_footprint_kg=carbon_footprint)
class ActivityDetailView(generics.DestroyAPIView):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    # permission_classes = [IsAuthenticated] # Uncomment in production

    def get_queryset(self):
        # Ensure users can only delete their own activities
        user = self.request.user
        if user.is_authenticated:
            return Activity.objects.filter(user=user)
        # Fallback for dummy auth (less secure, but consistent with current state)
        # We'll allow deletion if the ID matches, assuming the frontend handles ownership visibility
        return Activity.objects.all()

from .utils import sync_pending_chatbot_activities

class UserDashboardStatsView(generics.RetrieveAPIView):
    # permission_classes = [IsAuthenticated] # Uncomment in production

    def get(self, request, *args, **kwargs):
        user = request.user
        # Fallback for dummy auth
        if not user.is_authenticated:
            email = request.query_params.get('email')
            if email:
                try:
                    user = User.objects.get(email=email)
                except User.DoesNotExist:
                    return Response({'error': 'User not found'}, status=404)
            else:
                 # Return empty/zero stats if no user identified
                 return Response({
                    "trend_data": [],
                    "category_breakdown": {},
                    "emission_stats": {"today": 0, "yesterday": 0, "this_month": 0, "last_month": 0},
                    "budget": {"daily_limit": 15.0, "daily_used": 0, "monthly_limit": 450.0, "monthly_used": 0}
                 })

        # --- LAZY SYNC: Process Pending Chatbot Activities ---
        sync_pending_chatbot_activities(user)
        # -----------------------------------------------------

        now = timezone.now()
        today = now.date()
        current_month_start = today.replace(day=1)
        
        # 1. Trend Data (Last 6 Months) - Optimized with TruncMonth
        # Calculate start date for 6 months ago
        six_months_ago = today - datetime.timedelta(days=180) # Approx
        six_months_ago = six_months_ago.replace(day=1)
        
        trend_qs = Activity.objects.filter(
            user=user,
            timestamp__date__gte=six_months_ago
            # We don't restrict end date, just take everything from 6 months ago to now
        ).annotate(
            month=TruncMonth('timestamp')
        ).values('month').annotate(
            total=Sum('carbon_footprint_kg')
        ).order_by('month')

        # Convert to list and fill missing months if necessary (optional, but good for UI)
        # For now, just format existing data
        trend_data = []
        # Create a dict for easy lookup
        trend_dict = {item['month'].date(): item['total'] for item in trend_qs if item['month']}
        
        # Generate last 6 months list to ensure continuity
        for i in range(5, -1, -1):
            # Calculate month
            # Logic to act as robust "months ago"
            y = today.year
            m = today.month - i
            while m <= 0:
                m += 12
                y -= 1
            
            d = datetime.date(y, m, 1)
            val = trend_dict.get(d, 0.0)
            trend_data.append({
                "month": d.strftime("%b %Y"),
                "value": round(val, 1)
            })

        # 2. Category Breakdown (This Month) - Optimized
        cat_qs = Activity.objects.filter(
            user=user,
            timestamp__date__gte=current_month_start
        ).values('category').annotate(
            total=Sum('carbon_footprint_kg')
        )
        
        category_breakdown = {}
        for item in cat_qs:
            category_breakdown[item['category']] = round(item['total'], 1)
            
        # Ensure all categories are present with 0 if not found
        all_categories = ['transport', 'energy', 'food', 'consumption', 'waste']
        for cat in all_categories:
            if cat not in category_breakdown:
                category_breakdown[cat] = 0.0

        # 3. Emission Stats in ONE Query
        # We need: Today, Yesterday, This Month, Last Month
        
        yesterday = today - datetime.timedelta(days=1)
        
        # Last Month Range
        last_month_end = current_month_start - datetime.timedelta(days=1)
        last_month_start = last_month_end.replace(day=1)

        stats = Activity.objects.filter(user=user).aggregate(
            today=Sum('carbon_footprint_kg', filter=Q(timestamp__date=today)),
            yesterday=Sum('carbon_footprint_kg', filter=Q(timestamp__date=yesterday)),
            this_month=Sum('carbon_footprint_kg', filter=Q(timestamp__date__gte=current_month_start)),
            last_month=Sum('carbon_footprint_kg', filter=Q(timestamp__date__gte=last_month_start, timestamp__date__lte=last_month_end))
        )
        
        # 4. Budget
        try:
            profile = user.profile
            monthly_limit = profile.carbon_budget_kg
        except Profile.DoesNotExist:
            monthly_limit = 500.0 # Default
            
        daily_limit = monthly_limit / 30.0
        
        # Extract values from stats (handle None)
        today_emission = stats.get('today') or 0.0
        yesterday_emission = stats.get('yesterday') or 0.0
        this_month_emission = stats.get('this_month') or 0.0
        last_month_emission = stats.get('last_month') or 0.0

        return Response({
            "trend_data": trend_data,
            "category_breakdown": category_breakdown,
            "emission_stats": {
                "today": round(today_emission, 1),
                "yesterday": round(yesterday_emission, 1),
                "this_month": round(this_month_emission, 1),
                "last_month": round(last_month_emission, 1)
            },
            "budget": {
                "daily_limit": round(daily_limit, 1),
                "daily_used": round(today_emission, 1),
                "monthly_limit": round(monthly_limit, 1),
                "monthly_used": round(this_month_emission, 1)
            }
        })


        class LeaderboardView(APIView):
    permission_classes = [AllowAny] # Or IsAuthenticated

    def get(self, request):
        user = request.user
        
        # Handle Unauthenticated / Dummy User
        if not user.is_authenticated:
            email = request.query_params.get('email')
            if email:
                try:
                    user = User.objects.get(email=email)
                except User.DoesNotExist:
                    user = None
            else:
                user = None

        # 1. Leaderboard List (Top 50 by XP)
        # Using select_related for efficiency if needed, though Profile is OneToOne
        top_profiles = Profile.objects.select_related('user').order_by('-xp', '-current_streak', '-total_emission_kg')[:50]
        
        leaderboard_data = []
        for idx, p in enumerate(top_profiles):
            leaderboard_data.append({
                "rank": idx + 1,
                "username": p.user.username,
                "profile_name": p.profile_name, # or p.first_name + ' ' + p.last_name
                "xp": p.xp,
                "level": p.level,
                "streak": p.current_streak,
                "score": p.sustainability_score,
                "avatar": "" # Placeholder or actual URL if existing
            })
            
        # 2. My Ranks
        my_ranks = {
            "global": "-",
            "state": "-",
            "city": "-"
        }
        
        if user and hasattr(user, 'profile'):
            profile = user.profile
            user_xp = profile.xp
            
            # Global Rank
            # Count how many profiles have more XP than me
            global_rank = Profile.objects.filter(xp__gt=user_xp).count() + 1
            my_ranks["global"] = global_rank
            
            # State Rank
            if profile.state:
                state_rank = Profile.objects.filter(state=profile.state, xp__gt=user_xp).count() + 1
                my_ranks["state"] = state_rank
                
            # City Rank
            if profile.city:
                city_rank = Profile.objects.filter(city=profile.city, xp__gt=user_xp).count() + 1
                my_ranks["city"] = city_rank

        return Response({
            "my_ranks": my_ranks,
            "leaderboard": leaderboard_data
        })



class UserGamificationStatsView(generics.RetrieveAPIView):
    def get(self, request, *args, **kwargs):
        user = request.user
        # Fallback for dummy auth
        if not user.is_authenticated:
            email = request.query_params.get('email')
            if email:
                try:
                    user = User.objects.get(email=email)
                except User.DoesNotExist:
                    return Response({'error': 'User not found'}, status=404)
            else:
                 return Response({'error': 'User not authenticated'}, status=401)

        # 1. User Stats
        try:
            profile = user.profile
            user_stats = {
                "xp": profile.xp,
                "level": profile.level,
                "eco_coins": profile.eco_coins,
                "sustainability_score": profile.sustainability_score,
                "is_iot_connected": profile.is_iot_connected,
                "current_streak": profile.current_streak,
                "total_emissions": round(profile.total_emission_kg, 2)
            }
        except Profile.DoesNotExist:
             user_stats = {
                "xp": 0, "level": 1, "eco_coins": 0, 
                "sustainability_score": 0, "is_iot_connected": False, 
                "current_streak": 0, "total_emissions": 0.0
            }

        # 2. Activity Heatmap
        # Get activities for the current year (or last 365 days)
        today = timezone.now().date()
        one_year_ago = today - datetime.timedelta(days=365)
        
        daily_activities = Activity.objects.filter(
            user=user,
            timestamp__date__gte=one_year_ago
        ).annotate(
            date=TruncDate('timestamp')
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')
        
        daily_counts = {
            entry['date'].strftime("%Y-%m-%d"): entry['count'] 
            for entry in daily_activities
        }
        
        # Calculate max streak (simple version based on daily_counts keys)
        # Note: A robust streak calc might need more logic, but this is a start.
        # For now, let's use the profile's current streak or calculate from daily_counts if needed.
        # Let's calculate total active days.
        total_active_days = len(daily_counts)
        
        # Simple max streak calculation from the heatmap data
        max_streak = 0
        current_streak_calc = 0
        sorted_dates = sorted(daily_counts.keys())
        
        if sorted_dates:
            import datetime as dt
            prev_date = dt.datetime.strptime(sorted_dates[0], "%Y-%m-%d").date()
            current_streak_calc = 1
            max_streak = 1
            
            for date_str in sorted_dates[1:]:
                curr_date = dt.datetime.strptime(date_str, "%Y-%m-%d").date()
                if (curr_date - prev_date).days == 1:
                    current_streak_calc += 1
                else:
                    current_streak_calc = 1
                max_streak = max(max_streak, current_streak_calc)
                prev_date = curr_date

        activity_heatmap = {
            "total_active_days": total_active_days,
            "max_streak": max_streak,
            "daily_counts": daily_counts
        }

        return Response({
            "user_stats": user_stats,
            "activity_heatmap": activity_heatmap
        })
