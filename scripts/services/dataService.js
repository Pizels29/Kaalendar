// Data Service for managing local storage operations
class DataService {
    constructor() {
        this.initializeStorage();
    }

    // Initialize local storage with default values if needed
    initializeStorage() {
        if (!localStorage.getItem(config.storage.assignments)) {
            localStorage.setItem(config.storage.assignments, JSON.stringify([]));
        }
        if (!localStorage.getItem(config.storage.events)) {
            localStorage.setItem(config.storage.events, JSON.stringify([]));
        }
        if (!localStorage.getItem(config.storage.progress)) {
            localStorage.setItem(config.storage.progress, JSON.stringify({}));
        }
    }

    // Assignment operations
    async saveAssignment(assignment) {
        try {
            const assignments = await this.getAssignments();
            assignment.id = this.generateId();
            assignments.push(assignment);
            localStorage.setItem(config.storage.assignments, JSON.stringify(assignments));
            return assignment;
        } catch (error) {
            console.error('Error saving assignment:', error);
            throw error;
        }
    }

    async getAssignments() {
        try {
            return JSON.parse(localStorage.getItem(config.storage.assignments)) || [];
        } catch (error) {
            console.error('Error getting assignments:', error);
            return [];
        }
    }

    async updateAssignment(assignmentId, updates) {
        try {
            const assignments = await this.getAssignments();
            const index = assignments.findIndex(a => a.id === assignmentId);
            if (index !== -1) {
                assignments[index] = { ...assignments[index], ...updates };
                localStorage.setItem(config.storage.assignments, JSON.stringify(assignments));
                return assignments[index];
            }
            throw new Error('Assignment not found');
        } catch (error) {
            console.error('Error updating assignment:', error);
            throw error;
        }
    }

    // Calendar event operations
    async saveEvent(event) {
        try {
            const events = await this.getEvents();
            event.id = this.generateId();
            events.push(event);
            localStorage.setItem(config.storage.events, JSON.stringify(events));
            return event;
        } catch (error) {
            console.error('Error saving event:', error);
            throw error;
        }
    }

    async getEvents() {
        try {
            return JSON.parse(localStorage.getItem(config.storage.events)) || [];
        } catch (error) {
            console.error('Error getting events:', error);
            return [];
        }
    }

    async updateEvent(eventId, updates) {
        try {
            const events = await this.getEvents();
            const index = events.findIndex(e => e.id === eventId);
            if (index !== -1) {
                events[index] = { ...events[index], ...updates };
                localStorage.setItem(config.storage.events, JSON.stringify(events));
                return events[index];
            }
            throw new Error('Event not found');
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    }

    // Progress tracking operations
    async saveProgress(assignmentId, progress) {
        try {
            const allProgress = await this.getProgress();
            allProgress[assignmentId] = progress;
            localStorage.setItem(config.storage.progress, JSON.stringify(allProgress));
            return progress;
        } catch (error) {
            console.error('Error saving progress:', error);
            throw error;
        }
    }

    async getProgress(assignmentId = null) {
        try {
            const allProgress = JSON.parse(localStorage.getItem(config.storage.progress)) || {};
            return assignmentId ? allProgress[assignmentId] : allProgress;
        } catch (error) {
            console.error('Error getting progress:', error);
            return assignmentId ? null : {};
        }
    }

    // Utility functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// Create a single instance of DataService
const dataService = new DataService();