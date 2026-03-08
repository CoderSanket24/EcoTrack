import { useState, useEffect } from 'react';
import Logo from './Logo';

const Header = ({ user, onLoginClick, onRegisterClick, onLogout, onNavigate, currentPage, isDarkMode, toggleTheme }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [gamificationStats, setGamificationStats] = useState({
        xp: 0,
        current_streak: 0,
        total_active_days: 0
    });
    const [memberCount, setMemberCount] = useState(0);

    useEffect(() => {
        const fetchStats = async () => {
            if (user) {
                try {
                    if (user.is_org_admin) {
                        // Fetch Org Dashboard Stats for live Member Count
                        const queryParam = user.org_id ? `org_id=${user.org_id}` : `email=${user.email}`;
                        const res = await fetch(`${import.meta.env.VITE_API_URL}/organization/dashboard-stats/?${queryParam}`);
                        if (res.ok) {
                            const data = await res.json();
                            setMemberCount(data.total_members || 0);
                        }
                    } else {
                        // Fetch User Gamification Stats
                        const emailParam = user.email ? `?email=${user.email}` : '';
                        const response = await fetch(`${import.meta.env.VITE_API_URL}/gamification-stats/${emailParam}`);
                        if (response.ok) {
                            const data = await response.json();
                            setGamificationStats({
                                xp: data.user_stats.xp,
                                current_streak: data.user_stats.current_streak,
                                total_active_days: data.activity_heatmap.total_active_days
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error fetching stats:', error);
                }
            }
        };
        fetchStats();
    }, [user]);

    return (
        <header className="bg-teal-500 text-white shadow-md fixed top-0 left-0 w-full z-50">
            {/* Decorative Leaf Icons Container - Clipped */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <i className="fas fa-leaf absolute -left-6 -bottom-8 text-8xl text-teal-600/30 transform -rotate-45"></i>
                <i className="fas fa-leaf absolute -right-6 -bottom-8 text-8xl text-teal-600/30 transform rotate-45"></i>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center relative z-10">
                {/* Logo */}
                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('home')}>
                    <Logo className="w-8 h-8 text-white" />
                    <span className="text-2xl font-bold tracking-tight">ecoTracker</span>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex space-x-8 items-center">
                    <button
                        onClick={() => onNavigate('home')}
                        className={`${currentPage === 'home' ? 'font-bold border-b-2 border-white pb-1' : 'hover:text-teal-100 transition-colors font-medium'}`}
                    >
                        Home
                    </button>
                    <button
                        onClick={() => onNavigate('profile')}
                        className={`${currentPage === 'profile' ? 'font-bold border-b-2 border-white pb-1' : 'hover:text-teal-100 transition-colors font-medium'}`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => onNavigate('community')}
                        className={`${currentPage === 'community' ? 'font-bold border-b-2 border-white pb-1' : 'hover:text-teal-100 transition-colors font-medium'}`}
                    >
                        Community
                    </button>
                    <button
                        onClick={() => onNavigate('challenges')}
                        className={`${currentPage === 'challenges' ? 'font-bold border-b-2 border-white pb-1' : 'hover:text-teal-100 transition-colors font-medium'}`}
                    >
                        Challenges
                    </button>
                </nav>



                {/* Auth / Profile Section */}
                <div className="hidden md:flex items-center">
                    {user ? (
                        <div className="flex items-center space-x-6">
                            {user.is_org_admin ? (
                                /* ORGANIZATION HEADER STATS */
                                <div className="flex items-center space-x-6">
                                    {/* Org Name */}
                                    <div className="flex items-center space-x-2 bg-teal-600/30 px-3 py-1.5 rounded-full border border-teal-400/30">
                                        <i className="fas fa-building text-teal-100"></i>
                                        <span className="font-bold text-sm text-white">{user.name}</span>
                                    </div>

                                    {/* Total Members */}
                                    <div className="flex items-center space-x-2 bg-teal-600/30 px-3 py-1.5 rounded-full border border-teal-400/30">
                                        <i className="fas fa-users text-teal-100"></i>
                                        <span className="font-bold text-sm text-white">{memberCount || user.total_members || 0} Members</span>
                                    </div>
                                </div>
                            ) : (
                                /* REGULAR USER HEADER STATS (XP & Streak) */
                                <>
                                    {/* XP Section */}
                                    <div className="flex items-center space-x-2 bg-teal-600/30 px-3 py-1.5 rounded-full border border-teal-400/30" title="Experience Points">
                                        <span className="text-yellow-300 font-bold text-sm">⚡ {gamificationStats.xp} XP</span>
                                    </div>

                                    {/* Days & Streak Section */}
                                    <div className="relative group cursor-pointer py-2">
                                        <div className="flex items-center space-x-4 bg-teal-600/30 px-4 py-1.5 rounded-full hover:bg-teal-600/50 transition-colors border border-teal-400/30">
                                            <div className="flex items-center space-x-1.5">
                                                <svg className="w-4 h-4 text-teal-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="font-bold text-sm">{gamificationStats.total_active_days} Days</span>
                                            </div>
                                            <div className="w-px h-4 bg-teal-400/50"></div>
                                            <div className="flex items-center space-x-1.5">
                                                <svg className="w-4 h-4 text-orange-300" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.45-.412-1.725a1 1 0 00-1.457-.892c-.34.173-.594.52-.756.966-.169.467-.296 1.076-.329 1.908-.078 1.993.06 4.107.722 6.138.086.263.169.524.246.78a2 2 0 001.911 1.41h.002a2 2 0 001.911-1.41c.077-.256.16-.517.246-.78.662-2.03.8-4.145.722-6.138-.033-.832-.16-1.441-.329-1.908-.162-.446-.416-.793-.756-.966zm-1.687 5.362c.12-.516.292-1.09.51-1.666.21-.555.46-1.102.738-1.595.278-.493.566-.92.855-1.279.29-.358.58-.648.862-.84.282-.192.547-.29.812-.29.265 0 .53.098.812.29.282.192.572.482.862.84.289.359.577.786.855 1.279.278.493.528 1.04.738 1.595.218.576.39 1.15.51 1.666.12.516.196 1.02.226 1.516.03.496.014.986-.048 1.476-.062.49-.17.974-.322 1.449-.152.475-.346.936-.58 1.38-.234.444-.51.867-.825 1.262a.996.996 0 01-1.556 0c-.315-.395-.591-.818-.825-1.262-.234-.444-.428-.905-.58-1.38-.152-.475-.26-.959-.322-1.449-.062-.49-.078-.98-.048-1.476.03-.496.106-1.0.226-1.516z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-bold text-sm">{gamificationStats.current_streak} Streak</span>
                                            </div>
                                        </div>

                                        {/* Achievements Dropdown */}
                                        <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50 border border-gray-100 dark:border-gray-700">
                                            <div className="absolute -top-2 right-12 w-4 h-4 bg-white dark:bg-gray-800 transform rotate-45 border-l border-t border-gray-100 dark:border-gray-700"></div>
                                            <div className="p-4">
                                                <h3 className="text-gray-800 dark:text-white font-bold mb-3 text-sm uppercase tracking-wider transition-colors">Your Achievements</h3>
                                                <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800/30 transition-colors">
                                                    <div className="text-2xl bg-white dark:bg-gray-700 p-1 rounded-full shadow-sm transition-colors">🌟</div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 transition-colors">Welcome Explorer!</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">Start logging your eco-activities to earn your first badge.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Profile Section */}
                            <div className="relative group cursor-pointer py-2">
                                <div className="flex items-center space-x-2 hover:bg-teal-600/30 px-3 py-1.5 rounded-full transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold border-2 border-teal-200 shadow-sm">
                                        {user.is_org_admin ? (user.admin_name ? user.admin_name[0].toUpperCase() : 'A') : (user.username ? user.username[0].toUpperCase() : 'U')}
                                    </div>
                                    <span className="font-semibold text-sm">{user.is_org_admin ? user.admin_name : (user.username || 'User')}</span>
                                    <svg className="w-4 h-4 text-teal-200 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>

                                {/* Profile Dropdown */}
                                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50 overflow-hidden border border-gray-100 dark:border-gray-700">
                                    <div className="py-2">
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 transition-colors">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold transition-colors">{user.is_org_admin ? "Organization Admin" : "Signed in as"}</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate transition-colors">{user.is_org_admin ? user.admin_name : (user.email || user.username)}</p>
                                        </div>
                                        <button
                                            onClick={() => onNavigate('profile')}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-gray-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                                        >
                                            <svg className="w-4 h-4 inline mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            View Profile
                                        </button>

                                        {/* Theme Toggle in Dropdown */}
                                        <div className="px-4 py-2 flex items-center justify-between hover:bg-teal-50 dark:hover:bg-gray-700 transition-colors cursor-default">
                                            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                <i className={`fas fa-${isDarkMode ? 'moon' : 'sun'} w-4 mr-3 text-center`}></i>
                                                <span>Dark Mode</span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleTheme();
                                                }}
                                                className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none ${isDarkMode ? 'bg-teal-500' : 'bg-gray-300'}`}
                                            >
                                                <div
                                                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`}
                                                ></div>
                                            </button>
                                        </div>

                                        <button
                                            onClick={onLogout}
                                            className="w-full text-left flex items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-100 dark:border-gray-700"
                                        >
                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex space-x-4 items-center">
                            {/* Theme Toggle for Logged Out */}
                            <button
                                onClick={toggleTheme}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none mr-2 ${isDarkMode ? 'bg-teal-900 ring-1 ring-teal-700' : 'bg-sky-100 ring-1 ring-sky-200'}`}
                                aria-label="Toggle Dark Mode"
                            >
                                <div
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}
                                >
                                    <i className={`fas fa-${isDarkMode ? 'moon' : 'sun'} text-[10px] ${isDarkMode ? 'text-teal-600' : 'text-yellow-500'}`}></i>
                                </div>
                            </button>

                            <button
                                onClick={onLoginClick}
                                className="hover:text-teal-100 font-medium"
                            >
                                Login
                            </button>
                            <button
                                onClick={onRegisterClick}
                                className="bg-white text-teal-600 px-4 py-2 rounded-full font-semibold hover:bg-teal-50 transition-colors shadow-sm"
                            >
                                Register
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 focus:outline-none"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-teal-600 dark:bg-teal-800 pb-4 px-4 pt-2 space-y-2 shadow-inner transition-colors">
                    <button onClick={() => onNavigate('home')} className="block w-full text-left py-2 bg-teal-700 dark:bg-teal-900 rounded px-2 font-bold transition-colors">Home</button>
                    <button onClick={() => onNavigate('profile')} className="block w-full text-left py-2 hover:bg-teal-700 dark:hover:bg-teal-900 rounded px-2 transition-colors">Profile</button>
                    <button onClick={() => onNavigate('community')} className="block w-full text-left py-2 hover:bg-teal-700 dark:hover:bg-teal-900 rounded px-2 transition-colors">Community</button>
                    <button onClick={() => onNavigate('challenges')} className="block py-2 hover:bg-teal-700 dark:hover:bg-teal-900 rounded px-2 transition-colors text-left w-full">Challenges</button>

                    <div className="border-t border-teal-500 dark:border-teal-700 pt-2 mt-2 flex flex-col space-y-2 transition-colors">
                        {user ? (
                            <>
                                <div className="flex items-center space-x-3 px-2 py-2 bg-teal-700/50 dark:bg-teal-900/50 rounded-lg transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold">
                                        {user.username ? user.username[0].toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{user.username}</p>
                                        <p className="text-xs text-teal-200">6 Days • 0 Streak</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        onLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="text-left py-2 hover:bg-teal-700 dark:hover:bg-teal-900 rounded px-2 text-red-200 hover:text-red-100 transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        onLoginClick();
                                        setIsMenuOpen(false);
                                    }}
                                    className="text-left py-2 hover:bg-teal-700 dark:hover:bg-teal-900 rounded px-2 transition-colors"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => {
                                        onRegisterClick();
                                        setIsMenuOpen(false);
                                    }}
                                    className="bg-white text-teal-600 py-2 rounded font-semibold text-center shadow-sm"
                                >
                                    Register
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
