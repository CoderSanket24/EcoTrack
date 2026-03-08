import { mockChallenges } from './Challenges';

const EngagementCard = ({ title, icon, children, accentColor }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-300`}>
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accentColor}`}></div>
        <div className="flex items-center mb-4 pl-2">
            <span className="text-xl mr-2">{icon}</span>
            <h3 className="font-bold text-gray-800 dark:text-white text-lg transition-colors">{title}</h3>
        </div>
        <div className="flex-grow pl-2">
            {children}
        </div>
    </div>
);

const DailyEngagement = ({ onNavigate }) => {
    // 1. Get Active Challenge (e.g., first one found)
    const activeChallenge = mockChallenges.find(c => c.status === 'Active') || mockChallenges[0];

    // 2. Get Completed Challenge for Badge (e.g., first completed one)
    const completedChallenge = mockChallenges.find(c => c.status === 'Completed');

    return (
        <div>
            <h2 className="text-3xl font-bold text-teal-800 dark:text-teal-400 mb-8 text-center transition-colors duration-300">Daily Engagement</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Today's Challenge */}
                <EngagementCard title="Today's Challenge" icon="🎯" accentColor="bg-teal-500">
                    <div className="mb-4">
                        <h4 className="font-bold text-gray-800 dark:text-white">{activeChallenge.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{activeChallenge.description}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded w-fit">
                            <i className="fas fa-bolt"></i> +{activeChallenge.xp} XP
                        </div>
                    </div>

                    <div className="flex space-x-3 mb-3">
                        <button
                            onClick={() => onNavigate && onNavigate('challenges')}
                            className="flex-1 bg-teal-500 text-white py-2 rounded-lg font-semibold hover:bg-teal-600 transition-colors shadow-sm text-sm"
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => onNavigate && onNavigate('challenges')}
                            className="flex-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm"
                        >
                            Skip
                        </button>
                    </div>
                    <button
                        onClick={() => onNavigate && onNavigate('challenges')}
                        className="w-full text-center text-teal-600 dark:text-teal-400 text-sm font-medium hover:underline"
                    >
                        View All Challenges
                    </button>
                </EngagementCard>

                {/* Recent Badges */}
                <EngagementCard title="Recent Badges" icon="🏆" accentColor="bg-teal-500">
                    {completedChallenge ? (
                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 flex items-start space-x-3 border border-orange-100 dark:border-orange-900/30">
                            <div className="text-3xl bg-white dark:bg-gray-700 w-12 h-12 flex items-center justify-center rounded-full shadow-sm text-yellow-500">
                                <i className={completedChallenge.badgeIcon}></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-white">{completedChallenge.rewards}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Earned for completing {completedChallenge.title}.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-start space-x-3">
                            <div className="text-3xl bg-white dark:bg-gray-700 p-1.5 rounded-full shadow-sm">🌟</div>
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-white">Welcome!</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Start logging activities to earn your first badge.</p>
                            </div>
                        </div>
                    )}
                </EngagementCard>

                {/* Quick Actions */}
                <EngagementCard title="Quick Actions" icon="⚡" accentColor="bg-teal-500">
                    <div className="space-y-3">
                        <button onClick={() => onNavigate && onNavigate('log-activity')} className="w-full text-left px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 font-medium hover:border-teal-500 dark:hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-gray-600 transition-all flex items-center group">
                            <span className="mr-3 text-lg group-hover:scale-110 transition-transform">+</span> Log Activity
                        </button>
                        <button className="w-full text-left px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 font-medium hover:border-teal-500 dark:hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-gray-600 transition-all flex items-center group">
                            <span className="mr-3 text-lg group-hover:scale-110 transition-transform">📈</span> View Reports
                        </button>
                        <button className="w-full text-left px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 font-medium hover:border-teal-500 dark:hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-gray-600 transition-all flex items-center group">
                            <span className="mr-3 text-lg group-hover:scale-110 transition-transform">🎯</span> Set Goal
                        </button>
                    </div>
                </EngagementCard>
            </div>
        </div>
    );
};

export default DailyEngagement;