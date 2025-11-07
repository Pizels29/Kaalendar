// Unit tests for dateUtils.js
describe('Date Utils', (it) => {
    it('should format date correctly', () => {
        const date = new Date('2024-11-07T00:00:00');
        const formatted = formatDate(date);
        assert.truthy(formatted, 'Formatted date should be truthy');
        assert.equal(typeof formatted, 'string', 'Formatted date should be a string');
    });

    it('should calculate days between dates correctly', () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const days = daysBetween(today, tomorrow);
        assert.equal(days, 1, 'Days between today and tomorrow should be 1');
    });

    it('should handle same date correctly', () => {
        const date = new Date('2024-11-07T00:00:00');
        const days = daysBetween(date, date);
        assert.equal(days, 0, 'Days between same date should be 0');
    });

    it('should handle past dates correctly', () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const days = daysBetween(yesterday, today);
        assert.equal(days, 1, 'Days between yesterday and today should be 1');
    });

    it('should identify weekend correctly', () => {
        // Create a known Sunday (2024-11-10)
        const sunday = new Date('2024-11-10T00:00:00');
        assert.truthy(isWeekend(sunday), 'Sunday should be identified as weekend');

        // Create a known Saturday (2024-11-09)
        const saturday = new Date('2024-11-09T00:00:00');
        assert.truthy(isWeekend(saturday), 'Saturday should be identified as weekend');
    });

    it('should identify weekday correctly', () => {
        // Create a known Monday (2024-11-11)
        const monday = new Date('2024-11-11T00:00:00');
        assert.falsy(isWeekend(monday), 'Monday should not be identified as weekend');

        // Create a known Wednesday (2024-11-13)
        const wednesday = new Date('2024-11-13T00:00:00');
        assert.falsy(isWeekend(wednesday), 'Wednesday should not be identified as weekend');
    });

    it('should add days correctly', () => {
        const date = new Date('2024-11-07T00:00:00');
        const newDate = addDays(date, 5);

        assert.equal(newDate.getDate(), 12, 'Adding 5 days to Nov 7 should give Nov 12');
        assert.equal(newDate.getMonth(), 10, 'Month should still be November (10)');
    });

    it('should handle month boundary when adding days', () => {
        const date = new Date('2024-11-28T00:00:00');
        const newDate = addDays(date, 5);

        assert.equal(newDate.getDate(), 3, 'Adding 5 days to Nov 28 should give Dec 3');
        assert.equal(newDate.getMonth(), 11, 'Month should be December (11)');
    });

    it('should parse date string correctly', () => {
        const dateStr = '2024-11-07';
        const parsed = parseDate(dateStr);

        assert.truthy(parsed instanceof Date, 'Parsed value should be a Date object');
        assert.equal(parsed.getFullYear(), 2024, 'Year should be 2024');
        assert.equal(parsed.getMonth(), 10, 'Month should be November (10)');
        assert.equal(parsed.getDate(), 7, 'Date should be 7');
    });

    it('should get time string correctly', () => {
        const date = new Date('2024-11-07T14:30:00');
        const timeStr = getTimeString(date);

        assert.truthy(timeStr, 'Time string should be truthy');
        assert.equal(typeof timeStr, 'string', 'Time string should be a string');
        assert.truthy(timeStr.includes(':'), 'Time string should include colon separator');
    });
});
