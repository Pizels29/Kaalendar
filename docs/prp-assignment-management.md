# PRP: Assignment and Task Management

## Overview
Enable users to edit and delete assignments and their associated study tasks with proper confirmation dialogs to prevent accidental data loss.

## Problem Statement
Currently, users can only create assignments and view them. Once created, there's no way to:
- Edit assignment details (due date, target grade, available hours)
- Delete an assignment that's no longer needed
- Edit individual study session tasks
- Delete specific study sessions
- Regenerate a study plan with updated parameters

This creates a poor user experience where mistakes or changes require clearing all data.

## Goals
1. Allow users to edit existing assignments
2. Allow users to delete assignments with confirmation
3. Allow users to edit individual study session events
4. Allow users to delete individual events with confirmation
5. Provide clear visual feedback for all operations
6. Prevent accidental data loss through confirmation dialogs

## Non-Goals
- Bulk operations (delete all, edit multiple)
- Undo/redo functionality
- Version history of changes
- Assignment archiving (soft delete)

## User Experience

### Assignment Card Actions
Each assignment card will display action buttons:
- **Edit** (pencil icon): Opens assignment in edit mode
- **Delete** (trash icon): Shows confirmation dialog, then deletes

### Edit Assignment Flow
1. User clicks "Edit" on assignment card
2. Modal opens pre-filled with current assignment data
3. User can modify:
   - Title
   - Subject
   - Due Date
   - Target Grade
   - Proficiency Level
   - Available Hours (weekday/weekend)
4. User clicks "Update Assignment"
5. System:
   - Updates assignment data
   - Regenerates study plan with new parameters
   - Deletes old calendar events
   - Creates new calendar events
   - Shows success notification

### Delete Assignment Flow
1. User clicks "Delete" on assignment card
2. Confirmation dialog appears:
   ```
   Delete Assignment?

   This will permanently delete:
   - Math Midterm assignment
   - 12 associated study sessions
   - All progress tracking data

   This action cannot be undone.

   [Cancel] [Delete Assignment]
   ```
3. User confirms deletion
4. System:
   - Deletes assignment from storage
   - Deletes all associated events
   - Deletes progress data
   - Removes from UI
   - Shows success notification

### Calendar Event Actions
Each calendar event will have a context menu (right-click or click event):
- **Edit Event**: Modify time, duration, or mark as complete
- **Delete Event**: Remove this specific study session

### Edit Event Flow
1. User clicks on calendar event
2. Event details modal appears showing:
   - Title (read-only, from topic)
   - Start time (editable)
   - Duration (editable)
   - Completion status (checkbox)
3. User modifies time/duration
4. User clicks "Update Event"
5. System updates event and calendar display

### Delete Event Flow
1. User clicks delete on event
2. Confirmation dialog:
   ```
   Delete Study Session?

   This will remove:
   - MATH: Practice Problems
   - Scheduled for Nov 15, 3:00 PM - 4:30 PM

   [Cancel] [Delete]
   ```
3. User confirms
4. Event is removed from calendar and storage

## Technical Design

### Data Model Changes
No changes to existing data models - all CRUD operations already supported by dataService.

### UI Components

#### Assignment Card with Actions
```html
<div class="assignment-card">
    <div class="assignment-header">
        <h4>Math Midterm</h4>
        <div class="assignment-actions">
            <button class="btn-icon edit-assignment" data-id="123">
                <span>✏️</span>
            </button>
            <button class="btn-icon delete-assignment" data-id="123">
                <span>🗑️</span>
            </button>
        </div>
    </div>
    <!-- rest of card content -->
</div>
```

#### Confirmation Dialog Component
```html
<div class="confirmation-dialog" id="confirmDialog">
    <div class="confirmation-content">
        <h3 id="confirmTitle">Confirm Action</h3>
        <p id="confirmMessage">Are you sure?</p>
        <div class="confirmation-details" id="confirmDetails"></div>
        <div class="confirmation-actions">
            <button class="btn-secondary" id="confirmCancel">Cancel</button>
            <button class="btn-danger" id="confirmAction">Confirm</button>
        </div>
    </div>
</div>
```

#### Event Edit Modal
```html
<div class="modal" id="eventEditModal">
    <div class="modal-content">
        <h2>Edit Study Session</h2>
        <form id="eventEditForm">
            <div class="form-group">
                <label>Event Title</label>
                <input type="text" id="eventTitle" readonly>
            </div>
            <div class="form-group">
                <label>Start Time</label>
                <input type="datetime-local" id="eventStart" required>
            </div>
            <div class="form-group">
                <label>Duration (hours)</label>
                <input type="number" id="eventDuration" min="0.5" max="4" step="0.5" required>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="eventCompleted">
                    Mark as completed
                </label>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" id="cancelEventEdit">Cancel</button>
                <button type="submit" class="btn-primary">Update Event</button>
            </div>
        </form>
    </div>
</div>
```

### New Functions

