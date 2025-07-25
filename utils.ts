

export const parseAppointmentTime = (timeStr: string): Date => {
  const today = new Date();
  
  // Normalize input: remove spaces and make AM/PM uppercase
  const normalizedTime = timeStr.replace(/\s+/g, '').toUpperCase();
  
  const match = normalizedTime.match(/(\d{1,2}):(\d{2})(AM|PM)/);

  if (!match) {
    // Return a date far in the future for invalid formats to sort them last
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 10);
    return futureDate;
  }
  
  let [, hoursStr, minutesStr, modifier] = match;
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (modifier === 'PM' && hours < 12) {
    hours += 12;
  }
  if (modifier === 'AM' && hours === 12) {
    hours = 0; // Midnight case
  }

  today.setHours(hours, minutes, 0, 0);
  return today;
};

export const formatDate = (date: Date): string => date.toISOString().split('T')[0];


export const exportToCsv = (filename: string, data: any[]) => {
    if (data.length === 0) {
        alert("No data to export.");
        return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                let cell = row[header] === null || row[header] === undefined ? '' : String(row[header]);
                cell = cell.includes(',') ? `"${cell}"` : cell;
                return cell;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
        URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const formatDurationFromMs = (ms: number): string => {
    if (isNaN(ms) || ms < 0) {
        return 'N/A';
    }
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
};