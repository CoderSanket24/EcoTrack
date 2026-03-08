import joblib
import pandas as pd
import numpy as np
import os
from django.conf import settings

class EmissionPredictor:
    def __init__(self):
        self.model = None
        self.model_path = os.path.join(settings.BASE_DIR, 'hybrid_emission_model.pkl')
        self._load_model()

    def _load_model(self):
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                print(f"ML Model loaded successfully from {self.model_path}")
            else:
                print(f"ML Model not found at {self.model_path}. Using static fallback.")
        except Exception as e:
            print(f"Error loading ML model: {e}")

    def predict(self, category, subtype, value):
        """
        Predicts carbon footprint using the ML model.
        Returns predicted float value or None if prediction fails.
        """
        if not self.model:
            return None

        try:
            # 1. Prepare Input DataFrame
            # Model expects: ['category', 'subtype', 'value', 'value_squared', 'value_log']
            data = pd.DataFrame({
                "category": [category],
                "subtype": [subtype],
                "value": [float(value)]
            })

            # 2. Feature Engineering
            data['value_squared'] = data['value'] ** 2
            data['value_log'] = np.log1p(data['value'])

            # 3. Predict
            prediction = self.model.predict(data)
            return float(prediction[0])

        except Exception as e:
            print(f"Prediction error: {e}")
            return None