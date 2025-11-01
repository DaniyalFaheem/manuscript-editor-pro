# Complete Setup Guide for Maximum Grammar Checking Accuracy

This guide will help you configure all grammar checking APIs for the best possible accuracy.

## 🎯 Overview

The application uses a multi-tier API system to ensure 100% uptime and maximum accuracy:

1. **LanguageTool API** (Primary) - Free forever, unlimited
2. **GrammarBot API** (1st Alternative) - Free forever with public endpoint
3. **Textgears API** (2nd Alternative) - Free forever with demo mode
4. **Sapling AI API** (3rd Alternative) - Free forever with demo key
5. **Offline Checker** (Last Resort) - Always available

**All APIs work immediately without any configuration!** This guide is optional for users who want to maximize performance with registered API keys.

---

## 🚀 Quick Start (No Setup Required)

The application is **already fully configured** to work with all APIs using their free public endpoints:

```bash
# No setup needed! Just run:
npm install
npm run dev
```

All APIs will work automatically with:
- LanguageTool: Public API (unlimited, free forever)
- GrammarBot: Public 'free' tier
- Textgears: Public 'demo' mode  
- Sapling AI: Public 'demo-key'

---

## 📈 Optional: Enhanced Configuration (Higher Limits)

If you want higher rate limits and priority processing, follow these steps:

### Step 1: Create `.env` File

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

### Step 2: Configure Each API

#### A. LanguageTool API (Primary)

**Already configured!** Uses free public endpoint with unlimited requests.

```env
# Already set - no changes needed
VITE_LANGUAGETOOL_API_URL=https://api.languagetool.org/v2
```

**Optional**: Run your own LanguageTool server for complete control:

```bash
# Using Docker
docker run --rm -p 8010:8010 erikvl87/languagetool

# Then update .env
VITE_LANGUAGETOOL_API_URL=http://localhost:8010/v2
```

---

#### B. GrammarBot API (1st Alternative)

**Default**: Works with public 'free' endpoint (no registration required)

**For Higher Limits** (Optional):

1. Visit https://www.grammarbot.io/
2. Click "Sign Up" (completely free)
3. Verify your email
4. Copy your API key from the dashboard
5. Add to `.env`:

```env
VITE_GRAMMARBOT_API_KEY=your_grammarbot_key_here
```

**Benefits of registering**:
- ✅ 250 requests/day (vs 100 without key)
- ✅ 1000 characters per request (vs 500)
- ✅ Priority processing
- ✅ Better rate limiting

**Free Forever**: No credit card, no expiration, no paid tier required

---

#### C. Textgears API (2nd Alternative)

**Default**: Works with public 'demo' endpoint (no registration required)

**For Higher Limits** (Optional):

1. Visit https://textgears.com/api
2. Click "Get Free API Key"
3. Enter your email (no credit card needed)
4. Check your email and verify
5. Copy your API key
6. Add to `.env`:

```env
VITE_TEXTGEARS_API_KEY=your_textgears_key_here
```

**Benefits of registering**:
- ✅ 250 requests/day (vs 100 without key)
- ✅ 10,000 characters per request (vs 5,000)
- ✅ Multiple languages
- ✅ Advanced checks

**Free Forever**: No credit card, no expiration, always free

---

#### D. Sapling AI API (3rd Alternative)

**Default**: Works with public 'demo-key' (no registration required)

**For Higher Limits** (Optional):

1. Visit https://sapling.ai/
2. Click "Get Started Free"
3. Sign up with email (no credit card)
4. Go to API Keys section in dashboard
5. Copy your API key
6. Add to `.env`:

```env
VITE_SAPLING_API_KEY=your_sapling_key_here
```

**Benefits of registering**:
- ✅ 5,000 requests/month (vs 100 without key)
- ✅ High accuracy AI-powered checking
- ✅ Advanced grammar and style checks
- ✅ Real-time suggestions

**Free Forever**: No credit card required, generous free tier

---

## 🔧 Complete `.env` Configuration

Here's a complete example with all APIs configured:

```env
# ============================================================================
# PRIMARY API - LanguageTool (Free Forever, Unlimited)
# ============================================================================
VITE_LANGUAGETOOL_API_URL=https://api.languagetool.org/v2
VITE_LANGUAGETOOL_LANGUAGE=en-US

# ============================================================================
# ALTERNATIVE APIS - All Free Forever
# Leave commented to use public/demo endpoints (no registration needed)
# Uncomment and add your keys for higher limits
# ============================================================================

# GrammarBot API (Free: 250 requests/day with key, 100 without)
# Get free key at: https://www.grammarbot.io/
# VITE_GRAMMARBOT_API_KEY=your_grammarbot_key_here

# Textgears API (Free: 250 requests/day with key, 100 without)
# Get free key at: https://textgears.com/api
# VITE_TEXTGEARS_API_KEY=your_textgears_key_here

# Sapling AI API (Free: 5000 requests/month with key, 100 without)
# Get free key at: https://sapling.ai/
# VITE_SAPLING_API_KEY=your_sapling_key_here
```

---

