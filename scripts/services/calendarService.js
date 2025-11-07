// Calendar Service for managing the calendar interface and scheduling
class CalendarService {
    constructor() {
        this.calendar = null;
    }

    // Initialize the calendar
    initialize(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Calendar container not found');
            return;
        }

        // Create calendar instance
        this.calendar = new Calendar(container, {
            defaultView: 'month',
            startOnMonday: true,
            workingHours: {
                start: 9,
                end: 21
            }
        });

        // Load events from storage
        this.loadEvents();

        return this.calendar;
    }

    // Load events from storage
    async loadEvents() {
        try {
            const events = await dataService.getEvents();
            events.forEach(event => {
                // Convert stored date strings back to Date objects
                const calendarEvent = {
                    id: event.id,
                    title: event.title,
                    start: new Date(event.start),
                    end: new Date(event.end),
                    color: event.color || this.getSubjectColor(event.subject),
                    subject: event.subject,
                    assignmentId: event.assignmentId,
                    isCompleted: event.isCompleted || false
                };
                this.calendar.addEvent(calendarEvent);
            });
        } catch (error) {
            console.error('Error loading events:', error);
        }
    }

    // Schedule study sessions for an assignment
    async scheduleStudySessions(assignment, studyPlan) {
        try {
            const events = this.generateStudyEvents(assignment, studyPlan);

            // Save all events
            for (const event of events) {
                const savedEvent = await dataService.saveEvent({
                    ...event,
                    start: event.start.toISOString(),
                    end: event.end.toISOString()
                });

                // Add to calendar
                this.calendar.addEvent({
                    ...event,
                    id: savedEvent.id
                });
            }

            return events;
        } catch (error) {
            console.error('Error scheduling study sessions:', error);
            throw error;
        }
    }

    // Generate study events based on the study plan
    generateStudyEvents(assignment, studyPlan) {
        const events = [];
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        const dueDate = new Date(assignment.dueDate);
        const totalDays = Math.ceil((dueDate - startDate) / (1000 * 60 * 60 * 24));

        let currentDate = new Date(startDate);
        let hoursScheduled = 0;
        const totalHours = studyPlan.totalHours;
        const hoursPerSession = 1.5; // Default session length

        while (hoursScheduled < totalHours && currentDate < dueDate) {
            const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
            const availableHours = isWeekend ? assignment.weekendHours : assignment.weekdayHours;

            if (availableHours > 0) {
                // Schedule a study session
                const sessionHours = Math.min(hoursPerSession, totalHours - hoursScheduled, availableHours);

                // Start at 9 AM by default, could be smarter
                const sessionStart = new Date(currentDate);
                sessionStart.setHours(9, 0, 0, 0);

                const sessionEnd = new Date(sessionStart);
                sessionEnd.setHours(sessionStart.getHours() + sessionHours);

                const topicIndex = Math.floor(hoursScheduled / (totalHours / studyPlan.topics.length));
                const currentTopic = studyPlan.topics[topicIndex] || studyPlan.topics[0];

                events.push({
                    title: `Study: ${assignment.title} - ${currentTopic.name}`,
                    start: sessionStart,
                    end: sessionEnd,
                    color: this.getSubjectColor(assignment.subject),
                    subject: assignment.subject,
                    assignmentId: assignment.id,
                    isCompleted: false
                });

                hoursScheduled += sessionHours;
            }

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return events;
    }

    // Get color for subject
    getSubjectColor(subjectId) {
        const subject = config.subjects.find(s => s.id === subjectId);
        return subject ? subject.color : '#6366f1';
    }

    // Update event
    async updateEvent(eventId, updates) {
        try {
            await dataService.updateEvent(eventId, updates);
            this.calendar.updateEvent(eventId, updates);
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    }

    // Delete event
    async deleteEvent(eventId) {
        try {
            await dataService.deleteEvent(eventId);
            this.calendar.deleteEvent(eventId);
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    }
}

// Create a single instance of CalendarService
const calendarService = new CalendarService();
