# AI Chatbot Setup Guide

## Get Free Google Gemini API Key

### Step 1: Go to Google AI Studio
Visit: https://aistudio.google.com/app/apikey

### Step 2: Sign in with Google Account
- Use your existing Google account
- No credit card required!

### Step 3: Create API Key
1. Click "Get API Key" or "Create API Key"
2. Select "Create API key in new project" (or use existing project)
3. Copy the API key (starts with `AIza...`)

### Step 4: Add to Your Project
1. Open `backend/.env` file
2. Find this line:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Replace with your actual key:
   ```
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
4. Save the file

### Step 5: Restart Backend Server
Kill the current server and run:
```bash
cd backend
node server.js
```

### Step 6: Test the Chatbot
1. Refresh your browser
2. Open the chatbot
3. Toggle the "AI" switch ON (important!)
4. Ask any question!

## Free Tier Limits
- 15 requests per minute
- 1,500 requests per day
- 1 million requests per month
- Completely FREE!

## Troubleshooting

### Chatbot still gives basic responses
- Make sure the AI toggle is ON in the chatbot UI
- Check that GEMINI_API_KEY is set correctly in backend/.env
- Restart the backend server after changing .env

### "API key not valid" error
- Double-check you copied the full API key
- Make sure there are no extra spaces
- Try generating a new API key

### Rate limit errors
- You've exceeded the free tier limits
- Wait a few minutes and try again
- Consider upgrading to paid tier if needed

## Alternative: Use OpenAI Instead
If you prefer OpenAI (paid):
1. Change `AI_PROVIDER=openai` in backend/.env
2. Add your OpenAI API key to `OPENAI_API_KEY`
3. Restart server

## Current Configuration
- Provider: Google Gemini (free)
- Model: gemini-1.5-flash (fast and free)
- Fallback: Local rule-based responses
