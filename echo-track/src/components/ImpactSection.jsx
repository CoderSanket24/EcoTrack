import { useState, useEffect } from 'react';

const StatCard = ({ icon, number, label, suffix = '', colorClass }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseInt(number.replace(/,/g, ''), 10);
        if (start === end) return;

        let totalDuration = 2000;
        let incrementTime = (totalDuration / end) * 1000;

        // Optimize for large numbers
        if (end > 100) {
            incrementTime = 20;
        }

        let timer = setInterval(() => {
            start += Math.ceil(end / (totalDuration / 20));
            if (start >= end) {
                start = end;
                clearInterval(timer);
            }
            setCount(start);
        }, 20);

        return () => clearInterval(timer);
    }, [number]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center group">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${colorClass} dark:bg-opacity-20 group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <h3 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 transition-colors">
                {count.toLocaleString()}{suffix}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors">{label}</p>
        </div>
    );
};

const ImpactSection = () => {
    const [stats, setStats] = useState({
        users: 0,
        co2: 0,
        countries: 0
    });

    useEffect(() => {
        const fetchGlobalImpact = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/global-impact/`);
                if (res.ok) {
                    const data = await res.json();
                    setStats({
                        users: data.total_users,
                        co2: data.co2_saved_tons,
                        countries: data.countries_count
                    });
                }
            } catch (error) {
                console.error("Failed to fetch global impact", error);
            }
        };

        fetchGlobalImpact();
    }, []);

    return (
        <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 transition-colors">Global Community Impact</h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors">
                        Join thousands of others making a difference. Every small action contributes to a massive global change.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatCard
                        icon={
                            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        }
                        number={stats.users.toLocaleString()}
                        label="Registered Users"
                        colorClass="bg-blue-100 dark:bg-blue-900"
                    />
                    <StatCard
                        icon={
                            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        }
                        number={stats.co2.toLocaleString()}
                        label="Tons of CO₂ Saved"
                        suffix="+"
                        colorClass="bg-yellow-100 dark:bg-yellow-900"
                    />
                    <StatCard
                        icon={
                            <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        number={stats.countries.toLocaleString()}
                        label="Countries Represented"
                        colorClass="bg-purple-100 dark:bg-purple-900"
                    />
                </div>
            </div>
        </section>
    );
};

export default ImpactSection;