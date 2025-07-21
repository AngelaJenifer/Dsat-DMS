
import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { DashboardData, Dock, Vehicle, DockStatus, VehicleStatus, Operation, OperationStatus, TimelineAppointment } from '../types.ts';
import { TruckIcon, SparklesIcon, AlertTriangleIcon, AppointmentsIcon } from './icons/Icons.tsx';
import { getDashboardSummary } from '../services/geminiService.ts';

const KpiCard: React.FC<{
  title: string;
  value: string;
  subtext: string;
  icon: React.FC<any>;
  iconBgColor: string;
}> = ({ title, value, subtext, icon: Icon, iconBgColor }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200/80 hover:shadow-md transition-shadow duration-300 flex items-center justify-between">
      <div className="flex flex-col">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        <p className="text-xs text-gray-500 mt-2">{subtext}</p>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgColor}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );
};

const AIInsightSection: React.FC<{ data: DashboardData; }> = ({ data }) => {
    const [summary, setSummary] = React.useState('');
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        setSummary('');

        try {
            const result = await getDashboardSummary(data);
            setSummary(result);
        } catch (e) {
            console.error("Error generating AI summary:", e);
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
            setError(`Failed to generate summary. Please check your API key and network connection. Details: ${errorMessage}`);
        } finally {
            setIsGenerating(false);
        }
    };

    if (isGenerating) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary-500 animate-pulse">
                <div className="h-5 bg-gray-300 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="bg-red-50 p-6 rounded-lg shadow-md border-l-4 border-red-500">
                <div className="flex items-center gap-3 mb-3">
                    <AlertTriangleIcon className="w-6 h-6 text-red-500" />
                    <h3 className="font-semibold text-red-800">Error Generating Summary</h3>
                </div>
                <p className="text-sm text-red-700">{error}</p>
                 <button onClick={handleGenerate} className="mt-4 px-3 py-1.5 text-sm font-semibold border border-red-300 bg-white text-red-700 rounded-md hover:bg-red-100">
                    Try Again
                </button>
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center transition-all hover:shadow-lg hover:border-primary-300">
                <div className="w-12 h-12 bg-primary-100 rounded-full mx-auto flex items-center justify-center">
                    <SparklesIcon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-800">Get AI-Powered Insights</h3>
                <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">Let AI analyze today's data to generate a quick operational summary, highlighting key metrics and potential issues.</p>
                <button onClick={handleGenerate} disabled={isGenerating} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 text-sm font-semibold">
                    {isGenerating ? 'Generating...' : 'Generate Summary'}
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary-500">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 mb-3">
                    <SparklesIcon className="w-6 h-6 text-primary-500" />
                    <h2 className="text-xl font-semibold text-gray-800">AI-Generated Summary</h2>
                </div>
                <button onClick={handleGenerate} disabled={isGenerating} className="text-sm font-semibold text-primary-600 hover:underline disabled:text-gray-400">
                    Regenerate
                </button>
            </div>
            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: summary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\n/g, '<li>$1</li>').replace(/(\r\n|\n|\r)/gm, "<br>") }}>
            </div>
        </div>
    );
};


interface DashboardProps {
    data: DashboardData;
    docks: Dock[];
    vehicles: Vehicle[];
    operations: Operation[];
    timelineAppointments: TimelineAppointment[];
    onSelectItem: (item: Dock | Vehicle) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, docks, vehicles, operations, timelineAppointments, onSelectItem }) => {
    const COLORS_PIE = ['#4f46e5', '#a855f7'];

    const upcomingAppointments = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        return timelineAppointments
            .filter(appt => {
                const apptDate = new Date(appt.startTime);
                return apptDate.toISOString().split('T')[0] === todayStr &&
                       apptDate > now &&
                       (appt.status === 'Approved' || appt.status === 'Draft');
            })
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .slice(0, 5); // Limit to 5
    }, [timelineAppointments]);

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.kpis.map((kpi, index) => (
                    <KpiCard key={index} {...kpi} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200/80">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Upcoming Appointments</h2>
                    <div className="space-y-4">
                        {upcomingAppointments.length > 0 ? upcomingAppointments.map((appt) => (
                            <div key={appt.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <AppointmentsIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{new Date(appt.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {appt.companyName}</p>
                                    <p className="text-sm text-gray-500">{appt.vehicleNumber} to Dock {appt.dockId}</p>
                                </div>
                                <div className="ml-auto text-sm font-semibold text-blue-700">{appt.status}</div>
                            </div>
                        )) : <p className="text-center text-gray-500 py-4">No upcoming appointments for today.</p>}
                    </div>
                </div>

                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200/80">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Dock Activity</h2>
                    <div className="space-y-4">
                        {data.dockActivities.map((activity) => (
                            <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                    <TruckIcon className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{activity.dockName}: {activity.vehicleNumber}</p>
                                    <p className="text-sm text-gray-500">{activity.carrier} &bull; {activity.startTime} - {activity.endTime}</p>
                                </div>
                                <div className="ml-auto text-sm font-semibold text-primary-700">{activity.status}</div>
                            </div>
                        ))}
                         {data.dockActivities.length === 0 && <p className="text-center text-gray-500 py-4">No active dock operations.</p>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200/80">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Load/Unload Trend (This Week)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.loadUnloadTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '0.5rem' }}/>
                            <Legend wrapperStyle={{fontSize: "12px"}}/>
                            <Bar dataKey="loading" fill="#4f46e5" name="Loading" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="unloading" fill="#a855f7" name="Unloading" radius={[4, 4, 0, 0]}/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200/80">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">On-Time vs. Late Arrivals</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={data.onTimeVsLateData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {data.onTimeVsLateData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                                ))}
                            </Pie>
                             <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '0.5rem' }}/>
                            <Legend wrapperStyle={{fontSize: "12px"}}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <AIInsightSection data={data} />
        </div>
    );
};

export default Dashboard;
