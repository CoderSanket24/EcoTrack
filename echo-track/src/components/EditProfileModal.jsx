import React, { useState, useEffect } from 'react';

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const DEPARTMENTS = [
    'IT', 'HR', 'Sales', 'Marketing', 'Operations', 'Finance', 'Engineering', 'Legal', 'Other'
];

const EditProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone_no: '',
        city: '',
        state: '',
        target_org_id: '',
        department: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [orgVerification, setOrgVerification] = useState({ status: 'idle', message: '' }); // status: idle, verifying, success, error

    useEffect(() => {
        if (user && user.profile) {
            setFormData({
                first_name: user.profile.first_name || '',
                last_name: user.profile.last_name || '',
                phone_no: user.profile.phone_no || '',
                city: user.profile.city || '',
                state: user.profile.state || '',
                target_org_id: user.profile.org_id || '', // Pre-fill if exists, so they can see/edit department
                department: user.profile.department || ''
            });

            // If user already has an org, mark as verified implicitly so they can see dept
            if (user.profile.org_id) {
                setOrgVerification({ status: 'success', message: `Verified: ${user.profile.org_name || 'Current Org'}` });
            }
            // Don't auto-verify existing org, as we are joining a NEW one -> Wait, if strictly editing, pre-fill is better.
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'target_org_id') {
            setOrgVerification({ status: 'idle', message: '' });
        }
    };

    const handleVerifyOrg = async () => {
        if (!formData.target_org_id) return;
        setOrgVerification({ status: 'verifying', message: '' });

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/organization/${formData.target_org_id}/`);
            if (response.ok) {
                const data = await response.json();
                setOrgVerification({ status: 'success', message: `Verified: ${data.name}` });
            } else {
                setOrgVerification({ status: 'error', message: 'Organization not found' });
            }
        } catch (error) {
            setOrgVerification({ status: 'error', message: 'Connection error' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await onUpdate(formData);
            onClose();
        } catch (err) {
            setError('Failed to update profile. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in transition-colors duration-300">
                <div className="bg-teal-600 dark:bg-teal-700 px-6 py-4 flex justify-between items-center relative overflow-hidden transition-colors">
                    {/* Decorative Background Icon */}
                    <i className="fas fa-leaf absolute -right-4 -bottom-4 text-8xl text-teal-700/20 transform rotate-12"></i>

                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <i className="fas fa-user-edit text-white text-lg"></i>
                        </div>
                        <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                    </div>
                    <button onClick={onClose} className="text-teal-100 hover:text-white transition-colors relative z-10">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                        <i className="fas fa-exclamation-circle"></i> {error}
                    </div>}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                            <div className="relative">
                                <i className="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm"></i>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    placeholder="John"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                            <div className="relative">
                                <i className="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm"></i>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                        <div className="relative">
                            <i className="fas fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm"></i>
                            <input
                                type="tel"
                                name="phone_no"
                                value={formData.phone_no}
                                onChange={handleChange}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                placeholder="+91 9876543210"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                            <div className="relative">
                                <i className="fas fa-city absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm"></i>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    placeholder="Mumbai"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                            <div className="relative">
                                <i className="fas fa-map-marker-alt absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm"></i>
                                <select
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                                >
                                    <option value="">Select State</option>
                                    {INDIAN_STATES.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                                <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs pointer-events-none"></i>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Join Organization <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <i className="fas fa-building absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm"></i>
                                    <input
                                        type="text"
                                        name="target_org_id"
                                        value={formData.target_org_id || ''}
                                        onChange={handleChange}
                                        className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 
                                            ${orgVerification.status === 'error' ? 'border-red-500 focus:ring-red-200 focus:border-red-500' :
                                                orgVerification.status === 'success' ? 'border-green-500 focus:ring-green-200 focus:border-green-500' :
                                                    'border-gray-300 dark:border-gray-600 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400'}`}
                                        placeholder="Enter Org ID (e.g. ORG-X9A2B)"
                                    />
                                </div>
                                {formData.target_org_id && (
                                    <button
                                        type="button"
                                        onClick={handleVerifyOrg}
                                        disabled={orgVerification.status === 'verifying' || orgVerification.status === 'success'}
                                        className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap
                                            ${orgVerification.status === 'success'
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'}`}
                                    >
                                        {orgVerification.status === 'verifying' ? 'Checking...' :
                                            orgVerification.status === 'success' ? 'Verified' : 'Verify'}
                                    </button>
                                )}
                            </div>
                            {orgVerification.message && (
                                <p className={`text-xs mt-1 ${orgVerification.status === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                    {orgVerification.status === 'success' ? <i className="fas fa-check-circle mr-1"></i> : <i className="fas fa-exclamation-circle mr-1"></i>}
                                    {orgVerification.message}
                                </p>
                            )}
                        </div>

                        {/* Department Selection - Only if Org Verified */}
                        {orgVerification.status === 'success' && (
                            <div className="animate-fadeIn">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                                <div className="relative">
                                    <i className="fas fa-briefcase absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm"></i>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                                    >
                                        <option value="">Select Department</option>
                                        {DEPARTMENTS.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                    <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs pointer-events-none"></i>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700 mt-2 transition-colors">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || (formData.target_org_id && orgVerification.status !== 'success')}
                            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-medium rounded-lg transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-circle-notch fa-spin"></i>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save"></i>
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;