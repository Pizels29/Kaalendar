// Configuration settings for the application
const config = {
    // OpenAI API configuration
    openai: {
        apiKey: '', // To be provided by the user
        model: 'gpt-3.5-turbo',
        maxTokens: 1000
    },

    // Calendar configuration
    calendar: {
        views: {
            month: true,
            week: true,
            day: true
        },
        defaultView: 'week',
        firstDay: 1, // Monday
        businessHours: {
            start: '09:00',
            end: '21:00',
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
        }
    },

    // Subject configuration
    subjects: [
        { id: 'math', name: 'Mathematics', color: '#4a90e2' },
        { id: 'science', name: 'Science', color: '#2ecc71' },
        { id: 'english', name: 'English', color: '#e74c3c' },
        { id: 'history', name: 'History', color: '#f39c12' },
        { id: 'language', name: 'Foreign Language', color: '#9b59b6' }
    ],

    // Local storage keys
    storage: {
        assignments: 'studyAssistant_assignments',
        events: 'studyAssistant_events',
        progress: 'studyAssistant_progress'
    }
};