import React, { useState, useEffect } from 'react';
import EditProfileModal from './EditProfileModal';

const ProfileSidebar = ({ user, onUpdateProfile, onNavigate }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [budget, setBudget] = useState({ monthly_limit: 500, monthly_used: 0 });
    const [gamificationStats, setGamificationStats] = useState({
        level: 1,
        xp: 0,
        eco_coins: 0,
        sustainability_score: 0
    });

    const [categoryStats, setCategoryStats] = React.useState({});
    const [showAllInsights, setShowAllInsights] = React.useState(false);
    const [orgStats, setOrgStats] = React.useState({
        total_members: 0,
        email: ''
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');

                if (user.is_org_admin) {
                    // Fetch Organization Stats
                    const queryParam = user.org_id ? `org_id=${user.org_id}` : `email=${user.email}`;
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/organization/dashboard-stats/?${queryParam}`);
                    if (res.ok) {
                        const data = await res.json();
                        setOrgStats({
                            total_members: data.total_members,
                            email: data.email
                        });
                        // Reuse emission stats for category breakdown if available, or fetch separate if needed
                        // For now, assuming org dashboard stats primarily gives members/email for sidebar
                    }
                } else {
                    const emailParam = user.email ? `?email=${user.email}` : '';

                    // Fetch Dashboard Stats (Budget & Categories)
                    const budgetResponse = await fetch(`${import.meta.env.VITE_API_URL}/dashboard-stats/${emailParam}`);
                    if (budgetResponse.ok) {
                        const data = await budgetResponse.json();
                        setBudget(data.budget);
                        setCategoryStats(data.category_breakdown || {});
                    }

                    // Fetch Gamification Stats
                    const gamificationResponse = await fetch(`${import.meta.env.VITE_API_URL}/gamification-stats/${emailParam}`);
                    if (gamificationResponse.ok) {
                        const data = await gamificationResponse.json();
                        setGamificationStats(data.user_stats);
                    }
                }

            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, []);

    const getTopInsights = () => {
        const insightsPool = [
            // Transport
            { text: "Reduce 3 km/day of petrol travel", impact: "save 0.57 kg/day", category: "transport" },
            { text: "Switch one car trip to public transit", impact: "save ~15kg CO₂e/month", category: "transport" },
            { text: "Carpooling for daily commute", impact: "save ~2.5 kg CO₂e/trip", category: "transport" },

            // Energy
            { text: "Lower evening electricity by 0.4 kWh", impact: "save 0.29 kg/day", category: "energy" },
            { text: "Run washing machine after 10 PM", impact: "reduce emissions by 0.12 kg/day", category: "energy" },
            { text: "Unplug idle electronics overnight", impact: "save ~0.1 kg CO₂e/day", category: "energy" },

            // Food
            { text: "Replace 2 dairy meals/week", impact: "save 0.54 kg/day", category: "food" },
            { text: "Reduce packaged snacks by 3/week", impact: "save 0.2 kg/week", category: "food" },
            { text: "Go meat-free for one day", impact: "save ~1.5 kg CO₂e", category: "food" },

            // Consumption/Waste
            { text: "Use a reusable water bottle", impact: "save ~0.08 kg CO₂e/use", category: "waste" },
            { text: "Buy second-hand clothes", impact: "save ~5 kg CO₂e/item", category: "consumption" }
        ];

        const orgInsightsPool = [
            { text: "Implement heavy machinery maintenance", impact: "reduce fuel use by 10%", category: "energy" },
            { text: "Switch to LED lighting in office", impact: "save ~40% electricity", category: "energy" },
            { text: "Encourage remote work (WFH)", impact: "lower commute emissions", category: "transport" },
            { text: "Optimize server cooling", impact: "reduce HVAC load", category: "energy" },
            { text: "Digitize paperwork processes", impact: "save paper & waste", category: "waste" }
        ];

        if (user?.is_org_admin) {
            return orgInsightsPool.slice(0, 3);
        }

        // 1. Sort categories by contribution (descending)
        const sortedCategories = Object.entries(categoryStats)
            .sort(([, a], [, b]) => b - a)
            .map(([cat]) => cat);

        // 2. Select insights for top 3 categories
        const selectedInsights = [];
        const usedCategories = new Set();

        // Try to find one insight for each of the top categories
        for (const cat of sortedCategories) {
            if (selectedInsights.length >= 3) break; // We only need top 3 (1 initial + 2 more)

            // Find an insight for this category that hasn't been used
            const insight = insightsPool.find(i => i.category === cat && !selectedInsights.includes(i));

            if (insight) {
                selectedInsights.push(insight);
                usedCategories.add(cat);
            }
        }

        // Fallback: If we don't have 3 insights (e.g. fewer categories logged), fill with remaining highest impact ones
        if (selectedInsights.length < 3) {
            for (const insight of insightsPool) {
                if (selectedInsights.length >= 3) break;
                if (!selectedInsights.some(si => si.text === insight.text)) {
                    selectedInsights.push(insight);
                }
            }
        }

        return selectedInsights;
    };

    const displayInsights = getTopInsights();
    const visibleInsights = showAllInsights ? displayInsights : displayInsights.slice(0, 1);

    return (
        <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 text-center transition-colors duration-300">
                <div className="w-28 h-28 mx-auto mb-4 relative">
                    <div className="w-full h-full rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center border-4 border-teal-100 dark:border-teal-900 shadow-[0_0_15px_rgba(20,184,166,0.3)] overflow-hidden transition-colors duration-300">
                        {/* Conditional Icon */}
                        {user.is_org_admin ? (
                            <i className="fas fa-building text-5xl text-teal-500 dark:text-teal-400 opacity-90"></i>
                        ) : (
                            <i className="fas fa-leaf text-5xl text-teal-500 dark:text-teal-400 opacity-90"></i>
                        )}
                    </div>
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white transition-colors">
                    {user.is_org_admin ? user.name : (user?.profile?.first_name && user?.profile?.last_name
                        ? `${user.profile.first_name} ${user.profile.last_name}`
                        : user?.username || 'User')}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 transition-colors">
                    {user.is_org_admin ? `Admin: ${user.admin_name}` : `@${user?.username?.toLowerCase() || 'user'}`}
                </p>

                {!user.is_org_admin && (
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="w-full bg-teal-500 text-white py-2 rounded-lg font-semibold hover:bg-teal-600 transition-colors mb-6 flex items-center justify-center gap-2 shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit Profile
                    </button>
                )}

                <div className="space-y-3 text-left text-sm text-gray-600 dark:text-gray-300 transition-colors">
                    {user.is_org_admin ? (
                        <>
                            <div className="flex items-center gap-3">
                                <i className="fas fa-envelope w-4 text-center text-teal-500 dark:text-teal-400"></i>
                                <span className="truncate" title={orgStats.email || user.email}>{orgStats.email || user.email || 'No Email'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <i className="fas fa-id-badge w-4 text-center text-teal-500 dark:text-teal-400"></i>
                                <span>ID: {user.org_id}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <i className="fas fa-users w-4 text-center text-teal-500 dark:text-teal-400"></i>
                                <span>{orgStats.total_members || user.total_members || 0} Members</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="truncate">{user?.email || 'email@example.com'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>{user?.profile?.phone_no || 'Add phone number'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{user?.profile?.city ? `${user.profile.city}, ${user.profile.state}` : 'Add location'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span>
                                    {user?.profile?.org_id
                                        ? (user?.profile?.org_name || `Org: ${user.profile.org_id}`)
                                        : 'Organization: None'}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Gamification Stats - Hide for Org Admin */}
            {!user?.is_org_admin && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 transition-colors">
                        <i className="fas fa-trophy text-yellow-500"></i>
                        Gamification Stats
                    </h3>

                    <div className="space-y-4">
                        {/* Level & XP */}
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Level</p>
                                <p className="text-xl font-bold text-teal-600 dark:text-teal-400">{gamificationStats.level}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400">XP</p>
                                <p className="text-xl font-bold text-teal-600 dark:text-teal-400">{gamificationStats.xp}</p>
                            </div>
                        </div>

                        {/* Eco Coins */}
                        <div className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl border border-yellow-100 dark:border-yellow-800/30">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-800/40 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                                <i className="fas fa-coins"></i>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Eco Coins</p>
                                <p className="text-lg font-bold text-gray-800 dark:text-white">{gamificationStats.eco_coins}</p>
                            </div>
                        </div>

                        {/* Sustainability Score */}
                        <div>
                            <div className="flex justify-between mb-1">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sustainability Score</p>
                                <p className="text-sm font-bold text-gray-800 dark:text-white">{gamificationStats.sustainability_score}/100</p>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                <div
                                    className={`h-3 rounded-full ${gamificationStats.sustainability_score < 30 ? 'bg-red-500' :
                                        gamificationStats.sustainability_score < 70 ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}
                                    style={{ width: `${gamificationStats.sustainability_score}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Monthly Carbon Budget - Hide for Org Admin if not relevant (optional, user didn't explicitly ask but implied 'show org details') */}
            {/* Keeping it for now but wrapping just in case */}
            {!user?.is_org_admin && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 transition-colors">Monthly Carbon Budget</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 transition-colors">
                        You have used <span className="font-bold text-gray-900 dark:text-white">{budget.monthly_used} kg</span> of your <span className="font-bold text-gray-900 dark:text-white">{budget.monthly_limit} kg</span> allowance.
                    </p>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden transition-colors">
                        <div
                            className={`h-3 rounded-full ${budget.monthly_used > budget.monthly_limit ? 'bg-red-500' : 'bg-teal-500'}`}
                            style={{ width: `${Math.min((budget.monthly_used / budget.monthly_limit) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Actionable Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 transition-colors">
                    <svg className="w-5 h-5 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Actionable Insights
                </h3>
                <div className="space-y-4">
                    {visibleInsights.map((insight, index) => (
                        <div key={index} className="flex gap-3 items-start animate-fadeIn">
                            <div className="mt-0.5 flex-shrink-0 text-teal-500 dark:text-teal-400 font-bold text-sm bg-teal-50 dark:bg-teal-900/30 w-6 h-6 rounded flex items-center justify-center">
                                {index + 1}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors">
                                {insight.text} <span className="font-bold text-teal-600 dark:text-teal-400">→ {insight.impact}</span>
                            </p>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => setShowAllInsights(!showAllInsights)}
                    className="w-full mt-4 py-2 text-sm font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                    {showAllInsights ? (
                        <>
                            Show Less <i className="fas fa-chevron-up text-xs"></i>
                        </>
                    ) : (
                        <>
                            View More <i className="fas fa-chevron-down text-xs"></i>
                        </>
                    )}
                </button>
            </div>

            {/* Achievements */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 transition-colors">
                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Achievements
                </h3>
                <div className="space-y-4">
                    {/* Welcome Badge */}
                    <div className="flex gap-3 items-start">
                        <div className="text-yellow-400">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-white text-sm transition-colors">Welcome!</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">Start logging activities to earn your first badge.</p>
                        </div>
                    </div>

                    {/* Dynamic Badges from Challenges */}
                    <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                            <i className="fas fa-carrot"></i>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-white text-sm transition-colors">Plant Power Badge</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">Completed Vegan Vibes Challenge</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
                onUpdate={onUpdateProfile}
            />
        </div>
    );
};

export default ProfileSidebar;