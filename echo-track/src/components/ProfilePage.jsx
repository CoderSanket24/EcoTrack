import React from 'react';
import ProfileSidebar from './ProfileSidebar';
import ProfileDashboard from './ProfileDashboard';
import OrgMembersTable from './OrgMembersTable';

const ProfilePage = ({ user, onUpdateProfile, isDarkMode, onNavigate }) => {
    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left Sidebar (Profile Info) - Takes 4 columns on medium+ screens */}
                <div className="md:col-span-4">
                    <ProfileSidebar user={user} onUpdateProfile={onUpdateProfile} onNavigate={onNavigate} />
                </div>

                {/* Right Dashboard (Charts & Stats) - Takes 8 columns on medium+ screens */}
                <div className="md:col-span-8">
                    <ProfileDashboard isDarkMode={isDarkMode} onNavigate={onNavigate} />
                </div>
            </div>

            {/* Organization Members Table - Full Width */}
            {user?.is_org_admin && (
                <div className="mt-8 transform transition-all duration-500 ease-in-out">
                    <OrgMembersTable user={user} />
                </div>
            )}

        </div>
    );
};

export default ProfilePage;
