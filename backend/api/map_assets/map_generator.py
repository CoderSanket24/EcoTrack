import geopandas as gpd
import pandas as pd
import folium
import os
from functools import lru_cache

# Get the absolute path to the directory this script is in
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SHAPEFILE_PATH = os.path.join(BASE_DIR, "Indian_States.shp")

@lru_cache(maxsize=1)
def load_shapefile():
    """
    Loads the shapefile and returns the GeoDataFrame.
    Cached to avoid reloading on every request.
    """
    if not os.path.exists(SHAPEFILE_PATH):
        return None
    return gpd.read_file(SHAPEFILE_PATH).to_crs(epsg=4326)

def generate_india_heatmap_from_profiles(profiles):
    """
    Generates an interactive Folium heatmap of India by extracting state names
    from the Profile model's 'state' field.

    Args:
        profiles (QuerySet): A Django QuerySet of the Profile model.

    Returns:
        str: A string containing the HTML representation of the Folium map,
             or an error message string if an issue occurs.
    """
    try:
        # 1. Load the Geospatial Data (Cached)
        india_gdf = load_shapefile()
        if india_gdf is None:
             return "<p style='color:red; text-align:center;'>Error: Shapefile not found.</p>"

        # 2. Process User Profiles to Get State Counts
        state_list = []
        for profile in profiles:
            if profile.state:
                try:
                    state = profile.state.strip()
                    state_list.append(state)
                except IndexError:
                    pass
        
        if not state_list:
            user_df = pd.DataFrame(columns=['state', 'user_count'])
        else:
            user_df = pd.DataFrame(state_list, columns=['state'])
            user_df = user_df.groupby('state').size().reset_index(name='user_count')

        # 3. Merge Geospatial Data with User Data
        merged_gdf = india_gdf.merge(user_df, left_on='st_nm', right_on='state', how='left')
        merged_gdf['user_count'] = merged_gdf['user_count'].fillna(0).astype(int)

        # 4. Create the Interactive Map with Folium
        # Centered on India
        india_map = folium.Map(location=[22.5937, 78.9629], zoom_start=4, tiles="CartoDB positron")

        choropleth = folium.Choropleth(
            geo_data=merged_gdf,
            data=merged_gdf,
            columns=['st_nm', 'user_count'],
            key_on='feature.properties.st_nm',
            fill_color='YlGn', # Yellow-Green color scale
            fill_opacity=0.7,
            line_opacity=0.2,
            legend_name='Number of Users',
            highlight=True,
            name='User Distribution'
        ).add_to(india_map)
        
        # 5. Add Tooltips
        folium.features.GeoJsonTooltip(
            fields=['st_nm', 'user_count'],
            aliases=['State:', 'Users:'],
            style=("background-color: white; color: #333333; font-family: arial; font-size: 12px; padding: 10px;")
        ).add_to(choropleth.geojson)

        # 6. Return the Map as an HTML String
        return india_map._repr_html_()

    except Exception as e:
        return f"<p style='color:red; text-align:center;'>An error occurred: {e}</p>"

