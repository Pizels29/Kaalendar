// Unit tests for dataService.js
describe('Data Service', (it) => {
    // Clear localStorage before each test suite
    localStorage.clear();

    it('should save assignment to localStorage', async () => {
        const assignment = {
            title: 'Math Test',
            subject: 'math',
            dueDate: '2024-11-15',
            targetGrade: 90,
            proficiencyLevel: 3
        };

        const saved = await dataService.saveAssignment(assignment);

        assert.truthy(saved, 'Saved assignment should be returned');
        assert.hasProperty(saved, 'id', 'Saved assignment should have an ID');
        assert.equal(saved.title, assignment.title, 'Title should match');
        assert.equal(saved.subject, assignment.subject, 'Subject should match');
    });

    it('should retrieve all assignments', async () => {
        // Save two assignments
        await dataService.saveAssignment({
            title: 'Test 1',
            subject: 'math',
            dueDate: '2024-11-15'
        });

        await dataService.saveAssignment({
            title: 'Test 2',
            subject: 'science',
            dueDate: '2024-11-20'
        });

        const assignments = await dataService.getAssignments();

        assert.isArray(assignments, 'Assignments should be an array');
        assert.truthy(assignments.length >= 2, 'Should have at least 2 assignments');
    });

    it('should update existing assignment', async () => {
        const assignment = await dataService.saveAssignment({
            title: 'Original Title',
            subject: 'math',
            dueDate: '2024-11-15'
        });

        const updated = await dataService.updateAssignment(assignment.id, {
            title: 'Updated Title'
        });

        assert.equal(updated.title, 'Updated Title', 'Title should be updated');
        assert.equal(updated.id, assignment.id, 'ID should remain the same');
    });

    it('should delete assignment', async () => {
        const assignment = await dataService.saveAssignment({
            title: 'To Delete',
            subject: 'math',
            dueDate: '2024-11-15'
        });

        await dataService.deleteAssignment(assignment.id);

        const assignments = await dataService.getAssignments();
        const exists = assignments.some(a => a.id === assignment.id);

        assert.falsy(exists, 'Deleted assignment should not exist');
    });

    it('should save event to localStorage', async () => {
        const event = {
            title: 'Study Session',
            start: '2024-11-10T14:00:00',
            end: '2024-11-10T16:00:00',
            subject: 'math'
        };

        const saved = await dataService.saveEvent(event);

        assert.truthy(saved, 'Saved event should be returned');
        assert.hasProperty(saved, 'id', 'Saved event should have an ID');
        assert.equal(saved.title, event.title, 'Title should match');
    });

    it('should retrieve all events', async () => {
        // Save two events
        await dataService.saveEvent({
            title: 'Event 1',
            start: '2024-11-10T14:00:00',
            end: '2024-11-10T15:00:00'
        });

        await dataService.saveEvent({
            title: 'Event 2',
            start: '2024-11-11T14:00:00',
            end: '2024-11-11T15:00:00'
        });

        const events = await dataService.getEvents();

        assert.isArray(events, 'Events should be an array');
        assert.truthy(events.length >= 2, 'Should have at least 2 events');
    });

    it('should update existing event', async () => {
        const event = await dataService.saveEvent({
            title: 'Original Event',
            start: '2024-11-10T14:00:00',
            end: '2024-11-10T15:00:00'
        });

        const updated = await dataService.updateEvent(event.id, {
            title: 'Updated Event'
        });

        assert.equal(updated.title, 'Updated Event', 'Title should be updated');
        assert.equal(updated.id, event.id, 'ID should remain the same');
    });

    it('should delete event', async () => {
        const event = await dataService.saveEvent({
            title: 'To Delete',
            start: '2024-11-10T14:00:00',
            end: '2024-11-10T15:00:00'
        });

        await dataService.deleteEvent(event.id);

        const events = await dataService.getEvents();
        const exists = events.some(e => e.id === event.id);

        assert.falsy(exists, 'Deleted event should not exist');
    });

    it('should generate unique IDs for assignments', async () => {
        const assignment1 = await dataService.saveAssignment({
            title: 'Test 1',
            subject: 'math',
            dueDate: '2024-11-15'
        });

        const assignment2 = await dataService.saveAssignment({
            title: 'Test 2',
            subject: 'science',
            dueDate: '2024-11-16'
        });

        assert.notEqual(assignment1.id, assignment2.id, 'IDs should be unique');
    });

    it('should generate unique IDs for events', async () => {
        const event1 = await dataService.saveEvent({
            title: 'Event 1',
            start: '2024-11-10T14:00:00',
            end: '2024-11-10T15:00:00'
        });

        const event2 = await dataService.saveEvent({
            title: 'Event 2',
            start: '2024-11-11T14:00:00',
            end: '2024-11-11T15:00:00'
        });

        assert.notEqual(event1.id, event2.id, 'IDs should be unique');
    });

    it('should persist data across service instances', async () => {
        const assignment = await dataService.saveAssignment({
            title: 'Persistence Test',
            subject: 'math',
            dueDate: '2024-11-15'
        });

        // Simulate new service instance by getting fresh data
        const assignments = await dataService.getAssignments();
        const found = assignments.find(a => a.id === assignment.id);

        assert.truthy(found, 'Assignment should persist');
        assert.equal(found.title, assignment.title, 'Data should match');
    });

    it('should handle empty storage gracefully', async () => {
        localStorage.clear();

        const assignments = await dataService.getAssignments();
        const events = await dataService.getEvents();

        assert.isArray(assignments, 'Should return empty array for assignments');
        assert.isArray(events, 'Should return empty array for events');
        assert.equal(assignments.length, 0, 'Assignments should be empty');
        assert.equal(events.length, 0, 'Events should be empty');
    });

    it('should save progress data', async () => {
        const progress = {
            assignmentId: 'test-123',
            completedTopics: ['Topic 1', 'Topic 2'],
            totalHoursStudied: 5
        };

        await dataService.saveProgress('test-123', progress);

        const saved = await dataService.getProgress('test-123');

        assert.truthy(saved, 'Progress should be saved');
        assert.equal(saved.assignmentId, progress.assignmentId, 'Assignment ID should match');
        assert.equal(saved.totalHoursStudied, progress.totalHoursStudied, 'Hours should match');
    });

    it('should retrieve progress by assignment ID', async () => {
        const progress1 = {
            assignmentId: 'assignment-1',
            completedTopics: ['Topic A'],
            totalHoursStudied: 3
        };

        const progress2 = {
            assignmentId: 'assignment-2',
            completedTopics: ['Topic B'],
            totalHoursStudied: 4
        };

        await dataService.saveProgress('assignment-1', progress1);
        await dataService.saveProgress('assignment-2', progress2);

        const retrieved1 = await dataService.getProgress('assignment-1');
        const retrieved2 = await dataService.getProgress('assignment-2');

        assert.equal(retrieved1.assignmentId, 'assignment-1', 'Should get correct progress 1');
        assert.equal(retrieved2.assignmentId, 'assignment-2', 'Should get correct progress 2');
        assert.notEqual(retrieved1.totalHoursStudied, retrieved2.totalHoursStudied, 'Progress should be separate');
    });
});
