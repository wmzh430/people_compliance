export const throttle = (func: (...args: any[]) => void, limit: number) => {
  let lastFunc: any;
  let lastRan: number;
  return function (this: any, ...args: any[]) {
    if (!lastRan) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(
        () => {
          if (Date.now() - lastRan >= limit) {
            func.apply(this, args);
            lastRan = Date.now();
          }
        },
        limit - (Date.now() - lastRan)
      );
    }
  };
};

export const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getStatusColor = (status: string): string => {
  const statusColorMap: Record<string, string> = {
    'Ready to Schedule': 'primary',
    'Pending F&D': 'info',
    Deleted: 'danger',
    Scheduled: 'success',
    'Ready to Review': 'warning',
    'Missed Visit': 'orange',
    // 'In Progress': 'brand',
    dismiss: 'danger',
    hold: 'info',
    not_assigned: 'primary'
  };

  return statusColorMap[status] || 'dark';
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  const pstDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));

  const day = pstDate.getDate();
  const month = pstDate.toLocaleString('en-US', {
    month: 'short',
    timeZone: 'America/Los_Angeles'
  });
  const year = pstDate.getFullYear();

  return `${month} ${day}, ${year}`;
};

export const formatExtractDate = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);

  if (!year || !month || !day) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];

  return `${monthNames[month - 1]} ${day}, ${year}`;
};

export const formatDateNonPst = (dateString: string, isYear: boolean = true): string => {
  // Date-only strings (YYYY-MM-DD): display date only, no time, no UTC shift
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-');
    const date = new Date(+year, +month - 1, +day);
    const monthStr = date.toLocaleString('en-US', { month: 'short' });
    return isYear ? `${monthStr} ${+day}, ${year}` : `${monthStr} ${+day}`;
  }

  const date = new Date(dateString);
  const tz = 'America/Los_Angeles';
  const month = date.toLocaleString('en-US', { timeZone: tz, month: 'short' });
  const day = date.toLocaleString('en-US', { timeZone: tz, day: 'numeric' });
  const year = date.toLocaleString('en-US', { timeZone: tz, year: 'numeric' });
  const time = date.toLocaleString('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return isYear ? `${month} ${day}, ${year} at ${time}` : `${month} ${day}, at ${time}`;
};

export const normalizeRegion = (region: string) => {
  return region?.charAt(0).toUpperCase() + region?.slice(1).toLowerCase();
};

export const formatPhoneNumber = (phone: string) => {
  return phone.replace(/^\+?(\d)(\d{3})(\d{3})(\d{4})$/, '+$1 ($2) $3-$4');
};

export const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

export const getAvatarColor = (id: string) => {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
  const index = id?.charCodeAt(0) % colors.length;
  return colors[index];
};

export const formatPSTTimestamp = (isoTimestamp: string): string => {
  const date = new Date(isoTimestamp);
  const formatted = date.toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    month: 'numeric',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return `${formatted.replace(',', '')} PST`;
};

export const getEndOfSaturdayPST = (): number => {
  const now = new Date();
  const laDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));

  const saturday = new Date(laDate);
  const day = saturday.getDay();
  const distanceToSaturday = (6 - day + 7) % 7;
  saturday.setDate(saturday.getDate() + distanceToSaturday);
  saturday.setHours(23, 59, 59, 999);

  return saturday.getTime();
};

export const extractValueSections = (value: string): { label: string; value: string }[] => {
  if (!value || typeof value !== 'string') return [];

  return value
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((segment) => {
      const [label, ...rest] = segment.split(':');
      if (!rest.length) {
        return { label: '', value: label.trim() };
      }
      return {
        label: label.trim(),
        value: rest.join(':').trim()
      };
    });
};
