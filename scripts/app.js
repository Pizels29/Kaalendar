// Main application logic
document.addEventListener('DOMContentLoaded', () => {
    console.log('App initializing...');

    // Initialize services
    initializeApp();

    // Set up event listeners
    setupEventListeners();

    console.log('App initialized successfully');
});

// Initialize the application
function initializeApp() {
    try {
        // Initialize calendar
        const calendar = calendarService.initialize('calendar');
        console.log('Calendar initialized:', calendar);

        // Load existing assignments
        loadAssignments();

        // Show empty state message in progress tracker
        const progressTracker = document.getElementById('progressTracker');
        if (progressTracker) {
            progressTracker.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <h3>No Progress Yet</h3>
                    <p>Add an assignment to start tracking your progress</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Add Assignment button
    const addAssignmentBtn = document.getElementById('addAssignmentBtn');
    if (addAssignmentBtn) {
        addAssignmentBtn.addEventListener('click', () => {
            console.log('Add assignment button clicked');
            openAssignmentModal();
        });
    } else {
        console.error('Add assignment button not found');
    }

    // Modal close button
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', () => closeAssignmentModal());
    }

    // Click outside modal to close
    const modal = document.getElementById('assignmentModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAssignmentModal();
            }
        });
    }

    // Form navigation
    const prevButton = document.getElementById('prevStep');
    const nextButton = document.getElementById('nextStep');
    const submitButton = document.getElementById('submitForm');

    if (prevButton) prevButton.addEventListener('click', () => navigateForm('prev'));
    if (nextButton) nextButton.addEventListener('click', () => navigateForm('next'));

    // Form submission
    const assignmentForm = document.getElementById('assignmentForm');
    if (assignmentForm) {
        assignmentForm.addEventListener('submit', handleFormSubmit);
    }

    // Proficiency level display
    const proficiencyInput = document.getElementById('proficiencyLevel');
    const proficiencyDisplay = document.querySelector('.proficiency-display');
    if (proficiencyInput && proficiencyDisplay) {
        proficiencyInput.addEventListener('input', (e) => {
            proficiencyDisplay.textContent = e.target.value;
        });
    }

    // Set minimum date to today
    const dueDateInput = document.getElementById('dueDate');
    if (dueDateInput) {
        const today = new Date().toISOString().split('T')[0];
        dueDateInput.setAttribute('min', today);
    }
}

// Load and display existing assignments
async function loadAssignments() {
    try {
        const assignments = await dataService.getAssignments();
        const assignmentsList = document.getElementById('assignmentsList');

        if (!assignmentsList) return;

        if (assignments.length === 0) {
            assignmentsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📚</div>
                    <h3>No Assignments Yet</h3>
                    <p>Click "Add Assignment" to create your first study plan!</p>
                </div>
            `;
            return;
        }

        assignmentsList.innerHTML = assignments.map(assignment => {
            const progress = calculateProgress(assignment);
            const dueDate = new Date(assignment.dueDate);
            const daysUntil = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
            const subjectColor = getSubjectColor(assignment.subject);

            return `
                <div class="assignment-card" style="border-left-color: ${subjectColor}">
                    <h4>${assignment.title}</h4>
                    <div class="assignment-meta">
                        <span class="meta-item">📖 ${getSubjectName(assignment.subject)}</span>
                        <span class="meta-item">📅 Due ${dueDate.toLocaleDateString()}</span>
                        <span class="meta-item">${daysUntil > 0 ? `⏰ ${daysUntil} days left` : '⚠️ Overdue'}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: ${progress}%"></div>
                    </div>
                    <p style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-muted);">${progress}% complete</p>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading assignments:', error);
    }
}

// Calculate progress for an assignment
function calculateProgress(assignment) {
    if (!assignment.studyPlan) return 0;

    // Calculate based on completed topics
    const completedTopics = assignment.studyPlan.topics.filter(t => t.completed).length;
    const totalTopics = assignment.studyPlan.topics.length;

    return Math.round((completedTopics / totalTopics) * 100) || 0;
}

// Get subject color
function getSubjectColor(subjectId) {
    const subject = config.subjects.find(s => s.id === subjectId);
    return subject ? subject.color : '#6366f1';
}

// Get subject name
function getSubjectName(subjectId) {
    const subject = config.subjects.find(s => s.id === subjectId);
    return subject ? subject.name : subjectId;
}

