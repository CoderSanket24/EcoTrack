from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LinearRegression
import numpy as np
import os
from django.conf import settings

class SatelliteEmissionView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # 1. Load satellite pollution dataset
            csv_path = os.path.join(settings.BASE_DIR, 'satellite_data.csv')
            data = pd.read_csv(csv_path)

            # 2. Detect abnormal pollution levels using Isolation Forest
            model = IsolationForest(contamination=0.2, random_state=42)
            data["anomaly"] = model.fit_predict(data[["no2"]])
            hotspots = data[data["anomaly"] == -1]

            # 3. Simple linear regression: future CO2 emission trend (Projection)
            historical_years = np.array([2019, 2020, 2021, 2022, 2023]).reshape(-1, 1)
            # CO2 measurements hypothetically corresponding to NO2 levels
            historical_emissions = np.array([36.7, 34.8, 36.3, 36.8, 37.4]) 
            
            lr = LinearRegression()
            lr.fit(historical_years, historical_emissions)
            
            # Predict for next 5 years
            future_years = np.array([2024, 2025, 2026, 2027, 2028]).reshape(-1, 1)
            future_preds = lr.predict(future_years)

            # Combine data for frontend chart
            combined_years = np.vstack((historical_years, future_years)).flatten()
            combined_emissions = np.concatenate((historical_emissions, future_preds))

            projection_data = [
                {"year": int(y), "emission": round(e, 2)}
                for y, e in zip(combined_years, combined_emissions)
            ]

            return Response({
                "hotspots": hotspots[["latitude", "longitude", "no2"]].to_dict(orient="records"),
                "projections": projection_data
            })
        except Exception as e:
            return Response({"error": str(e)}, status=500)
