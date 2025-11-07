# Student Study Assistant

An AI-powered web application that helps high school students create personalized study plans and manage their study schedule.

## Features

- **AI-Powered Study Plans** - Uses Google Gemini AI to generate personalized study plans
- **Smart Scheduling** - Automatically schedules study sessions in a calendar
- **Progress Tracking** - Monitor completion of topics and milestones
- **Beautiful UI** - Modern, responsive design with smooth animations
- **Multi-Step Form** - Easy-to-use wizard for adding assignments

## Quick Start

1. Open `index_FIXED.html` in a modern browser
2. Click "Add Assignment"
3. Fill out the 3-step form
4. See your personalized study plan!

## Setup Gemini AI (Recommended)

For intelligent, personalized study plans:

1. Get API key from https://aistudio.google.com/app/apikey
2. Open `scripts/config.js`
3. Add your key: `apiKey: 'YOUR_KEY_HERE'`
4. Refresh the app

See [SETUP_GEMINI.txt](SETUP_GEMINI.txt) for detailed instructions.

## Files

- `index_FIXED.html` - Main application (USE THIS)
- `index.html` - Original (needs manual updates)
- `scripts/app.js` - Main application logic ✅ FIXED
- `scripts/services/aiService.js` - Gemini AI integration ✅ NEW
- `scripts/config.js` - Configuration ✅ UPDATED
- `styles/main.css` - Modern UI styling ✅ REBUILT
- `styles/calendar.css` - Calendar styling ✅ REBUILT

## What's Working

✅ Modal opens/closes properly
✅ Multi-step form with validation
✅ Step indicator dots
✅ AI study plan generation (Gemini + fallback)
✅ Progress tracking
✅ Data persistence (LocalStorage)
✅ Beautiful, responsive UI

## What Needs Setup

⚠️ Calendar component - needs testing
⚠️ Gemini API key - for AI features

## Browser Support

- Chrome (recommended)
- Firefox
- Edge
- Safari

## Technologies

- Vanilla JavaScript (ES6+)
- CSS3 with Custom Properties
- LocalStorage API
- Google Gemini AI API
- Custom Calendar Component

## Development

No build process needed - just open HTML file!

For development:
```bash
python -m http.server 8080
```

Then visit http://localhost:8080/index_FIXED.html

## Troubleshooting

**Modal not opening?**
- Use `index_FIXED.html` instead of `index.html`
- Check browser console for errors

**Calendar not showing?**
- Check `scripts/components/Calendar.js` exists
- Look for JavaScript errors in console

**Study plans too simple?**
- Add Gemini API key (see SETUP_GEMINI.txt)

## License

Educational project - free to use and modify
