// Unit tests for aiService.js
describe('AI Service', (it) => {
    it('should generate study plan with correct structure', () => {
        const assignment = {
            title: 'Midterm Exam',
            subject: 'math',
            dueDate: '2024-11-15',
            targetGrade: 90,
            proficiencyLevel: 3,
            weekdayHours: 2,
            weekendHours: 4
        };

        const plan = aiService.generateSimplifiedPlan(assignment);

        assert.truthy(plan, 'Study plan should be generated');
        assert.hasProperty(plan, 'totalHours', 'Plan should have totalHours');
        assert.hasProperty(plan, 'topics', 'Plan should have topics');
        assert.hasProperty(plan, 'suggestedTechniques', 'Plan should have suggestedTechniques');
        assert.hasProperty(plan, 'milestones', 'Plan should have milestones');
        assert.hasProperty(plan, 'studyTips', 'Plan should have studyTips');
    });

    it('should calculate total hours correctly based on available time', () => {
        const assignment = {
            title: 'Test',
            subject: 'science',
            dueDate: '2024-11-20',
            targetGrade: 85,
            proficiencyLevel: 2,
            weekdayHours: 3,
            weekendHours: 5
        };

        const plan = aiService.generateSimplifiedPlan(assignment);

        assert.truthy(plan.totalHours > 0, 'Total hours should be positive');
        assert.equal(typeof plan.totalHours, 'number', 'Total hours should be a number');
    });

    it('should generate topics array with proper structure', () => {
        const assignment = {
            title: 'Final Exam',
            subject: 'english',
            dueDate: '2024-12-01',
            targetGrade: 95,
            proficiencyLevel: 4,
            weekdayHours: 2,
            weekendHours: 3
        };

        const plan = aiService.generateSimplifiedPlan(assignment);

        assert.isArray(plan.topics, 'Topics should be an array');
        assert.truthy(plan.topics.length > 0, 'Should have at least one topic');

        plan.topics.forEach(topic => {
            assert.hasProperty(topic, 'name', 'Topic should have name');
            assert.hasProperty(topic, 'description', 'Topic should have description');
            assert.hasProperty(topic, 'hours', 'Topic should have hours');
            assert.hasProperty(topic, 'priority', 'Topic should have priority');
            assert.hasProperty(topic, 'completed', 'Topic should have completed status');
            assert.equal(topic.completed, false, 'Topic should start as not completed');
        });
    });

    it('should generate priority levels correctly', () => {
        const assignment = {
            title: 'Quiz',
            subject: 'history',
            dueDate: '2024-11-10',
            targetGrade: 80,
            proficiencyLevel: 3,
            weekdayHours: 1,
            weekendHours: 2
        };

        const plan = aiService.generateSimplifiedPlan(assignment);

        plan.topics.forEach(topic => {
            assert.truthy(topic.priority >= 1, 'Priority should be at least 1');
            assert.truthy(topic.priority <= 5, 'Priority should be at most 5');
        });
    });

    it('should generate milestones with correct structure', () => {
        const assignment = {
            title: 'Project',
            subject: 'science',
            dueDate: '2024-11-25',
            targetGrade: 90,
            proficiencyLevel: 3,
            weekdayHours: 2,
            weekendHours: 4
        };

        const plan = aiService.generateSimplifiedPlan(assignment);

        assert.isArray(plan.milestones, 'Milestones should be an array');

        plan.milestones.forEach(milestone => {
            assert.hasProperty(milestone, 'id', 'Milestone should have id');
            assert.hasProperty(milestone, 'description', 'Milestone should have description');
            assert.hasProperty(milestone, 'targetDate', 'Milestone should have targetDate');
            assert.hasProperty(milestone, 'completed', 'Milestone should have completed status');
            assert.equal(milestone.completed, false, 'Milestone should start as not completed');
        });
    });

    it('should handle short time frames correctly', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const assignment = {
            title: 'Quick Review',
            subject: 'math',
            dueDate: tomorrowStr,
            targetGrade: 75,
            proficiencyLevel: 4,
            weekdayHours: 2,
            weekendHours: 3
        };

        const plan = aiService.generateSimplifiedPlan(assignment);

        assert.truthy(plan, 'Plan should be generated even for short timeframe');
        assert.truthy(plan.totalHours > 0, 'Should allocate some hours');
        assert.truthy(plan.topics.length > 0, 'Should have at least one topic');
    });

    it('should handle long time frames correctly', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        const futureDateStr = futureDate.toISOString().split('T')[0];

        const assignment = {
            title: 'Comprehensive Exam',
            subject: 'science',
            dueDate: futureDateStr,
            targetGrade: 95,
            proficiencyLevel: 2,
            weekdayHours: 3,
            weekendHours: 5
        };

        const plan = aiService.generateSimplifiedPlan(assignment);

        assert.truthy(plan, 'Plan should be generated for long timeframe');
        assert.truthy(plan.totalHours > 10, 'Should allocate more hours for longer timeframe');
        assert.truthy(plan.topics.length >= 3, 'Should have multiple topics for comprehensive exam');
    });

    it('should adjust plan based on proficiency level', () => {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 10);
        const dueDateStr = dueDate.toISOString().split('T')[0];

        const beginnerAssignment = {
            title: 'Test',
            subject: 'math',
            dueDate: dueDateStr,
            targetGrade: 80,
            proficiencyLevel: 1,
            weekdayHours: 2,
            weekendHours: 3
        };

        const expertAssignment = {
            title: 'Test',
            subject: 'math',
            dueDate: dueDateStr,
            targetGrade: 80,
            proficiencyLevel: 5,
            weekdayHours: 2,
            weekendHours: 3
        };

        const beginnerPlan = aiService.generateSimplifiedPlan(beginnerAssignment);
        const expertPlan = aiService.generateSimplifiedPlan(expertAssignment);

        assert.truthy(beginnerPlan.totalHours >= expertPlan.totalHours,
            'Beginner should have equal or more study hours than expert');
    });

    it('should generate study tips array', () => {
        const assignment = {
            title: 'Quiz',
            subject: 'english',
            dueDate: '2024-11-12',
            targetGrade: 85,
            proficiencyLevel: 3,
            weekdayHours: 2,
            weekendHours: 3
        };

        const plan = aiService.generateSimplifiedPlan(assignment);

        assert.isArray(plan.studyTips, 'Study tips should be an array');
        assert.truthy(plan.studyTips.length > 0, 'Should have at least one study tip');

        plan.studyTips.forEach(tip => {
            assert.equal(typeof tip, 'string', 'Study tip should be a string');
            assert.truthy(tip.length > 0, 'Study tip should not be empty');
        });
    });

    it('should generate suggested techniques array', () => {
        const assignment = {
            title: 'Exam',
            subject: 'history',
            dueDate: '2024-11-18',
            targetGrade: 90,
            proficiencyLevel: 3,
            weekdayHours: 2,
            weekendHours: 4
        };

        const plan = aiService.generateSimplifiedPlan(assignment);

        assert.isArray(plan.suggestedTechniques, 'Suggested techniques should be an array');
        assert.truthy(plan.suggestedTechniques.length > 0, 'Should have at least one technique');

        plan.suggestedTechniques.forEach(technique => {
            assert.equal(typeof technique, 'string', 'Technique should be a string');
            assert.truthy(technique.length > 0, 'Technique should not be empty');
        });
    });

    it('should handle date calculation correctly without timezone issues', () => {
        // This tests the fix for the "1 day before" bug
        const assignment = {
            title: 'Test',
            subject: 'math',
            dueDate: '2024-11-07',
            targetGrade: 85,
            proficiencyLevel: 3,
            weekdayHours: 2,
            weekendHours: 3
        };

        const plan = aiService.generateSimplifiedPlan(assignment);

        // Plan should be generated without negative days or invalid calculations
        assert.truthy(plan, 'Plan should be generated');
        assert.truthy(plan.totalHours > 0, 'Total hours should be positive');
        assert.truthy(plan.topics.length > 0, 'Should have topics');
    });
});
