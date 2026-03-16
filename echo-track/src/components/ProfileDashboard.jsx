import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import OrgMembersTable from './OrgMembersTable';
import ComplianceMonitor from './ComplianceMonitor';

const ProfileDashboard = ({ isDarkMode, onNavigate }) => {
    // Mock Data for Charts
    const [footprintData, setFootprintData] = React.useState([]);
    const [categoryData, setCategoryData] = React.useState([]);
    const [monthlyFootprint, setMonthlyFootprint] = React.useState(0);
    const [user, setUser] = React.useState(null);

    React.useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(storedUser);
    }, []);

    // Gamification Data
    const [heatmapGrid, setHeatmapGrid] = React.useState([]);
    const [streakStats, setStreakStats] = React.useState({ totalActiveDays: 0, maxStreak: 0 });

    // State for Ranking
    const [myRanks, setMyRanks] = React.useState({ global: '-', state: '-', city: '-' });
    const [rankingScope, setRankingScope] = React.useState('city');

    const fetchStats = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const emailParam = user.email ? `?email=${user.email}` : '';
            const queryParam = user.org_id ? `org_id=${user.org_id}` : `email=${user.email}`;

            if (user.is_org_admin) {
                // --- ORG ADMIN FETCH ---

                // 1. Org Footprint Trend
                const graphRes = await fetch(`${import.meta.env.VITE_API_URL}/organization/emissions-graph/?${queryParam}`);
                if (graphRes.ok) {
                    const data = await graphRes.json();
                    // Transform to match Recharts expected format (key 'value')
                    // Logic fix: API returns 'graph_data', not 'trend_data'
                    const formattedTrend = (data.graph_data || []).map(item => ({
                        month: item.month,
                        value: item.emission || 0
                    }));
                    setFootprintData(formattedTrend);
                }

                // 2. Org Dashboard Stats (Total Emissions)
                const dashboardRes = await fetch(`${import.meta.env.VITE_API_URL}/organization/dashboard-stats/?${queryParam}`);
                if (dashboardRes.ok) {
                    const data = await dashboardRes.json();
                    setMonthlyFootprint(data.total_emissions); // Use Total emissions for the summary card
                }

                // 3. Department Distribution
                const deptRes = await fetch(`${import.meta.env.VITE_API_URL}/organization/department-graph/?${queryParam}`);
                if (deptRes.ok) {
                    const data = await deptRes.json();

                    const deptColors = ['#22c55e', '#0ea5e9', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316'];
                    const formattedDeptData = (data.department_data || []).map((item, index) => ({
                        name: item.name,
                        value: item.value,
                        color: deptColors[index % deptColors.length]
                    }));
                    setCategoryData(formattedDeptData);
                }

            } else {
                // --- REGULAR USER FETCH ---

                // 1. Dashboard Stats
                const dashboardRes = await fetch(`${import.meta.env.VITE_API_URL}/dashboard-stats/${emailParam}`);
                if (dashboardRes.ok) {
                    const data = await dashboardRes.json();
                    setFootprintData(data.trend_data);

                    const colors = {
                        transport: '#22c55e', food: '#0ea5e9', consumption: '#eab308',
                        energy: '#ef4444', waste: '#6b7280'
                    };
                    const formattedCategoryData = Object.entries(data.category_breakdown).map(([key, value]) => ({
                        name: key.charAt(0).toUpperCase() + key.slice(1),
                        value: value,
                        color: colors[key] || '#cbd5e1'
                    })).filter(item => item.value > 0);
                    setCategoryData(formattedCategoryData);
                    setMonthlyFootprint(data.emission_stats.this_month);
                }

                // 2. Gamification Stats (Heatmap)
                const gamificationRes = await fetch(`${import.meta.env.VITE_API_URL}/gamification-stats/${emailParam}`);
                if (gamificationRes.ok) {
                    const data = await gamificationRes.json();
                    setStreakStats({
                        totalActiveDays: data.activity_heatmap.total_active_days,
                        maxStreak: data.activity_heatmap.max_streak
                    });
                    processHeatmapData(data.activity_heatmap.daily_counts);
                }

                // 3. Leaderboard Ranks
                const leaderboardRes = await fetch(`${import.meta.env.VITE_API_URL}/leaderboard/${emailParam}`);
                if (leaderboardRes.ok) {
                    const data = await leaderboardRes.json();
                    setMyRanks(data.my_ranks);
                }
            }

        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const processHeatmapData = (dailyCounts) => {
        const weeks = 53;
        const days = 7;
        const grid = [];
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - (weeks * days) + 1); // Align to end on today roughly

        for (let w = 0; w < weeks; w++) {
            const week = [];
            for (let d = 0; d < days; d++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + (w * 7) + d);
                const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
                const count = dailyCounts[dateStr] || 0;

                let level = 0;
                if (count > 0) level = 1;
                if (count > 2) level = 2;
                if (count > 5) level = 3;
                if (count > 10) level = 4;

                week.push({ level, date: dateStr, count });
            }
            grid.push(week);
        }
        setHeatmapGrid(grid);
    };

    React.useEffect(() => {
        fetchStats();
    }, []);

    const getHeatmapColor = (level) => {
        switch (level) {
            case 0: return 'bg-gray-100 dark:bg-gray-700';
            case 1: return 'bg-teal-200 dark:bg-teal-800';
            case 2: return 'bg-teal-300 dark:bg-teal-600';
            case 3: return 'bg-teal-500 dark:bg-teal-500';
            case 4: return 'bg-teal-700 dark:bg-teal-400';
            default: return 'bg-gray-100 dark:bg-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors">Your Dashboard</h1>
                <button
                    onClick={() => onNavigate && onNavigate('log-activity')}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm text-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Log New Activity
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-colors duration-300">
                    <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 transition-colors">
                        {/* Font Awesome Tree Icon */}
                        <i className="fas fa-tree text-2xl"></i>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium transition-colors">
                            {user?.is_org_admin ? 'Total Organization Emissions' : 'Monthly Footprint'}
                        </p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white transition-colors">{monthlyFootprint} kg CO₂e</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-colors duration-300">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium transition-colors">
                            {rankingScope.charAt(0).toUpperCase() + rankingScope.slice(1)} Ranking
                        </p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white transition-colors">
                            #{myRanks[rankingScope] || '-'}
                        </p>
                    </div>
                    <select
                        value={rankingScope}
                        onChange={(e) => setRankingScope(e.target.value)}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1 text-sm text-gray-600 dark:text-gray-300 outline-none focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                    >
                        <option value="city">City</option>
                        <option value="state">State</option>
                        <option value="global">Global</option>
                    </select>
                </div>
            </div>

            {/* Activity Streak (Heatmap) - Hide for Org Admins */}
            {(!user?.is_org_admin) && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white transition-colors">Activity Streak</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1 transition-colors">
                            Total Active Days: <span className="font-bold text-gray-800 dark:text-white">{streakStats.totalActiveDays}</span> |
                            Max Streak: <span className="font-bold text-gray-800 dark:text-white">{streakStats.maxStreak}</span>
                        </p>
                    </div>

                    {/* Heatmap Grid */}
                    <div className="w-full overflow-x-auto pb-2">
                        <div className="flex gap-[3px] min-w-max">
                            {heatmapGrid.map((week, wIndex) => (
                                <div key={wIndex} className="flex flex-col gap-[3px]">
                                    {week.map((day, dIndex) => (
                                        <div
                                            key={`${wIndex}-${dIndex}`}
                                            className={`w-[10px] h-[10px] rounded-[2px] ${getHeatmapColor(day.level)} hover:ring-2 hover:ring-teal-400 transition-all cursor-pointer relative group`}
                                            title={`${day.date}: ${day.count} activities`}
                                        ></div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-2 px-1 font-medium transition-colors">
                        <span>Jan</span>
                        <span>Mar</span>
                        <span>May</span>
                        <span>Jul</span>
                        <span>Sep</span>
                        <span>Nov</span>
                    </div>
                </div>
            )}

            {/* Footprint Trend Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 transition-colors">
                    {user?.is_org_admin ? 'Organization Footprint Trend' : 'Footprint Trend (Last 6 Months)'}
                </h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={footprintData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#f0f0f0'} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '8px',
                                    border: 'none',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                                    color: isDarkMode ? '#fff' : '#000'
                                }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" dot={{ r: 4, fill: '#14b8a6', strokeWidth: 2, stroke: '#fff' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Breakdown (Category or State) */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 transition-colors">
                    {user?.is_org_admin ? 'Emission Distribution by Department' : 'Breakdown by Category'}
                </h3>
                <div className="h-64 w-full flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '8px',
                                    border: 'none',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                                    color: isDarkMode ? '#fff' : '#000'
                                }}
                            />
                            <Legend
                                verticalAlign="top"
                                height={36}
                                iconType="rect"
                                formatter={(value, entry) => <span className="text-gray-600 dark:text-gray-300 text-sm ml-1">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Compliance Monitor — only for regular users */}
            {!user?.is_org_admin && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                    <ComplianceMonitor user={user} />
                </div>
            )}

        </div>
    );
};
};

export default ProfileDashboard;
