# 📚 Study Mode Setup Guide

## Quick Setup

Study Mode is already configured and ready to use! Just make sure you have the required dependencies.

---

## Prerequisites

### 1. API Keys Required
Study Mode uses the same API keys as Search Mode:

- ✅ **Google Gemini API Key** - For AI topic extraction and summaries
- ✅ **Google Search API Key** - For finding online resources
- ✅ **Google Search Engine ID** - For custom search

These should already be in your `.env` file:
```env
VITE_GEMINI_API_KEY=your_gemini_key
VITE_GOOGLE_SEARCH_API_KEY=your_search_key
VITE_GOOGLE_SEARCH_ENGINE_ID=your_engine_id
```

### 2. Dependencies Installed
Study Mode requires `pdfjs-dist` for PDF processing:

```bash
npm install pdfjs-dist vite-plugin-static-copy
```

This is already installed if you followed the main setup.

---

## How It Works

### PDF Processing
1. **Client-Side Only** - PDFs are processed in your browser
2. **PDF.js Library** - Mozilla's open-source PDF renderer
3. **Text Extraction** - Extracts text from PDF structure
4. **No Upload** - Files never leave your computer

### AI Analysis
1. **Text Sent to Gemini** - Only extracted text (not PDF file)
2. **Topic Extraction** - AI identifies 5-8 key topics
3. **JSON Response** - Returns structured topic list

### Research
1. **Google Search** - Uses your existing search integration
2. **AI Summaries** - Gemini generates explanations
3. **Curated Results** - Top 3 resources per topic

---

## Configuration

### PDF.js Worker Setup

The PDF.js worker is automatically copied to your build output:

**vite.config.ts:**
```typescript
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/pdfjs-dist/build/pdf.worker.min.js',
          dest: ''
        }
      ]
    })
  ],
  // ...
})
```

**StudyMode.tsx:**
```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
```

---

## Troubleshooting

### Issue: "Failed to fetch dynamically imported module"

**Cause:** PDF.js worker file not found

**Solutions:**

1. **Restart dev server:**
   ```bash
   npm run dev
   ```

2. **Check worker file exists:**
   - Dev: Should be served from `/pdf.worker.min.js`
   - Build: Should be in `dist/pdf.worker.min.js`

3. **Verify vite config:**
   - Make sure `vite-plugin-static-copy` is installed
   - Check the plugin configuration in `vite.config.ts`

4. **Clear cache and rebuild:**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

---

### Issue: "PDF processing failed"

**Cause:** PDF might be scanned or corrupted

**Solutions:**

1. **Check PDF has text:**
   - Open PDF in a viewer
   - Try to select/copy text
   - If you can't, it's a scanned image

2. **Try a different PDF:**
   - Use a text-based PDF (not scanned)
   - Ensure PDF is not corrupted

3. **Check file size:**
   - Large PDFs (>50 pages) are truncated
   - Try a smaller PDF

---

### Issue: "No topics extracted"

**Cause:** Content might not be educational or text is unclear

**Solutions:**

1. **Check PDF content:**
   - Should be educational material
   - Should have clear text (not just images)

2. **Try different content:**
   - Lecture slides work best
   - Textbook chapters work well
   - Research papers work well

3. **Check API key:**
   - Verify Gemini API key is valid
   - Check browser console for errors

---

### Issue: "Research fails"

**Cause:** Search API issue or rate limiting

**Solutions:**

1. **Check API keys:**
   - Verify Google Search API key
   - Verify Search Engine ID

2. **Check rate limits:**
   - Google Search has daily limits
   - Wait a few minutes and try again

3. **Research individually:**
   - Instead of "Research All"
   - Click "Research" on each topic one by one

---

## Testing

### Test with Sample PDF

1. **Create a test PDF** or use any educational PDF
2. **Switch to Study Mode**
3. **Upload the PDF**
4. **Verify:**
   - Text extraction completes
   - Topics are identified (5-8 topics)
   - Topics are relevant to content

5. **Test research:**
   - Click "Research" on one topic
   - Verify results appear
   - Check AI summary makes sense
   - Verify links work

---

## Performance Tips

### For Large PDFs
- **Limit pages:** Only first 50 pages processed
- **Split files:** Break large PDFs into smaller ones
- **Optimize PDFs:** Use PDF compression tools

