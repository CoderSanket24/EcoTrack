import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
// import { API_URL } from '../App';

// --- Dummy Data (Fallback) ---
// --- Dummy Data (Fallback) ---
export const mockChallenges = [
    {
        id: 1,
        title: "Car-Free Week",
        description: "Leave the car at home and use public transport, cycle, or walk for 7 days.",
        xp: 500,
        category: "Transport",
        status: "Active",
        target_metric: "streak",
        current: 3,
        goal: 7,
        unit: "days",
        timeLeft: "2 days",
        participants: 1240,
        image: "https://images.unsplash.com/photo-1519003300449-424ad0405076?auto=format&fit=crop&w=800&q=80",
        badgeIcon: "fas fa-bicycle",
        rules: [
            "Log at least one eco-friendly commute per day.",
            "No personal car usage allowed for commutes.",
            "Share a photo of your commute on the community feed."
        ],
        rewards: "Carbon Crusher Badge"
    },
    {
        id: 2,
        title: "Zero Waste Lunch",
        description: "Pack a lunch with zero single-use plastics for 5 days in a row.",
        xp: 300,
        category: "Food",
        status: "Active",
        target_metric: "streak",
        current: 1,
        goal: 5,
        unit: "days",
        timeLeft: "4 days",
        participants: 850,
        image: "https://images.unsplash.com/photo-1533749047139-189de3cf06d3?auto=format&fit=crop&w=800&q=80",
        badgeIcon: "fas fa-utensils",
        rules: [
            "Use reusable containers and cutlery.",
            "No plastic wrappers or bottles.",
            "Compost any organic waste."
        ],
        rewards: "Lunchbox Hero Badge"
    },
    {
        id: 3,
        title: "Energy Saver Sprint",
        description: "Reduce your home energy consumption by 10% compared to last week.",
        xp: 750,
        category: "Energy",
        status: "Discover",
        target_metric: "reduction",
        current: 0,
        goal: 10,
        unit: "%",
        timeLeft: "Starts in 1 day",
        participants: 320,
        image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80",
        badgeIcon: "fas fa-lightbulb",
        rules: [
            "Turn off lights when not in use.",
            "Unplug phantom electronics.",
            "Use natural light during the day."
        ],
        rewards: "Energy Master Badge"
    },
    {
        id: 4,
        title: "Tree Plantation Drive",
        description: "Join the community event and plant at least one sapling.",
        xp: 1000,
        category: "Community",
        status: "Discover",
        target_metric: "count",
        current: 0,
        goal: 1,
        unit: "tree",
        timeLeft: "Ends Sunday",
        participants: 2100,
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
        badgeIcon: "fas fa-tree",
        rules: [
            "Attend the local plantation drive.",
            "Plant a sapling in a designated area.",
            "Upload a selfie with your planted tree."
        ],
        rewards: "Earth Guardian Badge"
    },
    {
        id: 5,
        title: "Vegan Vibes",
        description: "Go completely vegan for 3 days. No meat, dairy, or eggs.",
        xp: 450,
        category: "Food",
        status: "Completed",
        target_metric: "streak",
        current: 3,
        goal: 3,
        unit: "days",
        timeLeft: "Ended",
        participants: 560,
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        badgeIcon: "fas fa-carrot",
        rules: [
            "Consume only plant-based foods.",
            "Check labels for hidden animal ingredients.",
            "Try a new vegan recipe."
        ],
        rewards: "Plant Power Badge"
    },
    {
        id: 6,
        title: "Cycle 50km",
        description: "Accumulate 50km of cycling distance this month.",
        xp: 800,
        category: "Transport",
        status: "Active",
        target_metric: "distance",
        current: 35,
        goal: 50,
        unit: "km",
        timeLeft: "12 days",
        participants: 150,
        image: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=800&q=80",
        badgeIcon: "fas fa-biking",
        rules: [
            "Log your cycling trips manually or via IoT.",
            "Indoor cycling counts (50% weightage).",
            "Maintain a safe speed."
        ],
        rewards: "Iron Legs Badge"
    }
];

const fetchChallenges = async () => {
    // In a real app, this would be:
    // const response = await fetch(`${API_URL}/challenges/`);
    // if (!response.ok) throw new Error('Network response was not ok');
    // return response.json();

    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockChallenges;
};

