import Logo from './Logo';

const Footer = () => {
    return (
        <footer className="bg-gray-900 dark:bg-black text-white py-10 mt-auto transition-colors duration-300 border-t border-transparent dark:border-gray-800">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Brand */}
                <div>
                    <div className="flex items-center space-x-2 mb-4">
                        <Logo className="w-6 h-6 text-teal-400" />
                        <h3 className="text-2xl font-bold text-teal-400">ecoTracker</h3>
                    </div>
                    <p className="text-gray-400 text-sm">
                        Empowering individuals to track and reduce their carbon footprint for a sustainable future.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-gray-400 text-sm">
                        <li><a href="#" className="hover:text-teal-400 transition-colors">Home</a></li>
                        <li><a href="#" className="hover:text-teal-400 transition-colors">About Us</a></li>
                        <li><a href="#" className="hover:text-teal-400 transition-colors">Features</a></li>
                        <li><a href="#" className="hover:text-teal-400 transition-colors">Contact</a></li>
                    </ul>
                </div>

                {/* Resources */}
                <div>
                    <h4 className="text-lg font-semibold mb-4">Resources</h4>
                    <ul className="space-y-2 text-gray-400 text-sm">
                        <li><a href="#" className="hover:text-teal-400 transition-colors">Blog</a></li>
                        <li><a href="#" className="hover:text-teal-400 transition-colors">Community</a></li>
                        <li><a href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-teal-400 transition-colors">Terms of Service</a></li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h4 className="text-lg font-semibold mb-4">Stay Updated</h4>
                    <p className="text-gray-400 text-sm mb-4">Subscribe to our newsletter for the latest eco-tips.</p>
                    <div className="flex">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="bg-gray-800 text-white px-4 py-2 rounded-l focus:outline-none focus:ring-1 focus:ring-teal-500 w-full"
                        />
                        <button className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-r transition-colors">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} ecoTracker. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
