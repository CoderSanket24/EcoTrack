import React, { useState, useEffect } from 'react';

const ActionableInsights = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-center gap-3 mb-12">
                        <img src="https://cdn-icons-png.flaticon.com/512/427/427735.png" alt="Idea" className="w-8 h-8 opacity-50" />
                        <h2 className="text-3xl font-bold text-gray-400 dark:text-gray-500 transition-colors">Actionable Insights</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 h-64 animate-pulse flex flex-col justify-between transition-colors">
                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 transition-colors"></div>
                                <div className="space-y-3">
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 transition-colors"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full transition-colors"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 transition-colors"></div>
                                </div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-4 transition-colors"></div>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-gray-500 dark:text-gray-400 mt-8 animate-pulse transition-colors">Loading personalized insights...</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-12">
                    <img src="https://cdn-icons-png.flaticon.com/512/427/427735.png" alt="Idea" className="w-8 h-8" />
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white transition-colors">Actionable Insights</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Eco Tip Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border-l-4 border-yellow-400 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <img src="https://cdn-icons-png.flaticon.com/512/2983/2983814.png" alt="Tip" className="w-8 h-8" />
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white transition-colors">Today's Eco Tip</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg transition-colors">
                            Replace 1 car trip with biking today
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors">
                            Potential save: <span className="text-teal-600 dark:text-teal-400 transition-colors">2.3kg CO2</span>
                        </p>
                    </div>

                    {/* Weather Advice Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border-l-4 border-blue-400 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <img src="https://cdn-icons-png.flaticon.com/512/869/869869.png" alt="Sun" className="w-8 h-8" />
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white transition-colors">Weather Advice</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg transition-colors">
                            Perfect day for cycling!
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors">
                            Air quality: <span className="text-green-600 dark:text-green-400 transition-colors">Good</span>
                        </p>
                    </div>

                    {/* Local Events Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border-l-4 border-green-400 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <img src="https://cdn-icons-png.flaticon.com/512/628/628283.png" alt="Plant" className="w-8 h-8" />
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white transition-colors">Local Events</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-white leading-tight mb-1 transition-colors">LEAP India Begins AQI Awareness Drive</h4>
                                <p className="text-xs text-gray-400 dark:text-gray-500 transition-colors">26 Nov, 2025</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-white leading-tight mb-1 transition-colors">School-Led Tree Plantation Drive</h4>
                                <p className="text-xs text-gray-400 dark:text-gray-500 transition-colors">20 Nov, 2025</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ActionableInsights;