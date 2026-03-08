import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { API_URL } from '../App';

// --- Dummy Fallback Data for UI fields not in backend yet ---
const fallbackData = {
    eco_score: 3,
    next_event: "Community Cleanup (Sat)",
    leaderboard: [
        { name: "Alice", score: "120kg" },
        { name: "Bob", score: "95kg" },
        { name: "Charlie", score: "88kg" }
    ],
    active_challenge: "Zero Waste Week",
    challenge_progress: 65,
    latest_post: "Join us for the next event!"
};

const fetchCommunities = async () => {
    // Get user info for "is_member" check if needed, though backend serializer handles it if token logic is consistent.
    // Assuming backend returns all communities.
    try {
        const email = JSON.parse(localStorage.getItem('user') || '{}').email;
        // Pass email as query param so backend knows who "I" am for "is_member" field
        const url = email
            ? `${import.meta.env.VITE_API_URL}/communities/?email=${encodeURIComponent(email)}`
            : `${import.meta.env.VITE_API_URL}/communities/`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch communities');
        return res.json();
    } catch (e) {
        console.error(e);
        return [];
    }
};

const joinLeaveCommunity = async ({ id, action }) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.email) {
        throw new Error("You must be logged in to join a community.");
    }

    console.log(`Attempting to ${action} community ${id} for ${user.email}`);

    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/communities/${id}/${action}/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email })
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || errData.message || `Failed to ${action}`);
        }
        return res.json();
    } catch (error) {
        console.error("Join/Leave API Error:", error);
        throw error;
    }
};

// Simple Pop-up Notification Component
const NotificationPopup = ({ message, onClose }) => {
    if (!message) return null;
    return (
        <div className="fixed top-24 right-4 z-[60] animate-fade-in-right">
            <div className="bg-teal-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border border-teal-400/30 backdrop-blur-md">
                <div className="bg-white/20 p-2 rounded-full">
                    <i className="fas fa-check text-lg"></i>
                </div>
                <div>
                    <h4 className="font-bold text-sm">Success!</h4>
                    <p className="text-sm opacity-90">{message}</p>
                </div>
                <button onClick={onClose} className="ml-2 hover:bg-white/10 p-1 rounded-full transition-colors">
                    <i className="fas fa-times"></i>
                </button>
            </div>
        </div>
    );
};

