# Google Custom Search Engine Setup

To make the search functionality work, you need to set up a Google Custom Search Engine and get your CX (Custom Search Engine) ID.

## Steps to Get Your CX ID:

### 1. Create a Custom Search Engine

1. Go to [Google Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Click **"Get Started"** or **"Add"**
3. Fill in the form:
   - **Search engine name**: Spooky AI Search
   - **What to search**: Select **"Search the entire web"**
   - **SafeSearch**: Choose your preference
4. Click **"Create"**

### 2. Get Your CX ID

1. After creating, you'll see your search engine listed
2. Click on the search engine name
3. In the left sidebar, click **"Setup"** or **"Overview"**
4. Look for **"Search engine ID"** or **"CX"**
5. Copy this ID (it looks like: `017576662512468239146:omuauf_lfve`)

### 3. Update Your Code

Open `src/lib/search.ts` and replace this line:

```typescript
const CX_ID = 'YOUR_CX_ID'; // Replace with your actual CX ID
```

With your actual CX ID:

```typescript
const CX_ID = '017576662512468239146:omuauf_lfve'; // Your CX ID
```

### 4. Enable the API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Go to **APIs & Services** → **Library**
4. Search for **"Custom Search API"**
5. Click on it and click **"Enable"**

### 5. Test Your Search

1. Run your app: `npm run dev`
2. Enter a search query
3. Click Search
4. You should see:
   - Search results from Google
   - AI summary from Gemini

## Troubleshooting

### Error: "Search API error"
- Make sure your Google Search API key is correct in `.env`
- Verify the Custom Search API is enabled in Google Cloud Console
- Check that your CX ID is correct

### Error: "Gemini API error"
- Verify your Gemini API key is correct in `.env`
- Make sure the Gemini API is enabled in Google Cloud Console

### No Results
- Check browser console for errors
- Verify your search engine is set to "Search the entire web"
- Make sure both API keys are valid and not expired

## API Limits

**Free Tier:**
- Google Custom Search: 100 queries per day
- Gemini API: Check your quota in Google Cloud Console

**To increase limits:**
- Enable billing in Google Cloud Console
- Upgrade to a paid plan

## Current Configuration

Your `.env` file should have:

```env
VITE_GOOGLE_SEARCH_API_KEY=AIzaSyCjPluRD1Tf64jXF2d4dz1_cK3L8TxLLGQ
VITE_GEMINI_API_KEY=AIzaSyD7SLrYMSU-B7mB8-mk4paOO12MC2Y6fw0
```

## Next Steps

Once you have your CX ID:
1. Update `src/lib/search.ts` with your CX ID
2. Restart your dev server
3. Try searching!

Your search will now:
- ✅ Query Google for web results
- ✅ Use Gemini AI to generate summaries
- ✅ Display beautiful results with your extraordinary UI
- ✅ Save searches to Supabase (coming in next tasks)

Happy searching! 🔍✨
