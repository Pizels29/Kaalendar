# Gemini API Integration Guide

## Get Your API Key

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

## Setup in the App

### Option 1: Add to config.js (Recommended for development)
Open `scripts/config.js` and add your API key:

```javascript
gemini: {
    apiKey: 'YOUR_API_KEY_HERE',  // Replace with your actual key
    model: 'gemini-1.5-flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
},
```

### Option 2: Add via Browser Console (For testing)
1. Open the app in your browser
2. Press F12 to open Developer Console
3. Paste this command:

```javascript
aiService.saveApiKey('YOUR_API_KEY_HERE');
```

4. Refresh the page

## How It Works

The AI service will:
1. Check for API key in localStorage first
2. Fall back to config.js if not found
3. Use simplified algorithm if no API key

When you create an assignment with a valid API key, Gemini will generate:
- **Personalized study topics** based on the subject
- **Smart time allocation** based on your proficiency level
- **Custom study techniques** for the specific subject
- **Milestones** distributed across your timeline
- **Practical study tips** tailored to your needs

## Testing

1. Add your API key using one of the methods above
2. Create a new assignment
3. Check the browser console for logs:
   - "Generating with Gemini API..." = API call started
   - "Parsed Gemini study plan:" = Success!
   - "Falling back to simplified algorithm" = No API key or error

## Features

✅ Intelligent topic breakdown by subject
✅ Proficiency-based time allocation
✅ Subject-specific study techniques
✅ Milestone generation
✅ Automatic fallback to algorithm if API fails
✅ API key stored securely in localStorage

## Example Response

When working, you'll see detailed study plans like:

**Mathematics - Final Exam**
Topics:
- Algebra Fundamentals (3 hours, Priority: 5)
- Calculus Basics (4 hours, Priority: 4)
- Geometry Review (2 hours, Priority: 3)
- Practice Problems (3 hours, Priority: 5)

Study Techniques:
- Solve 5-10 practice problems daily
- Create formula reference sheets
- Work through step-by-step solutions
- Use spaced repetition for formulas

Milestones:
- Complete Algebra Fundamentals by Dec 10
- Finish Calculus Basics by Dec 15
- Review Geometry by Dec 18
- Complete all practice problems by Dec 20
