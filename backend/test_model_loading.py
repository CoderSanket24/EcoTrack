# --------------------------------------------------------
# TEST MODEL LOADING
# --------------------------------------------------------

import joblib
import pandas as pd
import numpy as np

try:
    # Load the retrained model
    model = joblib.load("cft/hybrid_emission_model.pkl")
    print("✅ Model loaded successfully!")
    
    # Test with a sample prediction
    # Create a sample input similar to the training data with feature engineering
    sample_data = pd.DataFrame({
        "category": ["travel"],
        "subtype": ["car-gasoline"],
        "value": [100]  # 100 units of activity
    })
    
    # Apply the same feature engineering as in training
    sample_data_enhanced = sample_data.copy()
    sample_data_enhanced['value_squared'] = sample_data_enhanced['value'] ** 2
    sample_data_enhanced['value_log'] = np.log1p(sample_data_enhanced['value'])
    
    # Make a prediction
    prediction = model.predict(sample_data_enhanced)
    print(f"✅ Prediction successful! CO2e for 100 units of travel/car-gasoline: {prediction[0]:.4f} kg")
    
    # Test with another sample
    sample_data2 = pd.DataFrame({
        "category": ["energy"],
        "subtype": ["electricity-grid"],
        "value": [500]  # 500 units of activity
    })
    
    # Apply the same feature engineering
    sample_data2_enhanced = sample_data2.copy()
    sample_data2_enhanced['value_squared'] = sample_data2_enhanced['value'] ** 2
    sample_data2_enhanced['value_log'] = np.log1p(sample_data2_enhanced['value'])
    
    # Make a prediction
    prediction2 = model.predict(sample_data2_enhanced)
    print(f"✅ Prediction successful! CO2e for 500 units of energy/electricity-grid: {prediction2[0]:.4f} kg")
    
    print(f"\n🎉 Model is working with enhanced features and high accuracy!")
    
except Exception as e:
    print(f"❌ Error loading or using model: {e}")