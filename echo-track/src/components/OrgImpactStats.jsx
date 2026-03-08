import React from 'react';

const StatCard = ({ icon, value, unit, label, subLabel, isImprovement, isRank }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center group">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 text-2xl transition-colors duration-300 ${isImprovement ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : isRank ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400'}`}>
            {icon}
        </div>
        <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            {value}
        </div>
        {unit && <div className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{unit}</div>}
        <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</div>
        {subLabel && <div className={`text-xs mt-1 ${isImprovement ? 'text-green-500 dark:text-green-400 font-bold' : 'text-gray-400 dark:text-gray-500'}`}>{subLabel}</div>}
    </div>
);

const OrgImpactStats = ({ user }) => {
    const [stats, setStats] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;

            try {
                // Determine identifier (org_id is preferred if available)
                const queryParam = user.org_id ? `org_id=${user.org_id}` : `email=${user.email}`;
                const res = await fetch(`${import.meta.env.VITE_API_URL}/organization/dashboard-stats/?${queryParam}`);

                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                } else {
                    console.error("Failed to fetch dashboard stats");
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading impact stats...</div>;
    }

    if (!stats) {
        return null; // Or show error
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-teal-800 dark:text-teal-400 mb-2 text-center transition-colors duration-300">
                {stats.org_name ? `${stats.org_name}'s Impact` : "Our Impact"}
            </h2>
            <p className="text-center text-gray-500 mb-8 text-sm">Organization Dashboard</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<i className="fas fa-users"></i>}
                    value={stats.total_members}
                    label="Total Members"
                    subLabel="Active Employees"
                />
                <StatCard
                    icon={<i className="fas fa-leaf"></i>}
                    value={stats.total_emissions}
                    unit="kg CO2e"
                    label="Collective Emissions"
                    subLabel="Total Footprint"
                />
                <StatCard
                    icon={<i className="fas fa-trophy"></i>}
                    value={`#${stats.org_rank}`}
                    label="Organization Rank"
                    isRank={true}
                />
                <StatCard
                    icon={<i className="fas fa-arrow-down"></i>}
                    value={`${stats.monthly_improvement}%`}
                    label="Monthly Improvement"
                    isImprovement={stats.monthly_improvement > 0}
                    subLabel={stats.monthly_improvement > 0 ? "Reduction" : "Increase"}
                />
            </div>
        </div>
    );
};

export default OrgImpactStats;