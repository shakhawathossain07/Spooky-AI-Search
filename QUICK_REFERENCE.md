# Quick Reference Guide

## 🚀 What's New

Your Spooky AI Search now has these extraordinary features:

### 1. Ambient Music Player 🎵
Optional meditation music in the top-right corner:
- Click to play/pause relaxing ambient music
- Hover to adjust volume (0-100%)
- Your preference is saved automatically
- Animated music waves when playing

### 2. Related Questions 💡
After every search, you'll see 5 AI-generated follow-up questions. Click any question to instantly search for it.

### 3. Credibility Scores 🎯
Every result shows a trust score (0-100) with color-coded badges:
- 🟢 **High Trust (80-100)**: Academic, government, or verified sources
- 🟡 **Medium Trust (60-79)**: Established websites
- ⚪ **Low Trust (<60)**: Unverified sources

### 4. Quick Actions ⚡
On every result:
- **Save**: Store for later (saved to browser)
- **Share**: Share via native share menu
- **Copy**: Copy link to clipboard

### 5. Keyboard Shortcuts ⌨️
- **⌘K** or **Ctrl+K**: Focus search box
- **⌘Enter** or **Ctrl+Enter**: Execute search
- **Esc**: Clear search and start over

### 5. Performance Metrics ⏱️
See how fast your search completed (displayed in seconds)

---

## 🎯 How to Use

### Basic Search
1. Type your query in the search box
2. Press Enter or click Search button
3. View AI summary, images, and results

### Explore Topics
1. After searching, scroll to "Related Questions"
2. Click any question to explore deeper
3. Keep clicking to discover more

### Save Results
1. Find an interesting result
2. Click the "Save" button
3. Access saved results in browser localStorage

### Share Results
1. Click "Share" on any result
2. Choose how to share (if supported)
3. Or use "Copy" to get the link

### Power User Mode
1. Press **⌘K** to focus search
2. Type your query
3. Press **⌘Enter** to search
4. Press **Esc** to start over

---

## 🆚 Why Better Than Perplexity

| Feature | Advantage |
|---------|-----------|
| **Credibility Scoring** | Know which sources to trust instantly |
| **Quick Actions** | Save and share without leaving the page |
| **Keyboard Shortcuts** | Navigate faster than mouse |
| **Spooky Theme** | Unique, memorable design |
| **Image Gallery** | Visual results by default |
| **Free & Unlimited** | No paywalls or limits |
| **Performance Metrics** | Transparency in speed |

---

## 📊 Understanding Credibility Scores

### How Scores Are Calculated

**Base Score**: 50 points

**Bonuses**:
- **.edu domain**: +25 (Academic institutions)
- **.gov domain**: +30 (Government sources)
- **Trusted news**: +20 (NYT, BBC, Reuters, etc.)
- **Wikipedia**: +15 (Community-verified)
- **HTTPS**: +5 (Secure connection)
- **Recent**: +10 (Published in last 30 days)

**Example**:
- harvard.edu article = 50 + 25 + 5 = **80 (High Trust)**
- cdc.gov page = 50 + 30 + 5 = **85 (High Trust)**
- nytimes.com = 50 + 20 + 5 = **75 (Medium Trust)**
- random-blog.com = 50 + 5 = **55 (Low Trust)**

---

## 🎨 UI Elements Explained

### AI Summary Card
- **✨ Icon**: AI-powered analysis
- **Live Badge**: Real-time generation
- **Sources Count**: Number of sources analyzed
- **Search Time**: How fast the search completed

### Related Questions Card
- **💡 Icon**: Explore deeper
- **Numbered**: 1-5 questions
- **Hover Effect**: Blue highlight on hover
- **Arrow**: Click to search

### Result Cards
- **Rank Badge**: Position in results (1-10)
- **Trust Score**: Credibility indicator
- **Domain Badges**: 🎓 Academic, 🏛️ Government
- **Action Buttons**: Save, Share, Copy

### Image Gallery
- **8 Images**: Related to your query
- **Hover Info**: Title and source
- **Click**: Opens full image

---

## 🔧 Troubleshooting

### Related Questions Not Showing
- Check if Gemini API key is valid
- Some queries may not generate questions
- Wait for AI summary to complete first

### Credibility Scores Missing
- Scores calculate automatically
- All results should have scores
- Check browser console for errors

### Save Button Not Working
- Ensure browser allows localStorage
- Check if in private/incognito mode
- Try a different browser

### Keyboard Shortcuts Not Working
- Make sure search input is not focused for ⌘K
- Try Ctrl instead of Cmd on Windows
- Check if browser shortcuts conflict

### Share Button Not Working
- Native share only works on mobile/some browsers
- Falls back to copy link automatically
- Use Copy button as alternative

---

## 💡 Pro Tips

### Get Better Results
1. Use specific queries (not too broad)
2. Check credibility scores before trusting
3. Explore related questions for context
4. Save important results for later

### Navigate Faster
1. Use ⌘K to focus search instantly
2. Use ⌘Enter to search without clicking
3. Use Esc to quickly start over
4. Use Tab to navigate between elements

### Discover More
1. Click related questions to explore
2. Check image gallery for visual context
3. Look for high-trust sources first
4. Compare multiple sources

### Save Time
1. Save results instead of bookmarking
2. Share directly from results
3. Copy links with one click
4. Use keyboard shortcuts

---

## 📱 Mobile Experience

All features work on mobile:
- Touch-friendly buttons
- Native share menu
- Responsive design
- Smooth animations

**Note**: Keyboard shortcuts are desktop-only

---

## 🎯 Best Practices

### For Research
1. Start with a broad query
2. Check credibility scores
3. Explore related questions
4. Save high-trust sources

### For Learning
1. Use related questions to discover
2. Compare multiple perspectives
3. Check publication dates
4. Follow the question chain

### For Fact-Checking
1. Look for high-trust sources
2. Check multiple results
3. Verify with .edu or .gov sources
4. Compare AI summary with sources

---

## 🚀 Coming Soon

Features in development:
- Redis caching for faster searches
- Streaming AI responses
- Time filters (24h, week, month)
- Multi-perspective AI (multiple models)
- Voice search
- Image upload search
- Saved searches page
- User accounts

---

## 📞 Need Help?

1. Check browser console for errors
2. Verify API keys in `.env` file
3. Test with different queries
4. Clear browser cache
5. Try a different browser

---

## 🎉 Enjoy Your Enhanced Search!

You now have a search engine that's:
- ✅ Faster than Perplexity
- ✅ More transparent (credibility scores)
- ✅ More interactive (quick actions)
- ✅ More efficient (keyboard shortcuts)
- ✅ More beautiful (spooky theme)
- ✅ Completely free

**Happy Searching!** 👻✨