// Form navigation
function navigateForm(direction) {
    const steps = document.querySelectorAll('.form-step');
    const stepDots = document.querySelectorAll('.step-dot');
    const currentStep = document.querySelector('.form-step.active');
    const currentIndex = Array.from(steps).indexOf(currentStep);

    const prevButton = document.getElementById('prevStep');
    const nextButton = document.getElementById('nextStep');
    const submitButton = document.getElementById('submitForm');

    let newIndex;
    if (direction === 'next') {
        // Validate current step before proceeding
        if (!validateStep(currentIndex + 1)) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        newIndex = currentIndex + 1;
    } else {
        newIndex = currentIndex - 1;
    }

    // Ensure index is within bounds
    if (newIndex < 0 || newIndex >= steps.length) return;

    // Hide all steps and remove active class
    steps.forEach(step => step.classList.remove('active'));

    // Show new step
    steps[newIndex].classList.add('active');

    // Update step dots
    stepDots.forEach((dot, index) => {
        dot.classList.remove('active');
        if (index < newIndex) {
            dot.classList.add('completed');
        } else {
            dot.classList.remove('completed');
        }
    });
    stepDots[newIndex].classList.add('active');

    // Update buttons
    prevButton.disabled = newIndex === 0;
    if (newIndex === steps.length - 1) {
        nextButton.style.display = 'none';
        submitButton.style.display = 'inline-flex';
    } else {
        nextButton.style.display = 'inline-flex';
        submitButton.style.display = 'none';
    }
}

// Validate form step
function validateStep(stepNumber) {
    const step = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
    if (!step) return true;

    const inputs = step.querySelectorAll('input[required], select[required]');
    for (const input of inputs) {
        if (!input.value) {
            input.focus();
            return false;
        }
    }
    return true;
}

// Modal controls
function openAssignmentModal() {
    const modal = document.getElementById('assignmentModal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        console.log('Modal opened');
    } else {
        console.error('Modal not found');
    }
}

function closeAssignmentModal() {
    const modal = document.getElementById('assignmentModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
        resetForm();
        console.log('Modal closed');
    }
}

// Reset form
function resetForm() {
    const form = document.getElementById('assignmentForm');
    if (form) {
        form.reset();
    }

    const steps = document.querySelectorAll('.form-step');
    const stepDots = document.querySelectorAll('.step-dot');

    steps.forEach((step, index) => {
        step.classList.remove('active');
        if (index === 0) {
            step.classList.add('active');
        }
    });

    stepDots.forEach((dot, index) => {
        dot.classList.remove('active', 'completed');
        if (index === 0) {
            dot.classList.add('active');
        }
    });

    const prevButton = document.getElementById('prevStep');
    const nextButton = document.getElementById('nextStep');
    const submitButton = document.getElementById('submitForm');

    if (prevButton) prevButton.disabled = true;
    if (nextButton) nextButton.style.display = 'inline-flex';
    if (submitButton) submitButton.style.display = 'none';
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();

    // Show loading state
    const submitButton = document.getElementById('submitForm');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="loading"></span> Creating...';

    try {
        // Collect form data
        const formData = new FormData(event.target);
        const assignment = {
            title: formData.get('title'),
            subject: formData.get('subject'),
            dueDate: formData.get('dueDate'),
            targetGrade: parseInt(formData.get('targetGrade')),
            proficiencyLevel: parseInt(formData.get('proficiencyLevel')),
            weekdayHours: parseInt(formData.get('weekdayHours')),
            weekendHours: parseInt(formData.get('weekendHours'))
        };

        console.log('Creating assignment:', assignment);

        // Generate study plan
        const studyPlan = aiService.generateSimplifiedPlan(assignment);
        assignment.studyPlan = studyPlan;

        console.log('Study plan generated:', studyPlan);

        // Save assignment
        const savedAssignment = await dataService.saveAssignment(assignment);
        console.log('Assignment saved:', savedAssignment);

        // Initialize progress tracking
        await progressService.initializeProgress(savedAssignment);
        console.log('Progress initialized');

        // Schedule study sessions
        await calendarService.scheduleStudySessions(savedAssignment, studyPlan);
        console.log('Study sessions scheduled');

        // Reload assignments display
        await loadAssignments();

        // Close modal
        closeAssignmentModal();

        // Show success message
        showNotification('✅ Assignment created successfully! Study plan scheduled.', 'success');

    } catch (error) {
        console.error('Error creating assignment:', error);
        showNotification('❌ Error creating assignment. Please try again.', 'error');
    } finally {
        // Restore button
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}
