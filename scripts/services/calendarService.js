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
                    topicId: event.topicId,
                    type: event.type || 'study',
                    isCompleted: event.isCompleted || false,
                    description: event.description || ''
                };
                this.calendar.addEvent(calendarEvent);
            });
        } catch (error) {
            console.error('Error loading events:', error);
        }
    }

    // Schedule study sessions for an assignment using Gemini-generated study plan
    async scheduleStudySessions(assignment, studyPlan) {
        try {
            console.log('Scheduling study sessions with plan:', studyPlan);

            const events = this.generateDetailedStudyEvents(assignment, studyPlan);

            console.log(`Generated ${events.length} study events`);

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

    // Generate detailed study events based on Gemini's study plan
    generateDetailedStudyEvents(assignment, studyPlan) {
        const events = [];

        // Fix: Properly handle date-only comparison
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        const dueDate = new Date(assignment.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        const totalDays = Math.max(1, Math.ceil((dueDate - startDate) / (1000 * 60 * 60 * 24)));

        // Get topics from study plan with their allocated hours and priority
        const topics = studyPlan.topics || [];
        const totalHours = studyPlan.totalHours || 10;

        // Sort topics by priority (highest first)
        const sortedTopics = [...topics].sort((a, b) => (b.priority || 0) - (a.priority || 0));

        // Create a schedule for each topic
        let currentDate = new Date(startDate);
        let topicIndex = 0;
        let hoursScheduledForTopic = 0;

        while (topicIndex < sortedTopics.length && currentDate < dueDate) {
            const topic = sortedTopics[topicIndex];
            const topicHours = topic.hours || 2;

            const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
            const availableHours = isWeekend ? assignment.weekendHours : assignment.weekdayHours;

            if (availableHours > 0) {
                // Calculate how many hours to schedule for this topic today
                const remainingTopicHours = topicHours - hoursScheduledForTopic;
                const sessionHours = Math.min(
                    1.5, // Max 1.5 hours per session
                    remainingTopicHours,
                    availableHours
                );

                if (sessionHours > 0) {
                    // Schedule session with intelligent time slot
                    const timeSlot = this.findOptimalTimeSlot(currentDate, sessionHours, events, isWeekend);

                    const sessionStart = new Date(currentDate);
                    sessionStart.setHours(timeSlot.hour, timeSlot.minute, 0, 0);

                    const sessionEnd = new Date(sessionStart);
                    const durationMs = sessionHours * 60 * 60 * 1000;
                    sessionEnd.setTime(sessionStart.getTime() + durationMs);

                    // Create detailed event with description
                    const event = {
                        title: `${assignment.subject.toUpperCase()}: ${topic.name}`,
                        description: topic.description || `Study ${topic.name} for ${assignment.title}`,
                        start: sessionStart,
                        end: sessionEnd,
                        color: this.getSubjectColor(assignment.subject),
                        subject: assignment.subject,
                        assignmentId: assignment.id,
                        topicId: topic.name,
                        type: 'study',
                        priority: topic.priority || 3,
                        isCompleted: false
                    };

                    events.push(event);
                    hoursScheduledForTopic += sessionHours;
                }

                // Move to next topic if current one is complete
                if (hoursScheduledForTopic >= topicHours) {
                    topicIndex++;
                    hoursScheduledForTopic = 0;
                }
            }

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Add milestone events
        if (studyPlan.milestones && studyPlan.milestones.length > 0) {
            studyPlan.milestones.forEach(milestone => {
                const milestoneDate = new Date(milestone.targetDate);
                milestoneDate.setHours(18, 0, 0, 0); // Set to 6 PM

                events.push({
                    title: `🎯 Milestone: ${milestone.description}`,
                    description: milestone.description,
                    start: milestoneDate,
                    end: new Date(milestoneDate.getTime() + 30 * 60 * 1000), // 30 min
                    color: '#f59e0b', // Warning/milestone color
                    subject: assignment.subject,
                    assignmentId: assignment.id,
                    type: 'milestone',
                    isCompleted: milestone.completed || false
                });
            });
        }

        // Add final review session before due date
        const reviewDate = new Date(dueDate);
        reviewDate.setDate(reviewDate.getDate() - 1);
        reviewDate.setHours(14, 0, 0, 0); // 2 PM day before

        events.push({
            title: `📝 Final Review: ${assignment.title}`,
            description: 'Final comprehensive review before exam/assignment',
            start: reviewDate,
            end: new Date(reviewDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours
            color: this.getSubjectColor(assignment.subject),
            subject: assignment.subject,
            assignmentId: assignment.id,
            type: 'review',
            priority: 5,
            isCompleted: false
        });

        return events;
    }

    // Find optimal time slot for a study session
    findOptimalTimeSlot(date, durationHours, existingEvents, isWeekend) {
        // Preferred study times
        const preferredSlots = isWeekend
            ? [
                { hour: 9, minute: 0 },   // Morning
                { hour: 14, minute: 0 },  // Afternoon
                { hour: 16, minute: 30 }  // Late afternoon
              ]
            : [
                { hour: 15, minute: 0 },  // After school
                { hour: 17, minute: 0 },  // Early evening
                { hour: 19, minute: 0 }   // Evening
              ];

        // Check each slot for conflicts
        for (const slot of preferredSlots) {
            const slotStart = new Date(date);
            slotStart.setHours(slot.hour, slot.minute, 0, 0);

            const slotEnd = new Date(slotStart);
            slotEnd.setTime(slotStart.getTime() + durationHours * 60 * 60 * 1000);

            // Check if this slot conflicts with existing events
            const hasConflict = existingEvents.some(event => {
                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end);

                return (slotStart < eventEnd && slotEnd > eventStart);
            });

            if (!hasConflict) {
                return slot;
            }
        }

        // If all preferred slots are taken, return first available
        return preferredSlots[0];
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

    // Mark event as complete
    async markEventComplete(eventId) {
        try {
            await this.updateEvent(eventId, { isCompleted: true });

            // Update progress if this is a study event
            const event = await dataService.getEvents().then(events =>
                events.find(e => e.id === eventId)
            );

            if (event && event.type === 'study') {
                await progressService.updateStudyProgress(event.assignmentId, {
                    topicName: event.topicId,
                    duration: (new Date(event.end) - new Date(event.start)) / (1000 * 60 * 60)
                });
            }
        } catch (error) {
            console.error('Error marking event complete:', error);
            throw error;
        }
    }
}

// Create a single instance of CalendarService
const calendarService = new CalendarService();
