# 🔧 Study Mode Troubleshooting

## Quick Start

Study Mode allows you to upload PDF documents and get AI-powered topic extraction and research assistance.

### Requirements
- A valid `VITE_GEMINI_API_KEY` in your `.env` file
- A valid `VITE_GOOGLE_SEARCH_API_KEY` for research functionality
- Text-based PDFs (not scanned images)

---

## Common Issues & Solutions

### Issue 1: "Gemini API key not configured"

**Solution:**
1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to your `.env` file:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
3. Restart the dev server: `npm run dev`

---

### Issue 2: "PDF appears to be empty"

**Cause:** The PDF is likely a scanned image without embedded text.

**Solutions:**
1. Use text-based PDFs (digital documents, not scans)
2. Test by trying to select/copy text in a PDF viewer
3. If scanned, use OCR software first (Adobe Acrobat, online tools)

**Best PDF types:**
- ✅ Digital lecture slides (PowerPoint → PDF)
- ✅ Textbook chapters (digital)
- ✅ Research papers (digital)
- ❌ Scanned documents
- ❌ Image-only PDFs

---

### Issue 3: "Could not extract topics"

**Causes:**
- Content is too short (< 100 characters)
- Content is not educational
- API response parsing failed

**Solutions:**
1. Use documents with clear educational content
2. Ensure PDF has at least 2-3 pages of text
3. Try a different document

---

### Issue 4: "Gemini API error"

**Causes:**
- Invalid API key
- Rate limit exceeded (60 requests/minute free tier)
- Network issues

**Solutions:**
1. Verify API key at [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Wait a few minutes if rate limited
3. Check network connection
4. Generate a new API key if needed

---

### Issue 5: "Research fails" for topics

**Causes:**
- Missing Google Search API key
- Rate limit exceeded (100 queries/day free tier)
- Invalid Search Engine ID

**Solutions:**
1. Verify `.env` has both keys:
   ```env
   VITE_GOOGLE_SEARCH_API_KEY=your_key
   ```
2. Research topics one at a time to avoid rate limits
3. Test regular Search Mode first to verify API works

---

### Issue 6: PDF.js Worker Errors

**Cause:** PDF.js worker failed to load

**Solution:** The component now uses CDN-hosted worker for reliability. If issues persist:
1. Clear browser cache
2. Refresh the page
3. Check browser console for specific errors

---

## Environment Variables

### Required for Study Mode
```env
# Gemini AI (Required)
VITE_GEMINI_API_KEY=AIza...

# Google Search (Required for Research)
VITE_GOOGLE_SEARCH_API_KEY=AIza...
```

### How to Get API Keys

**Gemini API Key:**
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy to `.env`

**Google Search API:**
1. Go to https://console.cloud.google.com
2. Enable "Custom Search API"
3. Create credentials → API Key
4. Copy to `.env`

---

## Debug Checklist

### Before Upload
- [ ] Dev server running (`npm run dev`)
- [ ] No console errors on page load
- [ ] API keys in `.env` file
- [ ] Server restarted after `.env` changes

### During Upload
- [ ] File is a real PDF (not renamed image)
- [ ] PDF has selectable text
- [ ] PDF is under 50 pages / 50MB
- [ ] Processing status shows progress

### After Upload
- [ ] Topics displayed (5-8 topics)
- [ ] Topics are relevant to content
- [ ] "Research" buttons work

### During Research
- [ ] Loading indicator appears
- [ ] Results appear after 3-5 seconds
- [ ] AI summary displays
- [ ] Resource links work

---

## Browser Console Commands

```javascript
// Check API keys are configured
console.log('Gemini:', !!import.meta.env.VITE_GEMINI_API_KEY);
console.log('Search:', !!import.meta.env.VITE_GOOGLE_SEARCH_API_KEY);
```

---

## Architecture

Study Mode uses:
1. **PDF.js** (v5.x) - PDF text extraction with CDN-hosted worker
2. **Gemini 1.5 Flash** - AI topic extraction
3. **Google Custom Search** - Topic research
4. **Dynamic imports** - Lazy loading for better performance

---

## Still Having Issues?

1. **Check browser console** for specific error messages
2. **Test Search Mode first** to verify API keys work
3. **Try a sample PDF** to rule out document issues
4. **Restart dev server** after any `.env` changes

Most issues are solved by:
- ✅ Restarting dev server
- ✅ Checking API keys
- ✅ Using text-based PDFs
