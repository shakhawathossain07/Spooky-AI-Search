# API Troubleshooting Guide

## Fixed Issues

### ✅ Gemini API 404 Error - FIXED
**Problem:** The Gemini API was returning 404 errors.

**Solution:** Updated to use the correct endpoint:
- Changed from: `v1beta/models/gemini-pro`
- Changed to: `v1/models/gemini-1.5-flash`

### ✅ Better Error Handling
- Added fallback messages if AI summary fails
- Search results still display even if AI summary fails
- Better error messages for users

## Testing Your Search

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Try a simple search:**
   - Type: "What is React?"
   - Press Enter or click Search

3. **Check browser console (F12)** if errors occur

## Common Issues & Solutions

### Issue: "Search failed: Rate limit exceeded"
**Cause:** You've exceeded the free tier limit (100 queries/day)

**Solutions:**
- Wait 24 hours for the limit to reset
- Enable billing in Google Cloud Console
- Use a different API key

### Issue: "No results found"
**Cause:** The search query returned no results

**Solutions:**
- Try different keywords
- Check if your Custom Search Engine is set to "Search the entire web"
- Verify your CX ID is correct

### Issue: "AI summary unavailable"
**Cause:** Gemini API failed but search results still work

**This is OK!** The search results will still display. Possible causes:
- Gemini API quota exceeded
- Temporary API issue
- API key issue

**Solutions:**
- Check your Gemini API key in `.env`
- Verify the API is enabled in Google Cloud Console
- Check your quota: https://console.cloud.google.com/

### Issue: Search button does nothing
**Cause:** API keys not configured or invalid

**Solutions:**
1. Check your `.env` file exists and has:
   ```env
   VITE_GOOGLE_SEARCH_API_KEY=AIzaSyCjPluRD1Tf64jXF2d4dz1_cK3L8TxLLGQ
   VITE_GEMINI_API_KEY=AIzaSyD7SLrYMSU-B7mB8-mk4paOO12MC2Y6fw0
   ```

2. Restart your dev server after changing `.env`

3. Check browser console for specific errors

## Verify Your Setup

### 1. Check Environment Variables
Open browser console and type:
```javascript
console.log(import.meta.env.VITE_GOOGLE_SEARCH_API_KEY ? 'Search API: ✓' : 'Search API: ✗');
console.log(import.meta.env.VITE_GEMINI_API_KEY ? 'Gemini API: ✓' : 'Gemini API: ✗');
```

### 2. Test Google Search API
```bash
curl "https://www.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=17fa9a5ae1f2d4281&q=test"
```

### 3. Test Gemini API
```bash
curl "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

## API Quotas

### Google Custom Search API (Free Tier)
- **Limit:** 100 queries per day
- **Cost:** $5 per 1,000 queries after free tier
- **Check usage:** https://console.cloud.google.com/apis/api/customsearch.googleapis.com/quotas

### Gemini API (Free Tier)
- **Limit:** 60 requests per minute
- **Check usage:** https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas

## Enable APIs

If you get "API not enabled" errors:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Library**
4. Search and enable:
   - **Custom Search API**
   - **Generative Language API** (for Gemini)

## Still Having Issues?

1. **Check browser console** (F12) for detailed error messages
2. **Check network tab** to see API responses
3. **Verify API keys** are correct and not expired
4. **Check API quotas** in Google Cloud Console
5. **Try a different search query**

## Success Indicators

When everything works, you should see:
- ✅ Loading spinner appears
- ✅ AI Summary card displays
- ✅ Search results list appears
- ✅ No errors in console

## Contact

If you're still stuck:
- Check the error message in browser console
- Look for specific API error codes
- Verify all API keys are valid
