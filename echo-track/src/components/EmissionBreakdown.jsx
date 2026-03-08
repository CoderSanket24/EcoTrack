import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
    { name: 'Transport', value: 40, color: '#EF4444' }, // Red
    { name: 'Housing', value: 35, color: '#F59E0B' }, // Yellow/Orange
    { name: 'Food', value: 15, color: '#10B981' }, // Green
    { name: 'Shopping', value: 10, color: '#3B82F6' }, // Blue
];

const EmissionBreakdown = () => {
    return (
        <section className="py-16 px-4 bg-white dark:bg-gray-800 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-12 text-center transition-colors">Category Analysis</h2>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-16">
                        {/* Chart */}
                        <div className="w-full md:w-[400px] h-[400px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={100}
                                        outerRadius={140}
                                        paddingAngle={5}
                                        dataKey="value"
                                        cornerRadius={8}
                                        stroke="none"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => `${value}%`}
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                            padding: '12px 16px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)'
                                        }}
                                        itemStyle={{ color: '#374151', fontWeight: 600 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-gray-400 dark:text-gray-500 text-sm font-medium uppercase tracking-wider transition-colors">Total</span>
                                <span className="text-4xl font-bold text-gray-800 dark:text-white transition-colors">100%</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="w-full md:w-auto space-y-4 min-w-[250px]">
                            {data.map((item) => (
                                <div key={item.name} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group cursor-default">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-3 h-3 rounded-full ring-4 ring-white dark:ring-gray-600 shadow-sm transition-all"
                                            style={{ backgroundColor: item.color }}
                                        ></div>
                                        <span className="text-gray-700 dark:text-gray-200 font-medium text-lg group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{item.name}</span>
                                    </div>
                                    <span className="text-gray-900 dark:text-white font-bold text-lg transition-colors">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EmissionBreakdown;