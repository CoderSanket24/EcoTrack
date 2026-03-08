import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
// import { API_URL } from '../App';

const ActivityItem = ({ icon, title, description, impact, color }) => (
    <div className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-teal-100 dark:hover:border-teal-900 hover:shadow-md transition-all duration-300 group">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mr-4 ${color}`}>
            {icon}
        </div>
        <div className="flex-grow">
            <h4 className="font-bold text-gray-800 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-bold">
                {impact}
            </span>
        </div>
    </div>
);

const fetchActivities = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // Use provided test email or fallback to logged in user
    const email = user.email || 'adityashahil346@gmail.com';

    const response = await fetch(`${import.meta.env.VITE_API_URL}/log-activity/?email=${email}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const RecentActivities = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: activities = [], isLoading, error } = useQuery({
        queryKey: ['activities'],
        queryFn: fetchActivities,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'transport': return '🚗';
            case 'energy': return '⚡';
            case 'food': return '🍽️';
            case 'consumption': return '🛍️';
            case 'waste': return '♻️';
            default: return '🌱';
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'transport': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
            case 'energy': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'food': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
            case 'consumption': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
            case 'waste': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
            default: return 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Display only first 3 activities
    const displayedActivities = activities.slice(0, 3);

    return (
        <div>
            <h2 className="text-2xl font-bold text-teal-800 dark:text-teal-400 mb-6 text-center transition-colors duration-300">Your Recent Activities</h2>

            <div className="space-y-4">
                {isLoading ? (
                    <p className="text-center text-gray-500">Loading activities...</p>
                ) : error ? (
                    <p className="text-center text-red-500">Error loading activities.</p>
                ) : activities.length > 0 ? (
                    displayedActivities.map((activity) => (
                        <ActivityItem
                            key={activity.id}
                            icon={getCategoryIcon(activity.category)}
                            title={activity.description}
                            description={`Logged on ${formatDate(activity.timestamp)}`}
                            impact={`+${activity.carbon_footprint_kg.toFixed(1)} kg CO2e`}
                            color={getCategoryColor(activity.category)}
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-500">No activities logged yet.</p>
                )}
            </div>

            {activities.length > 0 && (
                <div className="mt-8 text-center">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-2 bg-white dark:bg-gray-800 border border-teal-500 dark:border-teal-400 text-teal-600 dark:text-teal-400 font-semibold rounded-full hover:bg-teal-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        View More
                    </button>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">All Activities</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-grow space-y-4">
                            {activities.map((activity) => (
                                <ActivityItem
                                    key={activity.id}
                                    icon={getCategoryIcon(activity.category)}
                                    title={activity.description}
                                    description={`Logged on ${formatDate(activity.timestamp)}`}
                                    impact={`+${activity.carbon_footprint_kg.toFixed(1)} kg CO2e`}
                                    color={getCategoryColor(activity.category)}
                                />
                            ))}
                        </div>

                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 text-center">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecentActivities;