import React, { useState, useEffect, useRef } from 'react';

const navItems = [
    { id: 'welcome', label: 'Welcome', icon: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
    { id: 'impact-stats', label: 'Your Impact', icon: <path d="M13 10V3L4 14h7v7l9-11h-7z" />, requiresAuth: true },
    { id: 'recent-activities', label: 'Recent Activities', icon: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />, requiresAuth: true },
    { id: 'daily-engagement', label: 'Daily Engagement', icon: <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />, requiresAuth: true },
    { id: 'global-emissions', label: 'Global Emissions', icon: <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    { id: 'comparison', label: 'Global Impact', icon: <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
    { id: 'eco-champions', label: 'Leaderboard', icon: <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /> },
    { id: 'live-actions', label: 'Live Actions', icon: <path d="M13 10V3L4 14h7v7l9-11h-7z" /> },
    { id: 'actionable-insights', label: 'Insights', icon: <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /> },
    { id: 'emission-breakdown', label: 'Breakdown', icon: <path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /> },
];

const FloatingNav = ({ user, onNavigate }) => {
    // ...
    const scrollToLogActivity = () => {
        if (onNavigate) {
            onNavigate('log-activity');
        } else {
            // Fallback if handleNavigate not passed, though it should be.
            console.warn("Navigation handler not passed to FloatingNav");
        }
    };
    const [isOpen, setIsOpen] = useState(true);
    const [activeSection, setActiveSection] = useState('');
    const [isMobileMode, setIsMobileMode] = useState(false);
    const [mobilePosition, setMobilePosition] = useState({ x: 20, y: window.innerHeight - 80 });
    const dragRef = useRef(null);

    const visibleNavItems = navItems.filter(item => !item.requiresAuth || user);

    // Auto-highlight logic
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { threshold: 0.5 }
        );

        navItems.forEach((item) => {
            const element = document.getElementById(item.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, []);

    // Mobile check
    useEffect(() => {
        const checkMobile = () => {
            setIsMobileMode(window.innerWidth < 768);
            if (window.innerWidth < 768) setIsOpen(false);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
            setActiveSection(id);
            if (isMobileMode) setIsOpen(false);
        }
    };

    // Drag logic for mobile circle
    const handleDragStart = (e) => {
        if (!isMobileMode || isOpen) return;
        const startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        const startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
        const initialX = mobilePosition.x;
        const initialY = mobilePosition.y;

        const handleDrag = (moveEvent) => {
            const currentX = moveEvent.type === 'mousemove' ? moveEvent.clientX : moveEvent.touches[0].clientX;
            const currentY = moveEvent.type === 'mousemove' ? moveEvent.clientY : moveEvent.touches[0].clientY;
            setMobilePosition({
                x: initialX + (currentX - startX),
                y: initialY + (currentY - startY)
            });
        };

        const handleDragEnd = () => {
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('touchmove', handleDrag);
            document.removeEventListener('touchend', handleDragEnd);
        };

        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', handleDragEnd);
        document.addEventListener('touchmove', handleDrag);
        document.addEventListener('touchend', handleDragEnd);
    };

    if (isMobileMode && !isOpen) {
        return (
            <div
                className="fixed z-50 cursor-move"
                style={{ left: mobilePosition.x, top: mobilePosition.y }}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                onClick={(e) => {
                    // Prevent click if dragged
                    setIsOpen(true);
                }}
            >
                <div className="w-14 h-14 bg-teal-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </div>
            </div>
        );
    }

    return (
        <div className={`fixed left-4 top-1/2 transform -translate-y-1/2 z-40 transition-all duration-300 ${isOpen ? 'w-56' : 'w-14'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[80vh] transition-colors duration-300">
                {/* Toggle Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full p-3 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 transition-colors text-teal-600 dark:text-teal-400 flex-shrink-0"
                    title={isOpen ? "Collapse Menu" : "Expand Menu"}
                >
                    {isOpen ? (
                        <div className="flex items-center gap-2 w-full">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                            <span className="font-bold text-sm text-gray-700 dark:text-gray-200">Navigation</span>
                        </div>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>

                {/* Nav Items */}
                <div className={`overflow-y-auto custom-scrollbar ${!isOpen ? 'overflow-x-hidden' : ''}`}>
                    {visibleNavItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className={`w-full px-3 py-2.5 flex items-center gap-3 transition-all duration-200 group relative
                                ${activeSection === item.id ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-teal-500 dark:hover:text-teal-400'}
                            `}
                        >
                            <div className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isOpen ? '' : 'mx-auto group-hover:scale-110'}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {item.icon}
                                </svg>
                            </div>

                            <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                                {item.label}
                            </span>

                            {/* Tooltip for collapsed state */}
                            {!isOpen && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    ))}
                    {/* Log Activity Button - Hide for Org Admin */}
                    {!user?.is_org_admin && (
                        <div className="p-3 flex justify-center"> {/* Added a div to contain the button and center it */}
                            <button
                                onClick={scrollToLogActivity}
                                className={`
                                    relative group flex items-center justify-center
                                    w-14 h-14 rounded-full shadow-lg hover:shadow-xl
                                    bg-gradient-to-tr from-teal-500 to-emerald-500
                                    text-white transition-all duration-300 transform hover:-translate-y-1
                                    border border-teal-400/50
                                `}
                                aria-label="Log Activity"
                            >
                                <i className="fas fa-plus text-xl transition-transform duration-300 group-hover:rotate-90"></i>

                                {/* Tooltip */}
                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                                    Log Activity
                                </span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Close Option */}
                {isMobileMode && isOpen && (
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-full p-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border-t border-gray-200 dark:border-gray-600"
                    >
                        Minimize to Circle
                    </button>
                )}
            </div>
        </div>
    );
};

export default FloatingNav;