### For Batch Research
- **Use delays:** System adds 1-second delay between searches
- **Monitor rate limits:** Don't exceed API quotas
- **Research selectively:** Only research topics you need

### For Better Results
- **Clear content:** Use well-formatted PDFs
- **Text-based:** Avoid scanned documents
- **Educational:** Works best with academic content
- **English:** Best results with English content

---

## Deployment

### Netlify Deployment

The PDF.js worker is automatically included in the build:

```bash
npm run build
netlify deploy --prod
```

The `vite-plugin-static-copy` plugin ensures `pdf.worker.min.js` is copied to the `dist/` folder.

### Verify Deployment

1. **Check build output:**
   ```
   dist/
   ├── pdf.worker.min.js  ← Should be here
   ├── index.html
   └── assets/
   ```

2. **Test on production:**
   - Visit your deployed site
   - Switch to Study Mode
   - Upload a test PDF
   - Verify it works

---

## API Usage

### Gemini API Calls

**Per PDF Upload:**
- 1 call for topic extraction

**Per Topic Research:**
- 1 call for AI summary
- 1 call for related questions (if enabled)

**Example:** 6 topics = 7 total calls (1 extraction + 6 summaries)

### Google Search API Calls

**Per Topic Research:**
- 1 call for web results
- 1 call for images (if enabled)

**Example:** 6 topics = 6-12 calls depending on features

### Rate Limits

- **Gemini:** 60 requests/minute (free tier)
- **Google Search:** 100 queries/day (free tier)

**Tip:** Research topics individually to stay within limits

---

## Security & Privacy

### Data Privacy
- ✅ **PDFs processed locally** - Never uploaded to server
- ✅ **Only text sent to AI** - Not the full PDF file
- ✅ **No storage** - Nothing saved permanently
- ✅ **Client-side** - All processing in browser

### Security Features
- ✅ **File type validation** - Only PDFs accepted
- ✅ **Size limits** - 50 pages maximum
- ✅ **HTTPS** - All API calls encrypted
- ✅ **No tracking** - No user data collected

---

## Browser Compatibility

### Fully Supported
- ✅ Chrome 90+ (Desktop & Mobile)
- ✅ Edge 90+ (Desktop)
- ✅ Firefox 88+ (Desktop)
- ✅ Safari 14+ (Desktop)

### Limited Support
- ⚠️ Safari iOS - Large PDFs may be slow
- ⚠️ Mobile browsers - Limited by device memory

### Not Supported
- ❌ Internet Explorer
- ❌ Very old browsers (pre-2020)

---

## Development

### Local Development

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Access Study Mode:**
   - Open http://localhost:3000
   - Click "📚 Study Mode" toggle

3. **Test with PDFs:**
   - Upload test PDFs
   - Check browser console for errors
   - Verify worker loads correctly

### Debug Mode

**Check PDF.js worker:**
```javascript
// In browser console
console.log(pdfjsLib.GlobalWorkerOptions.workerSrc);
// Should output: "/pdf.worker.min.js"
```

**Check worker file:**
- Dev: http://localhost:3000/pdf.worker.min.js
- Should download or show JavaScript code

---

## FAQ

### Q: Can I use other file formats?
**A:** Currently only PDF. Word/PowerPoint support planned.

### Q: What's the page limit?
**A:** 50 pages. This can be increased in the code if needed.

### Q: Does it work offline?
**A:** No, requires internet for AI analysis and research.

### Q: Is my PDF uploaded anywhere?
**A:** No, processed entirely in your browser.

### Q: Can I save the study guide?
**A:** Not yet, but this feature is planned.

### Q: Does it work with scanned PDFs?
**A:** No, only text-based PDFs. OCR support planned.

---

## Summary

Study Mode is **ready to use** with:

✅ PDF.js configured for local worker
✅ AI topic extraction with Gemini
✅ Automated research with Google Search
✅ Privacy-focused (client-side processing)
✅ No additional setup required

**Just upload a PDF and start studying!** 📚✨

---

## Need Help?

If you encounter issues:

1. **Check browser console** for errors
2. **Verify API keys** are configured
3. **Restart dev server** if worker fails to load
4. **Try a different PDF** if processing fails
5. **Check the troubleshooting section** above

For more help, see **STUDY_MODE_FEATURE.md** for complete documentation.
