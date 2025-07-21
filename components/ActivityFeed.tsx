import React, { useState, useEffect, useMemo } from 'react';
import { ActivityLog, ActivityLogType } from '../types.ts';
import { LogInIcon, LogOutIcon, ParkingIcon, WrenchScrewdriverIcon, CheckCircleSolidIcon, WarningIcon, AppointmentsIcon, ChevronDownIcon, XMarkIcon, SparklesIcon } from './icons/Icons.tsx';

interface ActivityFeedProps {
    log: ActivityLog[];
}

const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";

    return "just now";
}

const ActivityIcon: React.FC<{type: ActivityLogType}> = ({ type }) => {
    const iconMap: {[key in ActivityLogType]: {icon: React.ReactNode, bg: string}} = {
        [ActivityLogType.CheckIn]: { icon: <LogInIcon className="w-5 h-5 text-green-600" />, bg: 'bg-green-100'},
        [ActivityLogType.CheckOut]: { icon: <LogOutIcon className="w-5 h-5 text-gray-600" />, bg: 'bg-gray-100'},
        [ActivityLogType.Yard]: { icon: <ParkingIcon className="w-5 h-5 text-yellow-600" />, bg: 'bg-yellow-100'},
        [ActivityLogType.Maintenance]: { icon: <WrenchScrewdriverIcon className="w-5 h-5 text-red-600" />, bg: 'bg-red-100'},
        [ActivityLogType.Available]: { icon: <CheckCircleSolidIcon className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-100'},
        [ActivityLogType.Complete]: { icon: <CheckCircleSolidIcon className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-100'},
        [ActivityLogType.Delay]: { icon: <WarningIcon className="w-5 h-5 text-orange-600" />, bg: 'bg-orange-100'},
        [ActivityLogType.NewAppointment]: { icon: <AppointmentsIcon className="w-5 h-5 text-indigo-600" />, bg: 'bg-indigo-100'},
        [ActivityLogType.AiInfo]: { icon: <SparklesIcon className="w-5 h-5 text-cyan-600" />, bg: 'bg-cyan-100'},
    };
    const { icon, bg } = iconMap[type] || iconMap[ActivityLogType.CheckOut];
    return (
        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${bg}`}>
            {icon}
        </div>
    );
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({ log }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 w-full max-w-sm z-50">
            <div className={`bg-white rounded-xl shadow-2xl border border-gray-200/80 transform transition-all duration-300 ease-in-out ${isCollapsed ? 'translate-y-full opacity-0 scale-95' : 'translate-y-0 opacity-100'}`}>
                <header 
                    className="flex justify-between items-center p-3 border-b border-gray-200 cursor-pointer"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    <h3 className="font-bold text-gray-800">Live Activity Feed</h3>
                    <div className="flex items-center gap-2">
                        <button className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
                           <ChevronDownIcon className={`w-5 h-5 transition-transform ${isCollapsed ? '-rotate-180' : ''}`} />
                        </button>
                         <button onClick={(e) => {e.stopPropagation(); setIsVisible(false);}} className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
                           <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </header>
                <div className="p-3 space-y-3 max-h-80 overflow-y-auto">
                    {log.length > 0 ? log.map(entry => (
                        <div key={entry.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                           <ActivityIcon type={entry.type} />
                            <div>
                                <p className="text-sm text-gray-700">{entry.message}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{formatTimeAgo(entry.timestamp)}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-gray-500 text-sm py-8">No recent activity.</p>
                    )}
                </div>
            </div>
             {isCollapsed && (
                <button 
                    onClick={() => setIsCollapsed(false)}
                    className="absolute bottom-full mb-2 right-0 bg-brand-accent text-white px-4 py-2 rounded-t-lg shadow-lg"
                >
                    Show Feed
                </button>
            )}
        </div>
    );
};

export default ActivityFeed;