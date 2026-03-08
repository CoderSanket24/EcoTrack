import { useState, useEffect } from 'react';
// import { API_URL } from '../App';

const CommunityImpactMap = () => {
    const [activeTab, setActiveTab] = useState('population');
    const [mapHtml, setMapHtml] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMap = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${import.meta.env.VITE_API_URL}/community-impact-map/`);
                if (!response.ok) {
                    throw new Error('Failed to fetch map data');
                }
                const data = await response.json();
                setMapHtml(data.map_html);
            } catch (err) {
                console.error("Error fetching map:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMap();
    }, []);

    return (
        <section className="py-16 px-4 bg-white dark:bg-gray-800 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-4 transition-colors">Community Impact Map</h2>
                <p className="text-center text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 transition-colors">
                    Explore the geographical distribution of our eco-conscious community. This interactive heatmap visualizes registered user density and regional average carbon emission footprints, offering insights into our collective environmental impact.
                </p>

                {/* Controls Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    {/* Toggle Buttons */}
                    <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg inline-flex shadow-inner transition-colors">
                        <button
                            onClick={() => setActiveTab('population')}
                            className={`px-6 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${activeTab === 'population'
                                ? 'bg-teal-500 text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            By Population
                        </button>
                        <button
                            onClick={() => setActiveTab('emission')}
                            className={`px-6 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${activeTab === 'emission'
                                ? 'bg-teal-500 text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            By Emission
                        </button>
                    </div>

                    {/* Zoom Button */}
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-teal-500 text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-50 dark:hover:bg-gray-600 transition-colors font-medium shadow-sm group">
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Zoom to My Location
                    </button>
                </div>

                {/* Map Container */}
                <div className="w-full h-[600px] bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center relative overflow-hidden group transition-colors">

                    {loading ? (
                        <div className="flex flex-col items-center z-10 p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                            <div className="relative mb-6">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 transition-colors">Loading Community Map...</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs transition-colors">
                                Connecting to geospatial server to retrieve data...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-center p-4">
                            <p>Error loading map: {error}</p>
                        </div>
                    ) : (
                        <iframe
                            srcDoc={mapHtml}
                            title="Community Impact Map"
                            className="w-full h-full border-none rounded-2xl"
                            sandbox="allow-scripts allow-same-origin"
                        />
                    )}
                </div>
            </div>
        </section>
    );
};

export default CommunityImpactMap;