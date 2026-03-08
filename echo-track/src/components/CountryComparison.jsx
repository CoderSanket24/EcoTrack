const CountryComparison = () => {
    return (
        <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-12 transition-colors">Country vs Global Average</h2>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 space-y-8 transition-colors">

                    {/* Your Country */}
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="w-full md:w-48 flex items-center gap-2">
                            <img src="https://flagcdn.com/w40/in.png" alt="India" className="w-8 h-auto shadow-sm rounded-sm" />
                            <span className="text-gray-700 dark:text-gray-200 font-medium transition-colors">India</span>
                        </div>
                        <div className="flex-grow w-full bg-gray-100 dark:bg-gray-700 rounded-full h-12 relative overflow-hidden transition-colors">
                            <div
                                className="absolute top-0 left-0 h-full bg-red-500 rounded-full flex items-center justify-end px-4 text-white font-bold transition-all duration-1000 ease-out"
                                style={{ width: '40%' }} // 1.9 / 4.7 approx ratio visual adjustment
                            >
                            </div>
                            <div className="absolute inset-0 flex items-center justify-end px-4">
                                <span className="text-gray-500 dark:text-gray-300 font-medium transition-colors">1.9 tons/year</span>
                            </div>
                        </div>
                    </div>

                    {/* Global Average */}
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="w-full md:w-48 flex items-center gap-2">
                            <span className="text-2xl">🌍</span>
                            <span className="text-gray-700 dark:text-gray-200 font-medium transition-colors">Global Average</span>
                        </div>
                        <div className="flex-grow w-full bg-gray-100 dark:bg-gray-700 rounded-full h-12 relative overflow-hidden transition-colors">
                            <div
                                className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full flex items-center justify-end px-4 text-white font-bold transition-all duration-1000 ease-out"
                                style={{ width: '100%' }}
                            >
                                4.7 tons/year
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button className="text-teal-600 dark:text-teal-400 font-semibold border border-teal-600 dark:border-teal-400 rounded-lg px-6 py-3 hover:bg-teal-50 dark:hover:bg-gray-700 transition-colors w-full md:w-auto">
                            View Detailed Country Stats
                        </button>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default CountryComparison;