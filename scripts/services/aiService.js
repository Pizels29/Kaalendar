// AI Service for generating study plans and recommendations
class AIService {
    constructor() {
        this.apiKey = config.openai.apiKey;
        this.model = config.openai.model;
        this.maxTokens = config.openai.maxTokens;
    }

    // Generate a study plan based on assignment details
    async generateStudyPlan(assignment) {
        try {
            // For MVP, we'll use a simplified algorithm instead of AI
            return this.generateSimplifiedPlan(assignment);
        } catch (error) {
            console.error('Error generating study plan:', error);
            throw error;
        }
    }

    // Simplified plan generation for MVP
    generateSimplifiedPlan(assignment) {
        const { subject, dueDate, targetGrade, proficiencyLevel, weekdayHours, weekendHours } = assignment;
        
        // Calculate days until due date
        const today = new Date();
        const due = new Date(dueDate);
        const daysUntilDue = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

        // Calculate total available study hours
        const totalWeekdays = Math.floor(daysUntilDue * 5/7);
        const totalWeekends = Math.floor(daysUntilDue * 2/7);
        const totalAvailableHours = (totalWeekdays * weekdayHours) + (totalWeekends * weekendHours);

        // Adjust study hours based on proficiency and target grade
        const proficiencyFactor = (6 - proficiencyLevel) / 5; // 1 = least study time, 5 = most study time
        const targetFactor = targetGrade / 100; // Higher target = more study time
        const recommendedHours = Math.ceil(totalAvailableHours * proficiencyFactor * targetFactor);

        // Generate topics based on subject
        const topics = this.getSubjectTopics(subject);

        // Create study blocks
        const studyPlan = {
            totalHours: recommendedHours,
            topics: topics.map(topic => ({
                name: topic,
                hours: Math.ceil(recommendedHours / topics.length),
                completed: false
            })),
            suggestedTechniques: this.getStudyTechniques(subject),
            milestones: this.generateMilestones(topics, dueDate)
        };

        return studyPlan;
    }

    // Helper method to get subject topics
    getSubjectTopics(subject) {
        const topicsBySubject = {
            math: ['Review Fundamentals', 'Practice Problems', 'Formula Application', 'Problem-Solving Strategies'],
            science: ['Key Concepts', 'Experiments/Lab Work', 'Theory Application', 'Scientific Method'],
            english: ['Reading Comprehension', 'Writing Practice', 'Grammar Review', 'Literary Analysis'],
            history: ['Timeline Review', 'Key Events', 'Historical Analysis', 'Document Study'],
            language: ['Vocabulary', 'Grammar Rules', 'Conversation Practice', 'Reading/Writing']
        };

        return topicsBySubject[subject] || ['Topic 1', 'Topic 2', 'Topic 3', 'Topic 4'];
    }

    // Helper method to get study techniques
    getStudyTechniques(subject) {
        const commonTechniques = [
            'Create summary notes',
            'Use flashcards',
            'Practice past questions',
            'Teach the concept to others'
        ];

        const subjectTechniques = {
            math: ['Solve example problems', 'Create formula sheets', 'Practice step-by-step solutions'],
            science: ['Draw diagrams', 'Create mind maps', 'Conduct experiments'],
            english: ['Read aloud', 'Write summaries', 'Create character maps'],
            history: ['Create timelines', 'Make connection maps', 'Write brief essays'],
            language: ['Listen to native speakers', 'Practice speaking', 'Write journal entries']
        };

        return [...commonTechniques, ...(subjectTechniques[subject] || [])];
    }

    // Helper method to generate milestones
    generateMilestones(topics, dueDate) {
        const due = new Date(dueDate);
        const totalDays = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24));
        const milestones = [];

        topics.forEach((topic, index) => {
            const daysToAdd = Math.floor((totalDays / topics.length) * (index + 1));
            const date = new Date();
            date.setDate(date.getDate() + daysToAdd);

            milestones.push({
                id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                description: `Complete ${topic}`,
                targetDate: date.toISOString().split('T')[0],
                completed: false
            });
        });

        return milestones;
    }
}

// Create a single instance of AIService
const aiService = new AIService();