const Community = () => {
    const [filter, setFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [notification, setNotification] = useState(null); // State for popup
    const queryClient = useQueryClient();

    const { data: communities = [], isLoading, error } = useQuery({
        queryKey: ['communities'],
        queryFn: fetchCommunities,
    });

    const mutation = useMutation({
        mutationFn: joinLeaveCommunity,
        onSuccess: (data, variables) => {
            // Show popup
            const actionText = variables.action === 'join' ? 'Joined' : 'Left';
            setNotification(`Successfully ${actionText} the community!`);

            // Auto hide after 3 seconds
            setTimeout(() => setNotification(null), 3000);

            queryClient.invalidateQueries(['communities']);
            // Also update selectedCommunity if it's open
            if (selectedCommunity) {
                setSelectedCommunity(prev => ({
                    ...prev,
                    is_member: !prev.is_member,
                    members: prev.is_member ? prev.members - 1 : prev.members + 1
                }));
            }
        },
        onError: (error) => {
            alert(error.message);
        }
    });

    const handleJoin = (e, community) => {
        e.stopPropagation();
        const action = community.is_member ? 'leave' : 'join';
        mutation.mutate({ id: community.id, action });
    };

    // Enhance API data with dummy fields for UI if missing
    const enhancedCommunities = communities.map(c => ({
        ...fallbackData, // Defaults
        ...c,            // API Data overrides
        // Ensure numbers are numbers
        members: c.members_count || 0,
        // Ensure Image
        image: c.image || c.image_url || "https://images.unsplash.com/photo-1542601906990-24d4c16419d4?auto=format&fit=crop&q=80&w=800"
    }));

    const myCommunities = enhancedCommunities.filter(c => c.is_member);

    const filteredCommunities = enhancedCommunities.filter(c => {
        // Filter Logic
        // "My Communities" tab logic handled by displaying myCommunities array separately or filtering here.
        // The original design had My Communities as a separate section at top, and "Discover" below.
        // The filter tabs acted on the "Discover" section effectively, OR on both.
        // Let's stick to original behavior: 
        // 1. "My Communities" tab works on the main list? No, original had logic:
        // `if (myCommunities.length > 0 && filter === "All")` -> Show scrollable my teams.
        // `filteredCommunities` applied to the Grid below.

        // If filter is "My Communities", user likely wants to see ONLY theirs in the list?
        if (filter === "My Communities") return c.is_member;

        const matchesType = filter === "All" || c.type === filter;
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-red-500">
                Error loading communities. Is the server running?
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 font-sans relative">

            <NotificationPopup message={notification} onClose={() => setNotification(null)} />

            {/* 1. Header Section */}
            <div className="relative bg-gradient-to-r from-teal-600 to-green-500 dark:from-teal-800 dark:to-green-700 text-white p-8 md:p-12 rounded-b-3xl shadow-lg mb-8 overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                {/* Floating Leaves Animation */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <i
                            key={i}
                            className={`fas fa-leaf absolute text-white/60`}
                            style={{
                                fontSize: `${Math.random() * 20 + 20}px`,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                                animationDelay: `-${Math.random() * 10}s`
                            }}
                        ></i>
                    ))}
                    <style>{`
                        @keyframes float {
                            0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
                            10% { opacity: 0.8; }
                            90% { opacity: 0.8; }
                            100% { transform: translate(100px, -100px) rotate(360deg); opacity: 0; }
                        }
                    `}</style>
                </div>

                <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">Community Hub 🌍</h1>
                        <p className="text-lg md:text-xl text-teal-100 font-medium">Join thousands making a difference together.</p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6 text-sm font-semibold">
                            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                                <i className="fas fa-cloud-meatball"></i> 500 Tons CO₂ Saved
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                                <i className="fas fa-users"></i> {enhancedCommunities.reduce((acc, c) => acc + c.members, 0) || 12500} Users
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                                <i className="fas fa-flag-checkered"></i> {enhancedCommunities.length} Communities
                            </div>
                        </div>
                    </div>

                    <button className="bg-white text-teal-600 hover:bg-teal-50 px-8 py-3 rounded-full font-bold shadow-md transition-transform transform hover:scale-105 flex items-center gap-2">
                        <i className="fas fa-plus-circle"></i> Create Community
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 pb-12">

                {/* 2. Navigation/Filter Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search communities..."
                            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
                        {["All", "My Communities", "University", "Corporate", "Neighborhood"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === tab
                                    ? "bg-teal-500 text-white shadow-md"
                                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. My Communities Section (Horizontal Scroll) */}
                {myCommunities.length > 0 && filter === "All" && (
                    <div className="mb-10">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <i className="fas fa-heart text-red-500"></i> My Communities
                        </h2>
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                            {myCommunities.map(community => (
                                <div key={community.id} className="min-w-[280px] bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedCommunity(community)}>
                                    <img src={community.image} alt={community.name} className="w-12 h-12 rounded-full object-cover border-2 border-teal-100 dark:border-teal-900" />
                                    <div>
                                        <h3 className="font-bold text-gray-800 dark:text-white truncate w-40">{community.name}</h3>
                                        <p className="text-xs text-teal-600 dark:text-teal-400 font-medium truncate w-40">
                                            <i className="fas fa-user-check mr-1"></i> Member
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. Discover Communities Grid */}
                <div>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <i className="fas fa-compass text-teal-500"></i> Discover Communities
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCommunities.map(community => (
                            <div key={community.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                <div className="h-32 bg-gray-200 dark:bg-gray-700 relative">
                                    <img src={community.image} alt={community.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold flex gap-1 shadow-sm">
                                        {[...Array(community.eco_score || 3)].map((_, i) => (
                                            <span key={i}>🌿</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{community.name}</h3>
                                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md">{community.type}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 h-10">{community.description}</p>

                                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-6">
                                        <span className="flex items-center gap-1"><i className="fas fa-user-friends"></i> {community.members.toLocaleString()} Members</span>
                                        <span className="flex items-center gap-1"><i className="fas fa-trophy text-yellow-500"></i> Top 10%</span>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={(e) => handleJoin(e, community)}
                                            className={`flex-1 border py-2 rounded-lg font-semibold text-sm transition-colors ${community.is_member
                                                ? 'border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'
                                                : 'border-teal-500 text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/30'
                                                }`}
                                        >
                                            {community.is_member ? 'Leave' : 'Join'}
                                        </button>
                                        <button
                                            onClick={() => setSelectedCommunity(community)}
                                            className="flex-1 bg-teal-500 text-white hover:bg-teal-600 py-2 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {filteredCommunities.length === 0 && (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <i className="fas fa-search text-4xl mb-4 opacity-50"></i>
                            <p>No communities found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 5. Community Detail Modal */}
            {selectedCommunity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
                        {/* Modal Header */}
                        <div className="relative h-40">
                            <img src={selectedCommunity.image} alt={selectedCommunity.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <button
                                onClick={() => setSelectedCommunity(null)}
                                className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <div className="absolute bottom-4 left-6 text-white">
                                <h2 className="text-3xl font-bold">{selectedCommunity.name}</h2>
                                <p className="text-sm opacity-90 flex items-center gap-2">
                                    <i className="fas fa-map-marker-alt"></i> {selectedCommunity.type} • {selectedCommunity.members.toLocaleString()} Members
                                </p>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 md:p-8 space-y-8">

                            {/* Active Challenge */}
                            {/* Active Challenge */}
                            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-5 border border-teal-100 dark:border-teal-800/30">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-bold text-teal-800 dark:text-teal-300 flex items-center gap-2">
                                        <i className="fas fa-fire text-orange-500"></i> Active Challenge
                                    </h3>
                                    {selectedCommunity.active_challenge && (
                                        <span className="text-xs font-bold bg-white dark:bg-gray-800 text-teal-600 px-2 py-1 rounded shadow-sm">Ongoing</span>
                                    )}
                                </div>
                                {selectedCommunity.active_challenge ? (
                                    <>
                                        <p className="text-lg font-bold text-gray-800 dark:text-white mb-2">{selectedCommunity.active_challenge}</p>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
                                            <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${selectedCommunity.challenge_progress || 0}%` }}></div>
                                        </div>
                                        <p className="text-right text-xs text-gray-500 dark:text-gray-400">{selectedCommunity.challenge_progress || 0}% Goal Reached</p>
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No active challenge at the moment.</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Leaderboard */}
                                <div>
                                    <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                        <i className="fas fa-medal text-yellow-500"></i> Top Contributors
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedCommunity.top_contributors && selectedCommunity.top_contributors.length > 0 ? (
                                            selectedCommunity.top_contributors.map((user, index) => (
                                                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                                                            }`}>
                                                            {index + 1}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.profile_name}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="block text-sm font-bold text-teal-600 dark:text-teal-400">{user.xp} XP</span>
                                                        <span className="text-xs text-gray-500">Lvl {user.level}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No contributors yet. Be the first!</p>
                                        )}
                                    </div>
                                </div>

                                {/* Discussion Teaser */}
                                <div>
                                    <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                        <i className="fas fa-comments text-blue-500"></i> Latest Discussion
                                    </h3>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-800 flex-shrink-0"></div>
                                            <div>
                                                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium mb-1">"{selectedCommunity.latest_post}"</p>
                                                <p className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">View 12 replies</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="w-full mt-4 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        View All Discussions
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                            <button
                                onClick={() => setSelectedCommunity(null)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white font-medium text-sm transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={(e) => handleJoin(e, selectedCommunity)}
                                className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-teal-700 transition-colors"
                            >
                                {selectedCommunity.is_member ? 'Leave Community' : 'Join Community'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Community;