import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const OrgEmissionsGraph = ({ user }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const queryParam = user.org_id ? `org_id=${user.org_id}` : `email=${user.email}`;
                const res = await fetch(`${import.meta.env.VITE_API_URL}/organization/emissions-graph/?${queryParam}`);
                if (res.ok) {
                    const result = await res.json();
                    setData(result.graph_data || []);
                }
            } catch (error) {
                console.error("Error fetching emission graph:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) return <div className="h-64 flex items-center justify-center text-gray-400">Loading graph...</div>;
    if (data.length === 0) return <div className="h-64 flex items-center justify-center text-gray-400">No emission data available yet.</div>;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
                    <p className="font-bold text-gray-800 dark:text-gray-200 mb-1">{label}</p>
                    <p className="text-teal-600 dark:text-teal-400">
                        {payload[0].value} kg CO₂
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 border border-teal-50 dark:border-gray-700 transition-colors duration-300 my-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 pl-4 border-l-4 border-teal-500">
                Monthly Emission Trends
            </h3>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis
                            dataKey="month"
                            stroke="#9ca3af"
                            tick={{ fill: '#6b7280' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            tick={{ fill: '#6b7280' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="emission" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#14b8a6' : '#0d9488'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default OrgEmissionsGraph;