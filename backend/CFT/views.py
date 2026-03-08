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
