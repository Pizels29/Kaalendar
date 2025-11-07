// Utility functions for date manipulation
const dateUtils = {
    // Get the first day of the month
    getFirstDayOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    },

    // Get the last day of the month
    getLastDayOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    },

    // Get the first day of the week containing the given date
    getFirstDayOfWeek(date, startOnMonday = true) {
        const day = date.getDay();
        const diff = startOnMonday ? (day === 0 ? 6 : day - 1) : day;
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() - diff);
    },

    // Get array of dates for a month view (including prev/next month days)
    getMonthViewDates(date) {
        const firstDay = this.getFirstDayOfMonth(date);
        const lastDay = this.getLastDayOfMonth(date);
        const startDate = this.getFirstDayOfWeek(firstDay);
        const dates = [];

        // Get 42 days (6 weeks)
        for (let i = 0; i < 42; i++) {
            dates.push(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i));
        }

        return dates;
    },

    // Get array of dates for a week view
    getWeekViewDates(date) {
        const startDate = this.getFirstDayOfWeek(date);
        return Array.from({ length: 7 }, (_, i) => 
            new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i)
        );
    },

    // Format date to YYYY-MM-DD
    formatDate(date) {
        return date.toISOString().split('T')[0];
    },

    // Format time to HH:mm
    formatTime(date) {
        return date.toTimeString().slice(0, 5);
    },

    // Parse time string (HH:mm) to Date object
    parseTime(timeString, baseDate = new Date()) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date(baseDate);
        date.setHours(hours, minutes, 0, 0);
        return date;
    },

    // Check if two dates are the same day
    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    },

    // Check if a date is today
    isToday(date) {
        return this.isSameDay(date, new Date());
    },

    // Check if a date is in the current month
    isCurrentMonth(date, baseDate) {
        return date.getMonth() === baseDate.getMonth() &&
               date.getFullYear() === baseDate.getFullYear();
    },

    // Add days to a date
    addDays(date, days) {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + days);
        return newDate;
    },

    // Calculate duration between two dates in minutes
    getDurationInMinutes(start, end) {
        return Math.round((end - start) / (1000 * 60));
    },

    // Format duration in minutes to human-readable string
    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h${mins ? ` ${mins}m` : ''}`;
    }
};