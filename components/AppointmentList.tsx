
import React from 'react';
import { TimelineAppointment, TimelineAppointmentStatus } from '../types.ts';
import { PencilIcon, AppointmentsIcon } from './icons/Icons.tsx';

interface AppointmentListProps {
  appointments: TimelineAppointment[];
  onOpenEditPanel: (appointment: TimelineAppointment) => void;
  isPast: boolean;
}

const getStatusStyles = (status: TimelineAppointmentStatus): string => {
    switch (status) {
        case 'Approved': return 'bg-blue-100 text-blue-800';
        case 'Completed': return 'bg-green-100 text-green-800';
        case 'Cancelled': return 'bg-red-100 text-red-800';
        case 'Draft': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const StatusBadge: React.FC<{ status: TimelineAppointmentStatus }> = ({ status }) => (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusStyles(status)}`}>
        {status}
    </span>
);

const AppointmentList: React.FC<AppointmentListProps> = ({ appointments, onOpenEditPanel, isPast }) => {
    if (appointments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center bg-white p-10 rounded-xl shadow-sm">
                <AppointmentsIcon className="w-16 h-16 text-gray-300" />
                <h3 className="mt-4 text-xl font-semibold text-gray-700">No Appointments</h3>
                <p className="mt-1 text-gray-500">There are no appointments scheduled for this day.</p>
            </div>
        );
    }

    const formatTime = (date: Date) => new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-max text-sm text-left">
                    <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b">
                        <tr>
                            <th scope="col" className="px-6 py-3 font-semibold">Time</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Company</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Vehicle #</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Purpose</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Dock</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Status</th>
                            <th scope="col" className="px-6 py-3 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map(appt => (
                            <tr key={appt.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-semibold text-gray-800">{formatTime(appt.startTime)}</div>
                                    <div className="text-xs text-gray-500">to {formatTime(appt.endTime)}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-gray-800">{appt.companyName}</div>
                                    <div className="text-xs text-gray-500">{appt.transporter}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-700 font-mono">{appt.vehicleNumber}</td>
                                <td className="px-6 py-4 text-gray-700">{appt.purposeOfVisit}</td>
                                <td className="px-6 py-4 text-gray-700">{appt.dockId}</td>
                                <td className="px-6 py-4"><StatusBadge status={appt.status} /></td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => onOpenEditPanel(appt)}
                                        disabled={isPast}
                                        className="text-gray-400 hover:text-brand-accent p-2 rounded-full hover:bg-gray-100 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                        title={isPast ? "Cannot edit past appointments" : "Edit Appointment"}
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AppointmentList;