const Challenges = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState('Active');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [userStats, setUserStats] = useState({
        level: 1,
        xp: 0,
        nextLevelXp: 1000,
        activeChallenges: 0
    });

    const { data: challenges = [], isLoading, error } = useQuery({
        queryKey: ['challenges'],
        queryFn: fetchChallenges,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Fetch Gamification Stats
    React.useEffect(() => {
        const fetchGamificationStats = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const emailParam = user.email ? `?email=${user.email}` : '';
                const response = await fetch(`${import.meta.env.VITE_API_URL}/gamification-stats/${emailParam}`);
                if (response.ok) {
                    const data = await response.json();
                    setUserStats({
                        level: data.user_stats.level,
                        xp: data.user_stats.xp,
                        nextLevelXp: (data.user_stats.level + 1) * 500, // Assuming simple level up logic for display
                        activeChallenges: challenges.filter(c => c.status === 'Active').length
                    });
                }
            } catch (err) {
                console.error("Failed to fetch gamification stats", err);
            }
        };
        fetchGamificationStats();
    }, [challenges]);

    const filteredChallenges = challenges.filter(challenge => {
        const matchesTab = activeTab === 'All' || challenge.status === activeTab;
        const matchesCategory = selectedCategory === 'All' || challenge.category === selectedCategory;
        return matchesTab && matchesCategory;
    });

    const categories = ["All", "Transport", "Energy", "Food", "Community"];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-red-500">
                Error loading challenges: {error.message}
            </div>
        );
    }



    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 font-sans pb-12">

            {/* 1. Hero Section (Gamification Hub) */}
            <div className="relative bg-gradient-to-br from-green-500 to-yellow-500 dark:from-green-700 dark:to-yellow-700 text-white p-8 md:p-16 rounded-b-[3rem] shadow-xl mb-10 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>

                {/* Floating Icons Animation */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <i className="fas fa-trophy absolute text-yellow-300/40 text-6xl animate-bounce top-10 right-20" style={{ animationDuration: '3s' }}></i>
                    <i className="fas fa-medal absolute text-white/20 text-8xl bottom-10 left-10 animate-pulse" style={{ animationDuration: '4s' }}></i>
                </div>

                <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-2 tracking-tight drop-shadow-sm">Eco-Challenges 🏆</h1>
                        <p className="text-lg md:text-xl text-green-50 font-medium max-w-xl">Push your limits, earn XP, and level up your impact. Join a community of changemakers today!</p>
                    </div>

                    {/* User Mini-Stat Card */}
                    <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 w-full md:w-80 shadow-lg transform hover:scale-105 transition-transform">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-green-100">Current Level</p>
                                <p className="text-3xl font-black text-white">Lvl {userStats.level}</p>
                            </div>
                            <div className="h-12 w-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                                <i className="fas fa-star text-yellow-700 text-xl"></i>
                            </div>
                        </div>
                        <div className="mb-2">
                            <div className="flex justify-between text-xs font-bold mb-1">
                                <span>{userStats.xp} XP</span>
                                <span>{userStats.nextLevelXp} XP</span>
                            </div>
                            <div className="w-full bg-black/20 rounded-full h-3">
                                <div
                                    className="bg-yellow-400 h-3 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.6)]"
                                    style={{ width: `${(userStats.xp / userStats.nextLevelXp) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                        <p className="text-center text-sm font-bold bg-green-800/40 rounded-lg py-1 mt-3">
                            {userStats.activeChallenges} Active Challenges
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4">

                {/* 2. Filter & Navigation */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                    {/* Tabs */}
                    <div className="bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 flex">
                        {["Active", "Discover", "Completed"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === tab
                                    ? "bg-green-500 text-white shadow-md"
                                    : "text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Category Tags */}
                    <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all whitespace-nowrap ${selectedCategory === cat
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                                    : "bg-transparent border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-green-300"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Challenge Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredChallenges.map(challenge => (
                        <div
                            key={challenge.id}
                            onClick={() => setSelectedChallenge(challenge)}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                        >
                            {/* Card Banner */}
                            <div className="h-40 relative overflow-hidden">
                                <img src={challenge.image} alt={challenge.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                    <i className="fas fa-bolt"></i> +{challenge.xp} XP
                                </div>
                                <div className="absolute bottom-3 left-4 text-white">
                                    <span className="bg-green-600/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 inline-block">
                                        {challenge.category}
                                    </span>
                                    <h3 className="text-xl font-bold leading-tight">{challenge.title}</h3>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5">
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 h-10">{challenge.description}</p>

                                {/* Progress Bar (Only for Active/Completed) */}
                                {(challenge.status === 'Active' || challenge.status === 'Completed') && (
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs font-bold mb-1 text-gray-500 dark:text-gray-400">
                                            <span>Progress</span>
                                            <span>{challenge.current} / {challenge.goal} {challenge.unit}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className={`h-2.5 rounded-full transition-all duration-1000 ${challenge.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'}`}
                                                style={{ width: `${Math.min((challenge.current / challenge.goal) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        <i className="far fa-clock"></i> {challenge.timeLeft}
                                    </div>
                                    <div className="flex -space-x-2">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[8px] font-bold text-gray-600">
                                                <i className="fas fa-user"></i>
                                            </div>
                                        ))}
                                        <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[8px] font-bold text-gray-500">
                                            +{challenge.participants > 3 ? challenge.participants - 3 : 0}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="mt-4">
                                    {challenge.status === 'Active' ? (
                                        <button
                                            onClick={() => onNavigate('log-activity')}
                                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                                        >
                                            <i className="fas fa-plus-circle"></i> Log Progress
                                        </button>
                                    ) : challenge.status === 'Discover' ? (
                                        <button className="w-full border-2 border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 font-bold py-2 rounded-lg transition-colors">
                                            Join Challenge
                                        </button>
                                    ) : (
                                        <button className="w-full bg-gray-100 dark:bg-gray-700 text-gray-400 font-bold py-2 rounded-lg cursor-default">
                                            Completed
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredChallenges.length === 0 && (
                    <div className="text-center py-20">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-search text-3xl text-gray-400"></i>
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">No challenges found</h3>
                        <p className="text-gray-500">Try adjusting your filters.</p>
                    </div>
                )}
            </div>

            {/* 4. Challenge Detail Modal */}
            {selectedChallenge && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-scale-up">
                        <button
                            onClick={() => setSelectedChallenge(null)}
                            className="absolute top-4 right-4 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div className="h-48 relative">
                            <img src={selectedChallenge.image} alt={selectedChallenge.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                            <div className="absolute bottom-6 left-6 text-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-0.5 rounded shadow-sm">
                                        +{selectedChallenge.xp} XP
                                    </span>
                                    <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-xs font-bold">
                                        {selectedChallenge.category}
                                    </span>
                                </div>
                                <h2 className="text-3xl font-bold">{selectedChallenge.title}</h2>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto">
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Goal</h3>
                                <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{selectedChallenge.description}</p>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Rules</h3>
                                <ul className="space-y-2">
                                    {selectedChallenge.rules.map((rule, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                                            <i className="fas fa-check-circle text-green-500 mt-0.5"></i>
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-100 dark:border-yellow-800/30 flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-300 text-xl shadow-sm">
                                    <i className={selectedChallenge.badgeIcon}></i>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase">Reward</p>
                                    <p className="font-bold text-gray-800 dark:text-white">{selectedChallenge.rewards}</p>
                                </div>
                            </div>

                            {/* Mini Leaderboard */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Top Performers</h3>
                                <div className="space-y-2">
                                    {[1, 2, 3].map((rank) => (
                                        <div key={rank} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-[10px] ${rank === 1 ? 'bg-yellow-400' : rank === 2 ? 'bg-gray-400' : 'bg-orange-400'
                                                    }`}>
                                                    {rank}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">EcoWarrior_{rank}</span>
                                            </div>
                                            <span className="text-xs font-bold text-green-600 dark:text-green-400">100% Done</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
                            <button
                                onClick={() => setSelectedChallenge(null)}
                                className="flex-1 py-3 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                            >
                                Close
                            </button>
                            {selectedChallenge.status === 'Discover' ? (
                                <button className="flex-[2] bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg transition-colors">
                                    Join Now
                                </button>
                            ) : (
                                <button
                                    onClick={() => onNavigate('log-activity')}
                                    className="flex-[2] bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg transition-colors"
                                >
                                    Log Activity
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Challenges;