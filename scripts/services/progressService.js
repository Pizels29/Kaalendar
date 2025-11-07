// Progress Service for tracking and managing student progress
class ProgressService {
    constructor() {
        this.progress = new Map();
    }

    // Initialize progress tracking for an assignment
    async initializeProgress(assignment) {
        try {
            const progress = {
                assignmentId: assignment.id,
                completedTasks: 0,
                totalTasks: assignment.studyPlan.topics.length,
                studyHoursCompleted: 0,
                studyHoursTarget: assignment.studyPlan.totalHours,
                topicProgress: assignment.studyPlan.topics.map(topic => ({
                    name: topic.name,
                    completed: false,
                    hoursSpent: 0
                })),
                milestones: assignment.studyPlan.milestones.map(milestone => ({
                    id: milestone.id,
                    completed: false,
                    completedAt: null
                }))
            };

            await dataService.saveProgress(assignment.id, progress);
            this.progress.set(assignment.id, progress);
            return progress;
        } catch (error) {
            console.error('Error initializing progress:', error);
            throw error;
        }
    }

    // Update progress for a study session
    async updateStudyProgress(assignmentId, sessionData) {
        try {
            const progress = await this.getProgress(assignmentId);
            if (!progress) throw new Error('Progress not found');

            // Update study hours
            progress.studyHoursCompleted += sessionData.duration;

            // Update topic progress if specified
            if (sessionData.topicName) {
                const topic = progress.topicProgress.find(t => t.name === sessionData.topicName);
                if (topic) {
                    topic.hoursSpent += sessionData.duration;
                    if (topic.hoursSpent >= sessionData.targetHours) {
                        topic.completed = true;
                        progress.completedTasks++;
                    }
                }
            }

            // Check and update milestones
            this.checkMilestones(progress);

            await dataService.saveProgress(assignmentId, progress);
            this.progress.set(assignmentId, progress);

            return progress;
        } catch (error) {
            console.error('Error updating study progress:', error);
            throw error;
        }
    }

    // Mark a task as complete
    async markTaskComplete(assignmentId, taskName) {
        try {
            const progress = await this.getProgress(assignmentId);
            if (!progress) throw new Error('Progress not found');

            const topic = progress.topicProgress.find(t => t.name === taskName);
            if (topic && !topic.completed) {
                topic.completed = true;
                progress.completedTasks++;
                await dataService.saveProgress(assignmentId, progress);
                this.progress.set(assignmentId, progress);
            }

            return progress;
        } catch (error) {
            console.error('Error marking task complete:', error);
            throw error;
        }
    }

    // Check and update milestone status
    checkMilestones(progress) {
        progress.milestones.forEach(milestone => {
            if (!milestone.completed) {
                const relatedTopics = progress.topicProgress.filter(topic =>
                    topic.name.toLowerCase().includes(milestone.id.toLowerCase())
                );
                
                if (relatedTopics.every(topic => topic.completed)) {
                    milestone.completed = true;
                    milestone.completedAt = new Date().toISOString();
                }
            }
        });
    }

    // Calculate overall progress percentage
    calculateOverallProgress(progress) {
        if (!progress) return 0;

        const taskProgress = (progress.completedTasks / progress.totalTasks) * 100;
        const hourProgress = (progress.studyHoursCompleted / progress.studyHoursTarget) * 100;

        return Math.min(Math.round((taskProgress + hourProgress) / 2), 100);
    }

    // Get progress for an assignment
    async getProgress(assignmentId) {
        try {
            if (this.progress.has(assignmentId)) {
                return this.progress.get(assignmentId);
            }

            const progress = await dataService.getProgress(assignmentId);
            if (progress) {
                this.progress.set(assignmentId, progress);
            }
            return progress;
        } catch (error) {
            console.error('Error getting progress:', error);
            return null;
        }
    }

    // Generate progress report
    generateProgressReport(progress) {
        if (!progress) return null;

        const overallProgress = this.calculateOverallProgress(progress);
        const completedMilestones = progress.milestones.filter(m => m.completed).length;
        const totalMilestones = progress.milestones.length;

        return {
            overallProgress,
            completedTasks: progress.completedTasks,
            totalTasks: progress.totalTasks,
            studyHoursCompleted: progress.studyHoursCompleted,
            studyHoursTarget: progress.studyHoursTarget,
            milestonesCompleted: completedMilestones,
            totalMilestones,
            topicBreakdown: progress.topicProgress.map(topic => ({
                name: topic.name,
                completed: topic.completed,
                hoursSpent: topic.hoursSpent
            }))
        };
    }

    // Update progress display in UI
    updateProgressDisplay(assignmentId) {
        const progressTracker = document.getElementById('progressTracker');
        if (!progressTracker) return;

        this.getProgress(assignmentId).then(progress => {
            if (!progress) return;

            const report = this.generateProgressReport(progress);
            
            progressTracker.innerHTML = `
                <div class="progress-overview">
                    <h4>Overall Progress: ${report.overallProgress}%</h4>
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: ${report.overallProgress}%"></div>
                    </div>
                    <p>Tasks Completed: ${report.completedTasks}/${report.totalTasks}</p>
                    <p>Study Hours: ${report.studyHoursCompleted}/${report.studyHoursTarget}</p>
                    <p>Milestones: ${report.milestonesCompleted}/${report.totalMilestones}</p>
                </div>
                <div class="topic-progress">
                    <h4>Topics Progress</h4>
                    ${report.topicBreakdown.map(topic => `
                        <div class="topic-item">
                            <span>${topic.name}</span>
                            <span>${topic.completed ? '✓' : '○'}</span>
                            <span>${topic.hoursSpent} hours</span>
                        </div>
                    `).join('')}
                </div>
            `;
        });
    }
}

// Create a single instance of ProgressService
const progressService = new ProgressService();