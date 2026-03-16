import { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';

const SatelliteEmissionDetection = () => {
    const [data, setData] = useState({ hotspots: [], projections: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const mapRef = useRef(null);
    const mapInstance = useRef(null);

    useEffect(() => {
        const fetchSatelliteData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/satellite-emissions/`);
                if (!response.ok) throw new Error('Failed to fetch satellite data');
                const result = await response.json();
                setData(result);
            } catch (err) {
                console.error("Error fetching map:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSatelliteData();
    }, []);

    useEffect(() => {
        if (loading || error) return;
        
        // Wait for L to be defined (from CDN) and mapRef to be ready
        if (!window.L || !mapRef.current) return;

        if (!mapInstance.current) {
            mapInstance.current = window.L.map(mapRef.current).setView([20.5937, 78.9629], 4); 

            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapInstance.current);
        }

        // Clear existing layers if necessary
        mapInstance.current.eachLayer((layer) => {
            if (layer instanceof window.L.CircleMarker) {
                mapInstance.current.removeLayer(layer);
            }
        });

        if (data.hotspots) {
            data.hotspots.forEach(point => {
                window.L.circleMarker([point.latitude, point.longitude], {
                    color: "red",
                    radius: 8
                }).addTo(mapInstance.current)
                  .bindPopup(`Satellite detected emission hotspot<br/>NO2: ${point.no2}`);
            });
        }
    }, [loading, error, data]);

    return (
        <section className="py-16 px-4 bg-white dark:bg-gray-800 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Satellite Emission Detection</h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Global CO₂ emissions and Satellite detected emission hotspots.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Map Container */}
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Emission Hotspots</h3>
                            <div 
                                ref={mapRef} 
                                className="w-full h-[400px] rounded-lg relative z-0"
                            ></div>
                        </div>

                        {/* Chart Container */}
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">5-Year CO₂ Projection</h3>
                            <div className="w-full h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data.projections}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                        <XAxis dataKey="year" stroke="#8884d8" />
                                        <YAxis stroke="#8884d8" />
                                        <RechartsTooltip 
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                                        />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="emission" 
                                            name="CO₂ Emission Trend" 
                                            stroke="#ef4444" 
                                            strokeWidth={3}
                                            dot={{ r: 4 }} 
                                            activeDot={{ r: 6 }} 
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default SatelliteEmissionDetection;