#### app.js Functions
```javascript
// Edit assignment
async function editAssignment(assignmentId) {
    const assignment = await dataService.getAssignments()
        .then(list => list.find(a => a.id === assignmentId));

    // Pre-fill modal with existing data
    populateAssignmentForm(assignment);

    // Change form submission to update instead of create
    currentEditMode = 'edit';
    currentEditId = assignmentId;

    openAssignmentModal();
}

// Delete assignment
async function deleteAssignment(assignmentId) {
    const assignment = await dataService.getAssignments()
        .then(list => list.find(a => a.id === assignmentId));

    const events = await dataService.getEvents()
        .then(list => list.filter(e => e.assignmentId === assignmentId));

    const confirmed = await showConfirmation({
        title: 'Delete Assignment?',
        message: `This will permanently delete:`,
        details: [
            `- ${assignment.title} assignment`,
            `- ${events.length} associated study sessions`,
            `- All progress tracking data`,
            '',
            'This action cannot be undone.'
        ],
        actionText: 'Delete Assignment',
        actionClass: 'btn-danger'
    });

    if (!confirmed) return;

    // Delete assignment and all related data
    await dataService.deleteAssignment(assignmentId);

    // Delete all associated events
    for (const event of events) {
        await dataService.deleteEvent(event.id);
        await calendarService.deleteEvent(event.id);
    }

    // Delete progress data
    await dataService.deleteProgress(assignmentId);

    // Refresh UI
    await loadAssignments();

    showNotification('✅ Assignment deleted successfully', 'success');
}

// Show confirmation dialog
function showConfirmation({ title, message, details, actionText, actionClass }) {
    return new Promise((resolve) => {
        const dialog = document.getElementById('confirmDialog');

        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;

        const detailsDiv = document.getElementById('confirmDetails');
        detailsDiv.innerHTML = details.map(d => `<p>${d}</p>`).join('');

        const actionBtn = document.getElementById('confirmAction');
        actionBtn.textContent = actionText;
        actionBtn.className = actionClass;

        dialog.style.display = 'flex';

        const handleCancel = () => {
            dialog.style.display = 'none';
            resolve(false);
        };

        const handleConfirm = () => {
            dialog.style.display = 'none';
            resolve(true);
        };

        document.getElementById('confirmCancel').onclick = handleCancel;
        document.getElementById('confirmAction').onclick = handleConfirm;
        dialog.onclick = (e) => {
            if (e.target === dialog) handleCancel();
        };
    });
}

// Edit calendar event
async function editEvent(eventId) {
    const event = await dataService.getEvents()
        .then(list => list.find(e => e.id === eventId));

    // Populate event edit form
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventStart').value = formatDateTimeLocal(event.start);

    const duration = (new Date(event.end) - new Date(event.start)) / (1000 * 60 * 60);
    document.getElementById('eventDuration').value = duration;
    document.getElementById('eventCompleted').checked = event.isCompleted || false;

    // Show modal
    currentEditEventId = eventId;
    document.getElementById('eventEditModal').style.display = 'flex';
}

// Delete calendar event
async function deleteEvent(eventId) {
    const event = await dataService.getEvents()
        .then(list => list.find(e => e.id === eventId));

    const startTime = new Date(event.start).toLocaleString();

    const confirmed = await showConfirmation({
        title: 'Delete Study Session?',
        message: 'This will remove:',
        details: [
            `- ${event.title}`,
            `- Scheduled for ${startTime}`,
            '',
            'This action cannot be undone.'
        ],
        actionText: 'Delete',
        actionClass: 'btn-danger'
    });

    if (!confirmed) return;

    await dataService.deleteEvent(eventId);
    await calendarService.deleteEvent(eventId);

    showNotification('✅ Study session deleted', 'success');
}
```

### Styling

#### Action Buttons
```css
.assignment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.assignment-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-icon {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    transition: background 0.2s;
}

.btn-icon:hover {
    background: rgba(0, 0, 0, 0.05);
}

.btn-danger {
    background: #ef4444;
    color: white;
}

.btn-danger:hover {
    background: #dc2626;
}
```

#### Confirmation Dialog
```css
.confirmation-dialog {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.confirmation-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
}

.confirmation-details {
    background: #fef2f2;
    padding: 1rem;
    border-radius: 4px;
    margin: 1rem 0;
    border-left: 4px solid #ef4444;
}

.confirmation-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
}
```

## Success Metrics
- Users can successfully edit assignments
- Users can delete assignments without errors
- Confirmation dialogs prevent accidental deletions
- All related data (events, progress) is properly cleaned up
- UI updates immediately after operations

## Edge Cases
1. **Editing assignment while study sessions are in progress**: Warn user that regenerating plan will delete existing sessions
2. **Deleting assignment with completed sessions**: Confirm user wants to lose progress data
3. **Editing event to conflict with another event**: Validate and warn about scheduling conflicts
4. **Network/storage errors during delete**: Show error, don't remove from UI until confirmed deleted
5. **Rapid successive deletes**: Disable delete button during operation

## Future Enhancements
- Undo delete (with 5-second grace period)
- Archive instead of delete
- Bulk operations
- Assignment templates
- Duplicate assignment feature
