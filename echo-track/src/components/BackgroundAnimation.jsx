import React from 'react';

const BackgroundAnimation = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Floating Leaves Animation */}
            {[...Array(15)].map((_, i) => (
                <i
                    key={i}
                    className={`fas fa-leaf absolute text-teal-600/30 dark:text-teal-400/30`}
                    style={{
                        fontSize: `${Math.random() * 30 + 20}px`, // Random size between 20px and 50px
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animation: `floatBackground ${Math.random() * 20 + 15}s linear infinite, swayBackground ${Math.random() * 8 + 5}s ease-in-out infinite alternate`,
                        animationDelay: `-${Math.random() * 20}s`,
                        transform: `rotate(${Math.random() * 360}deg)`
                    }}
                ></i>
            ))}
            <style>{`
                @keyframes floatBackground {
                    0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.8; }
                    90% { opacity: 0.8; }
                    100% { transform: translate(100px, -100vh) rotate(360deg); opacity: 0; }
                }
                @keyframes swayBackground {
                    0% { margin-left: -30px; }
                    100% { margin-left: 30px; }
                }
            `}</style>
        </div>
    );
};

export default BackgroundAnimation;