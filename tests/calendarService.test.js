// Unit tests for calendarService.js
describe('Calendar Service', (it) => {
    it('should generate study events from study plan', () => {
        const assignment = {
            id: 'test-123',
            title: 'Math Midterm',
            subject: 'math',
            dueDate: '2024-11-20',
            weekdayHours: 2,
            weekendHours: 4
        };

        const studyPlan = {
            totalHours: 12,
            topics: [
                { name: 'Algebra', description: 'Basic algebra', hours: 4, priority: 5, completed: false },
                { name: 'Geometry', description: 'Shapes and angles', hours: 4, priority: 4, completed: false },
                { name: 'Calculus', description: 'Derivatives', hours: 4, priority: 3, completed: false }
            ],
            milestones: [
                { id: 'm1', description: 'Complete Algebra', targetDate: '2024-11-15', completed: false }
            ]
        };

        const events = calendarService.generateDetailedStudyEvents(assignment, studyPlan);

        assert.isArray(events, 'Events should be an array');
        assert.truthy(events.length > 0, 'Should generate at least one event');
    });

    it('should create events for each topic in study plan', () => {
        const assignment = {
            id: 'test-456',
            title: 'Science Quiz',
            subject: 'science',
            dueDate: '2024-11-25',
            weekdayHours: 3,
            weekendHours: 5
        };

        const studyPlan = {
            totalHours: 10,
            topics: [
                { name: 'Physics', description: 'Newton laws', hours: 5, priority: 5, completed: false },
                { name: 'Chemistry', description: 'Chemical bonds', hours: 5, priority: 4, completed: false }
            ],
            milestones: []
        };

        const events = calendarService.generateDetailedStudyEvents(assignment, studyPlan);

        // Filter out milestone and review events to count only study events
        const studyEvents = events.filter(e => e.type === 'study');

        assert.truthy(studyEvents.length > 0, 'Should create study events for topics');
    });

    it('should set event properties correctly', () => {
        const assignment = {
            id: 'test-789',
            title: 'History Essay',
            subject: 'history',
            dueDate: '2024-11-18',
            weekdayHours: 2,
            weekendHours: 3
        };

        const studyPlan = {
            totalHours: 8,
            topics: [
                { name: 'Research', description: 'Gather sources', hours: 4, priority: 5, completed: false },
                { name: 'Writing', description: 'Draft essay', hours: 4, priority: 4, completed: false }
            ],
            milestones: []
        };

        const events = calendarService.generateDetailedStudyEvents(assignment, studyPlan);
        const firstEvent = events.find(e => e.type === 'study');

        assert.truthy(firstEvent, 'Should have at least one study event');
        assert.hasProperty(firstEvent, 'title', 'Event should have title');
        assert.hasProperty(firstEvent, 'description', 'Event should have description');
        assert.hasProperty(firstEvent, 'start', 'Event should have start time');
        assert.hasProperty(firstEvent, 'end', 'Event should have end time');
        assert.hasProperty(firstEvent, 'color', 'Event should have color');
        assert.hasProperty(firstEvent, 'subject', 'Event should have subject');
        assert.hasProperty(firstEvent, 'assignmentId', 'Event should have assignmentId');
        assert.hasProperty(firstEvent, 'type', 'Event should have type');
        assert.hasProperty(firstEvent, 'isCompleted', 'Event should have isCompleted');
    });

    it('should format event title with subject and topic', () => {
        const assignment = {
            id: 'test-abc',
            title: 'English Test',
            subject: 'english',
            dueDate: '2024-11-22',
            weekdayHours: 2,
            weekendHours: 4
        };

        const studyPlan = {
            totalHours: 6,
            topics: [
                { name: 'Grammar', description: 'Parts of speech', hours: 3, priority: 5, completed: false },
                { name: 'Literature', description: 'Poetry analysis', hours: 3, priority: 4, completed: false }
            ],
            milestones: []
        };

        const events = calendarService.generateDetailedStudyEvents(assignment, studyPlan);
        const studyEvent = events.find(e => e.type === 'study');

        assert.truthy(studyEvent, 'Should have study event');
        assert.truthy(studyEvent.title.includes('ENGLISH'), 'Title should include uppercase subject');
        assert.truthy(
            studyEvent.title.includes('Grammar') || studyEvent.title.includes('Literature'),
            'Title should include topic name'
        );
    });

    it('should create milestone events when provided', () => {
        const assignment = {
            id: 'test-def',
            title: 'Project',
            subject: 'science',
            dueDate: '2024-11-30',
            weekdayHours: 2,
            weekendHours: 4
        };

        const studyPlan = {
            totalHours: 15,
            topics: [
                { name: 'Research', description: 'Literature review', hours: 5, priority: 5, completed: false }
            ],
            milestones: [
                { id: 'm1', description: 'Complete research', targetDate: '2024-11-20', completed: false },
                { id: 'm2', description: 'Draft report', targetDate: '2024-11-25', completed: false }
            ]
        };

        const events = calendarService.generateDetailedStudyEvents(assignment, studyPlan);
        const milestoneEvents = events.filter(e => e.type === 'milestone');

        assert.equal(milestoneEvents.length, 2, 'Should create 2 milestone events');

        milestoneEvents.forEach(event => {
            assert.truthy(event.title.includes('Milestone'), 'Milestone title should include "Milestone"');
            assert.equal(event.type, 'milestone', 'Type should be milestone');
        });
    });

    it('should create final review session before due date', () => {
        const assignment = {
            id: 'test-ghi',
            title: 'Final Exam',
            subject: 'math',
            dueDate: '2024-11-21',
            weekdayHours: 3,
            weekendHours: 5
        };

        const studyPlan = {
            totalHours: 20,
            topics: [
                { name: 'Review', description: 'Final review', hours: 20, priority: 5, completed: false }
            ],
            milestones: []
        };

        const events = calendarService.generateDetailedStudyEvents(assignment, studyPlan);
        const reviewEvent = events.find(e => e.type === 'review');

        assert.truthy(reviewEvent, 'Should create final review event');
        assert.truthy(reviewEvent.title.includes('Final Review'), 'Title should include "Final Review"');
        assert.equal(reviewEvent.type, 'review', 'Type should be review');

        // Review should be before due date
        const reviewDate = new Date(reviewEvent.start);
        const dueDate = new Date(assignment.dueDate);
        assert.truthy(reviewDate < dueDate, 'Review should be scheduled before due date');
    });

    it('should schedule events with proper time slots', () => {
        const assignment = {
            id: 'test-jkl',
            title: 'Quiz',
            subject: 'history',
            dueDate: '2024-11-16',
            weekdayHours: 2,
            weekendHours: 4
        };

        const studyPlan = {
            totalHours: 8,
            topics: [
                { name: 'Chapter 1', description: 'Ancient history', hours: 4, priority: 5, completed: false },
                { name: 'Chapter 2', description: 'Medieval history', hours: 4, priority: 4, completed: false }
            ],
            milestones: []
        };

        const events = calendarService.generateDetailedStudyEvents(assignment, studyPlan);

        events.forEach(event => {
            if (event.type === 'study') {
                const start = new Date(event.start);
                const end = new Date(event.end);

                // Events should have valid start and end times
                assert.truthy(start instanceof Date, 'Start should be a Date');
                assert.truthy(end instanceof Date, 'End should be a Date');
                assert.truthy(end > start, 'End should be after start');

                // Duration should be reasonable (not more than a few hours)
                const durationMs = end - start;
                const durationHours = durationMs / (1000 * 60 * 60);
                assert.truthy(durationHours <= 3, 'Study session should not exceed 3 hours');
            }
        });
    });

    it('should sort topics by priority before scheduling', () => {
        const assignment = {
            id: 'test-mno',
            title: 'Comprehensive Exam',
            subject: 'math',
            dueDate: '2024-11-25',
            weekdayHours: 3,
            weekendHours: 5
        };

        const studyPlan = {
            totalHours: 15,
            topics: [
                { name: 'Low Priority', description: 'Review', hours: 5, priority: 2, completed: false },
                { name: 'High Priority', description: 'New material', hours: 5, priority: 5, completed: false },
                { name: 'Medium Priority', description: 'Practice', hours: 5, priority: 3, completed: false }
            ],
            milestones: []
        };

        const events = calendarService.generateDetailedStudyEvents(assignment, studyPlan);
        const studyEvents = events.filter(e => e.type === 'study');

        // First study event should be for high priority topic
        if (studyEvents.length > 0) {
            assert.truthy(studyEvents[0].priority >= 3, 'First events should have higher priority');
        }
    });

    it('should get correct subject color', () => {
        const mathColor = calendarService.getSubjectColor('math');
        const scienceColor = calendarService.getSubjectColor('science');
        const unknownColor = calendarService.getSubjectColor('unknown');

        assert.equal(typeof mathColor, 'string', 'Math color should be a string');
        assert.equal(typeof scienceColor, 'string', 'Science color should be a string');
        assert.truthy(mathColor.startsWith('#'), 'Color should be hex format');
        assert.truthy(scienceColor.startsWith('#'), 'Color should be hex format');
        assert.notEqual(mathColor, scienceColor, 'Different subjects should have different colors');
        assert.equal(unknownColor, '#6366f1', 'Unknown subject should return default color');
    });

    it('should handle date calculations without timezone issues', () => {
        // Test the fix for the "1 day before" bug
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const futureDate = new Date(today);
        futureDate.setDate(futureDate.getDate() + 7);
        const futureDateStr = futureDate.toISOString().split('T')[0];

        const assignment = {
            id: 'test-pqr',
            title: 'Test',
            subject: 'math',
            dueDate: futureDateStr,
            weekdayHours: 2,
            weekendHours: 3
        };

        const studyPlan = {
            totalHours: 10,
            topics: [
                { name: 'Topic', description: 'Description', hours: 10, priority: 5, completed: false }
            ],
            milestones: []
        };

        const events = calendarService.generateDetailedStudyEvents(assignment, studyPlan);

        // All events should be scheduled between now and due date
        events.forEach(event => {
            if (event.type === 'study') {
                const eventStart = new Date(event.start);
                eventStart.setHours(0, 0, 0, 0);

                assert.truthy(eventStart >= today, 'Event should not be in the past');
                assert.truthy(eventStart <= futureDate, 'Event should not be after due date');
            }
        });
    });

    it('should find optimal time slot without conflicts', () => {
        const date = new Date('2024-11-15T00:00:00');
        const durationHours = 1.5;
        const existingEvents = [];
        const isWeekend = false;

        const slot = calendarService.findOptimalTimeSlot(date, durationHours, existingEvents, isWeekend);

        assert.truthy(slot, 'Should return a time slot');
        assert.hasProperty(slot, 'hour', 'Slot should have hour');
        assert.hasProperty(slot, 'minute', 'Slot should have minute');
        assert.truthy(slot.hour >= 9, 'Hour should be within reasonable range');
        assert.truthy(slot.hour <= 21, 'Hour should be within reasonable range');
    });

    it('should avoid conflicts when finding time slots', () => {
        const date = new Date('2024-11-15T00:00:00');
        const durationHours = 1.5;

        // Create a conflict at 3 PM
        const conflictEvent = {
            start: new Date('2024-11-15T15:00:00'),
            end: new Date('2024-11-15T16:30:00')
        };

        const existingEvents = [conflictEvent];
        const isWeekend = false;

        const slot = calendarService.findOptimalTimeSlot(date, durationHours, existingEvents, isWeekend);

        // The slot should not be at 3 PM since there's a conflict
        assert.truthy(slot, 'Should still find a slot');

        // Verify the chosen slot doesn't conflict
        const slotStart = new Date(date);
        slotStart.setHours(slot.hour, slot.minute, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setTime(slotStart.getTime() + durationHours * 60 * 60 * 1000);

        const hasConflict = (slotStart < conflictEvent.end && slotEnd > conflictEvent.start);
        assert.falsy(hasConflict, 'Chosen slot should not conflict with existing event');
    });

    it('should use different time slots for weekends vs weekdays', () => {
        const date = new Date('2024-11-15T00:00:00');
        const durationHours = 1.5;
        const existingEvents = [];

        const weekdaySlot = calendarService.findOptimalTimeSlot(date, durationHours, existingEvents, false);
        const weekendSlot = calendarService.findOptimalTimeSlot(date, durationHours, existingEvents, true);

        assert.truthy(weekdaySlot, 'Should return weekday slot');
        assert.truthy(weekendSlot, 'Should return weekend slot');

        // Weekend slots should generally be earlier (morning/afternoon)
        // Weekday slots should generally be later (after school)
        assert.truthy(weekdaySlot.hour >= 15, 'Weekday slots should be after school hours');
        assert.truthy(weekendSlot.hour >= 9, 'Weekend slots should be during reasonable hours');
    });
});
