import React, { useState, useEffect } from 'react';

const OrgMembersTable = ({ user }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const fetchMembers = async () => {
            if (!user) return;
            try {
                const queryParam = user.org_id ? `org_id=${user.org_id}` : `email=${user.email}`;
                // Ordering by -xp as requested to sort by XP descending
                const res = await fetch(`${import.meta.env.VITE_API_URL}/organization/members/?${queryParam}&ordering=-xp`);
                if (res.ok) {
                    const data = await res.json();
                    setMembers(data.members || []);
                }
            } catch (error) {
                console.error("Failed to fetch org members:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [user]);

    const visibleMembers = showAll ? members : members.slice(0, 5);

    if (loading) return <div className="p-6 text-center text-gray-500">Loading members...</div>;
    if (members.length === 0) return <div className="p-6 text-center text-gray-500">No members found in this organization yet.</div>;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300 my-8">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <i className="fas fa-users text-teal-500"></i>
                    Organization Members
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Total: {members.length}
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Rank</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4 text-center">Level</th>
                            <th className="px-6 py-4 text-right">XP</th>
                            <th className="px-6 py-4 text-right">Daily Avg</th>
                            <th className="px-6 py-4 text-right">Total Emissions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {visibleMembers.map((member, index) => (
                            <tr key={index} className="hover:bg-teal-50/30 dark:hover:bg-teal-900/10 transition-colors">
                                <td className="px-6 py-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-600' :
                                            index === 1 ? 'bg-gray-100 text-gray-600' :
                                                index === 2 ? 'bg-orange-100 text-orange-600' :
                                                    'bg-teal-50 text-teal-600'
                                        }`}>
                                        {index + 1}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold border border-teal-200">
                                            {member.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-white text-sm">{member.username}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                    {member.city && member.state ? (
                                        <span>{member.city}, {member.state}</span>
                                    ) : (
                                        <span className="text-gray-400 italic">--</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-1 px-2 rounded text-xs font-bold">
                                        Lv {member.level}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-yellow-600 dark:text-yellow-400">
                                    {member.xp} XP
                                </td>
                                <td className="px-6 py-4 text-right text-sm text-gray-600 dark:text-gray-300">
                                    {member.daily_avg?.toFixed(1) || 0} kg
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="font-bold text-teal-600 dark:text-teal-400">
                                        {member.total_impact?.toFixed(1)} kg
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {members.length > 5 && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 text-center">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-teal-600 dark:text-teal-400 font-semibold hover:underline text-sm"
                    >
                        {showAll ? "Show Less" : `View All (${members.length})`}
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrgMembersTable;