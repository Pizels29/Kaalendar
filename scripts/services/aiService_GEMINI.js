// AI Service for generating study plans using Google Gemini API
class AIService {
    constructor() {
        this.apiKey = this.loadApiKey();
    }

    loadApiKey() {
        const storedKey = localStorage.getItem(config.storage.geminiApiKey);
        return storedKey || config.gemini.apiKey;
    }

    saveApiKey(apiKey) {
        localStorage.setItem(config.storage.geminiApiKey, apiKey);
        this.apiKey = apiKey;
    }

    hasApiKey() {
        return this.apiKey && this.apiKey.length > 0;
    }

    async generateStudyPlan(assignment) {
        try {
            if (!this.hasApiKey()) {
                console.warn('No Gemini API key. Using fallback.');
                return this.generateSimplifiedPlan(assignment);
            }
            return await this.generateWithGemini(assignment);
        } catch (error) {
            console.error('Gemini error:', error);
            return this.generateSimplifiedPlan(assignment);
        }
    }

    async generateWithGemini(assignment) {
        const prompt = this.createPrompt(assignment);
        const url = config.gemini.endpoint + '?key=' + this.apiKey;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048
                }
            })
        });

        if (!response.ok) {
            throw new Error('Gemini API error');
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        return this.parseGeminiResponse(text, assignment);
    }

    createPrompt(assignment) {
        const days = Math.ceil((new Date(assignment.dueDate) - new Date()) / 86400000);
        return `Create a study plan for ${assignment.subject} ${assignment.title}.
Due: ${days} days, Target: ${assignment.targetGrade}%, Level: ${assignment.proficiencyLevel}/5
Hours: Weekday ${assignment.weekdayHours}h, Weekend ${assignment.weekendHours}h

Return JSON only:
{
  "totalHours": number,
  "topics": [{"name": "str", "description": "str", "hours": num, "priority": 1-5, "completed": false}],
  "suggestedTechniques": ["str"],
  "milestones": [{"id": "str", "description": "str", "targetDate": "YYYY-MM-DD", "completed": false}],
  "studyTips": ["str"]
}`;
    }

    parseGeminiResponse(text, assignment) {
        try {
            let json = text.trim().replace(/```json\n?/g, '').replace(/```/g, '');
            const parsed = JSON.parse(json);
            return {
                totalHours: parsed.totalHours || 10,
                topics: parsed.topics || this.getDefaultTopics(assignment.subject),
                suggestedTechniques: parsed.suggestedTechniques || this.getStudyTechniques(assignment.subject),
                milestones: parsed.milestones || this.generateMilestones(parsed.topics || [], assignment.dueDate),
                studyTips: parsed.studyTips || []
            };
        } catch (e) {
            console.error('Parse error:', e);
            return this.generateSimplifiedPlan(assignment);
        }
    }

    generateSimplifiedPlan(assignment) {
        const topics = this.getSubjectTopics(assignment.subject);
        const days = Math.ceil((new Date(assignment.dueDate) - new Date()) / 86400000);
        const weekdays = Math.floor(days * 5/7);
        const weekends = Math.floor(days * 2/7);
        const totalHours = weekdays * assignment.weekdayHours + weekends * assignment.weekendHours;
        const factor = (6 - assignment.proficiencyLevel) / 5 * (assignment.targetGrade / 100);
        const recommended = Math.ceil(totalHours * factor * 0.7);

        return {
            totalHours: recommended,
            topics: topics.map((t, i) => ({
                name: t,
                description: 'Study ' + t,
                hours: Math.ceil(recommended / topics.length),
                priority: topics.length - i,
                completed: false
            })),
            suggestedTechniques: this.getStudyTechniques(assignment.subject),
            milestones: this.generateMilestones(topics, assignment.dueDate),
            studyTips: this.getStudyTips(assignment.subject)
        };
    }

    getSubjectTopics(subject) {
        const topics = {
            math: ['Fundamentals', 'Practice Problems', 'Formulas', 'Advanced Concepts', 'Mock Tests'],
            science: ['Key Concepts', 'Lab Work', 'Theory', 'Scientific Method', 'Practice'],
            english: ['Reading', 'Writing', 'Grammar', 'Analysis', 'Vocabulary'],
            history: ['Timeline', 'Key Events', 'Analysis', 'Documents', 'Essays'],
            language: ['Vocabulary', 'Grammar', 'Conversation', 'Reading', 'Writing']
        };
        return topics[subject] || ['Topic 1', 'Topic 2', 'Topic 3', 'Review'];
    }

    getDefaultTopics(subject) {
        return this.getSubjectTopics(subject).map((t, i) => ({
            name: t,
            description: 'Study ' + t,
            hours: 2,
            priority: 5 - i,
            completed: false
        }));
    }

    getStudyTechniques(subject) {
        const common = ['Summary notes', 'Pomodoro technique', 'Teach others', 'Active recall'];
        const specific = {
            math: ['Practice problems', 'Formula sheets', 'Step-by-step solutions'],
            science: ['Diagrams', 'Experiments', 'Videos'],
            english: ['Read widely', 'Practice essays', 'Literary analysis'],
            history: ['Timelines', 'Connection maps', 'Summaries'],
            language: ['Listen to natives', 'Daily practice', 'Language apps']
        };
        return [...common, ...(specific[subject] || [])];
    }

    getStudyTips() {
        return [
            'Review previous material first',
            'Take regular breaks',
            'Dedicated study space',
            'Get adequate sleep',
            'Stay hydrated'
        ];
    }

    generateMilestones(topics, dueDate) {
        const days = Math.ceil((new Date(dueDate) - new Date()) / 86400000);
        const list = Array.isArray(topics) ? topics : [];
        const count = Math.min(4, Math.max(2, list.length));
        const milestones = [];

        for (let i = 0; i < count; i++) {
            const d = new Date();
            d.setDate(d.getDate() + Math.floor(days / count * (i + 1)));
            const topic = typeof list[i] === 'string' ? list[i] : list[i]?.name || 'Milestone ' + (i+1);
            milestones.push({
                id: 'milestone-' + (i+1),
                description: 'Complete ' + topic,
                targetDate: d.toISOString().split('T')[0],
                completed: false
            });
        }
        return milestones;
    }
}

const aiService = new AIService();