## ✅ Verification

After configuration, verify all APIs are working:

### 1. Start the Application

```bash
npm run dev
```

### 2. Check Console Output

Open browser console (F12) and look for:

```
✓ LanguageTool API succeeded
```

Or if LanguageTool is unavailable:

```
Trying GrammarBot API...
✓ GrammarBot API succeeded with X suggestions
```

### 3. Test with Sample Text

Type text with intentional errors in the editor:

```
This is a test sentence with some erors. I could of written it better.
```

You should see:
- Color-coded underlines in the editor
- Suggestions in the left panel
- Notification showing which API is active (if not LanguageTool)

---

## 📊 API Comparison

| API | Setup | Limit (No Key) | Limit (With Free Key) | Accuracy |
|-----|-------|----------------|---------------------|----------|
| **LanguageTool** | ✅ Pre-configured | ♾️ Unlimited | ♾️ Unlimited | ⭐⭐⭐⭐⭐ |
| **GrammarBot** | ✅ Pre-configured | 100/day | 250/day | ⭐⭐⭐⭐ |
| **Textgears** | ✅ Pre-configured | 100/day | 250/day | ⭐⭐⭐⭐ |
| **Sapling AI** | ✅ Pre-configured | 100/month | 5,000/month | ⭐⭐⭐⭐⭐ |
| **Offline** | ✅ Always available | ♾️ Unlimited | ♾️ Unlimited | ⭐⭐ |

---

## 🎨 Visual Feedback

The application shows which API is being used:

- **No notification**: LanguageTool working (primary API)
- **Blue info alert**: Alternative API active (e.g., "Using GrammarBot API")
- **Orange warning**: Offline checker (all online APIs failed)

---

## 🔒 Security Notes

1. **API Keys are Client-Side**: They are visible in browser (safe for free tiers only)
2. **No Paid Keys**: Never use paid API keys in `.env` files
3. **Git Ignore**: `.env` is automatically ignored by Git
4. **Public Endpoints**: Demo/free endpoints are safe to expose

---

## 🐛 Troubleshooting

### All APIs Showing as Failed

1. **Check Internet Connection**:
   ```bash
   curl https://api.languagetool.org/v2/languages
   ```

2. **Check Browser Console**: Look for CORS or network errors

3. **Verify .env File**: Make sure it's in project root

4. **Restart Dev Server**: After changing `.env`, restart:
   ```bash
   # Stop with Ctrl+C, then:
   npm run dev
   ```

### API Keys Not Working

1. **Verify Key is Correct**: Copy/paste carefully
2. **Check Key Format**: Remove any quotes or spaces
3. **Restart Server**: Always restart after adding keys
4. **Check API Status**: Visit the API's status page

### Rate Limit Exceeded

If you see rate limit errors:

1. **Register for API Keys**: Get higher limits
2. **Use Multiple APIs**: The system automatically rotates
3. **Check Usage**: Review your API dashboard
4. **Wait for Reset**: Limits reset daily/monthly

---

## 🚀 Deployment

### GitHub Pages

Add secrets in repository settings:

```yaml
# .github/workflows/deploy.yml
- name: Build
  run: npm run build
  env:
    VITE_GRAMMARBOT_API_KEY: ${{ secrets.GRAMMARBOT_API_KEY }}
    VITE_TEXTGEARS_API_KEY: ${{ secrets.TEXTGEARS_API_KEY }}
    VITE_SAPLING_API_KEY: ${{ secrets.SAPLING_API_KEY }}
```

### Vercel

Add environment variables in project settings:

```
VITE_GRAMMARBOT_API_KEY=your_key
VITE_TEXTGEARS_API_KEY=your_key
VITE_SAPLING_API_KEY=your_key
```

### Netlify

Add in Site Settings → Build & Deploy → Environment:

```
VITE_GRAMMARBOT_API_KEY=your_key
VITE_TEXTGEARS_API_KEY=your_key
VITE_SAPLING_API_KEY=your_key
```

---

## 📚 Additional Resources

- **LanguageTool**: https://languagetool.org/dev
- **GrammarBot**: https://www.grammarbot.io/quickstart
- **Textgears**: https://textgears.com/api/doc
- **Sapling AI**: https://sapling.ai/docs/api

---

## 💡 Best Practices

1. **Start without API keys**: Use public endpoints first
2. **Register if needed**: Only if you hit rate limits
3. **Monitor usage**: Check API dashboards occasionally
4. **Keep keys private**: Never commit `.env` to Git
5. **Use fallbacks**: The system handles failures automatically

---

## 🎯 Summary

**You don't need to do anything!** The application is already configured with:

✅ LanguageTool API (unlimited, free forever)  
✅ GrammarBot API (public endpoint, free forever)  
✅ Textgears API (demo mode, free forever)  
✅ Sapling AI API (demo key, free forever)  
✅ Offline checker (always available)

**Optional**: Register for API keys to get higher limits, but the free public endpoints work perfectly for most users.

---

**Made with ❤️ for Manuscript Editor Pro**  
**All APIs are free forever - no payment required!**
