// Configuration settings for the application
const config = {
    // Gemini API configuration
    gemini: {
        apiKey: 'AIzaSyASkunTICEayUrwyarKSgsvRUahJwcSNAM', // Get your API key from https://aistudio.google.com/app/apikey
        model: 'gemini-1.5-flash', // Fast and efficient model
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
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
        progress: 'studyAssistant_progress',
        geminiApiKey: 'studyAssistant_geminiApiKey'
    }
};
