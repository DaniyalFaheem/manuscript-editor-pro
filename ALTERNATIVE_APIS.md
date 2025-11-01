# Alternative Grammar Checking APIs

## Overview

When LanguageTool API is unavailable, the application automatically tries alternative grammar checking APIs before falling back to the offline checker. This ensures maximum accuracy even when the primary API is down.

## Fallback Order

1. **LanguageTool API** (Primary) - Free, unlimited, no API key required
2. **GrammarBot API** (1st Alternative) - Free tier available
3. **Textgears API** (2nd Alternative) - Free tier with registration
4. **Sapling AI API** (3rd Alternative) - Free tier available
5. **Offline Checker** (Last Resort) - Limited accuracy, no internet required

## Configuration

### Method 1: Using Free Tiers (No API Key Required)

All alternative APIs have free tiers that work without API keys:

- **GrammarBot**: Uses 'free' tier automatically
- **Textgears**: Uses 'demo' mode automatically
- **Sapling AI**: Uses 'demo-key' automatically

**No configuration needed!** The app will automatically try these in order.

### Method 2: Using API Keys (Recommended for Better Limits)

For higher rate limits and better reliability, register for free API keys:

#### 1. GrammarBot API

1. Visit: https://www.grammarbot.io/
2. Sign up for a free account
3. Get your API key
4. Add to `.env` file:
   ```
   VITE_GRAMMARBOT_API_KEY=your_api_key_here
   ```

**Free Tier Limits:**
- 100 requests per day
- 500 characters per request
- No credit card required

#### 2. Textgears API

1. Visit: https://textgears.com/api
2. Register for free account
3. Get your API key from dashboard
4. Add to `.env` file:
   ```
   VITE_TEXTGEARS_API_KEY=your_api_key_here
   ```

**Free Tier Limits:**
- 100 requests per day
- 5000 characters per request
- No credit card required

#### 3. Sapling AI API

1. Visit: https://sapling.ai/
2. Sign up for developer account
3. Get API key from dashboard
4. Add to `.env` file:
   ```
   VITE_SAPLING_API_KEY=your_api_key_here
   ```

**Free Tier Limits:**
- 2000 requests per month
- High accuracy
- No credit card required

### Environment Variables Setup

Create or update `.env` file in the project root:

```env
# Primary API (optional - defaults to public endpoint)
VITE_LANGUAGETOOL_API_URL=https://api.languagetool.org/v2

# Alternative APIs (optional - uses free tiers if not set)
VITE_GRAMMARBOT_API_KEY=your_grammarbot_key
VITE_TEXTGEARS_API_KEY=your_textgears_key
VITE_SAPLING_API_KEY=your_sapling_key
```

## How It Works

### Automatic Failover

```typescript
1. Try LanguageTool API (3 retries with exponential backoff)
   ↓ If fails
2. Try GrammarBot API
   ↓ If fails
3. Try Textgears API
   ↓ If fails
4. Try Sapling AI API
   ↓ If all fail
5. Use Offline Checker (last resort)
```

### Visual Feedback

The application shows different notifications based on which API is being used:

- **Blue Alert (Info)**: Using alternative API (GrammarBot, Textgears, or Sapling)
  - Message shows which alternative API is active
  - Indicates that accuracy is maintained
  
- **Orange Alert (Warning)**: Using offline checker
  - Shows when all online APIs are unavailable
  - Suggests configuring API keys

### User Experience

1. **Seamless Switching**: Users don't need to do anything - the app automatically tries alternatives
2. **Transparent**: Notification shows which API is being used
3. **Accurate**: Alternative APIs maintain high accuracy
4. **Reliable**: Multiple fallbacks ensure service continuity

## API Comparison

| API | Free Tier | Accuracy | Speed | Limits |
|-----|-----------|----------|-------|--------|
| **LanguageTool** | ✅ Unlimited | ⭐⭐⭐⭐⭐ | Fast | None |
| **GrammarBot** | ✅ 100/day | ⭐⭐⭐⭐ | Fast | 500 chars |
| **Textgears** | ✅ 100/day | ⭐⭐⭐⭐ | Medium | 5000 chars |
| **Sapling AI** | ✅ 2000/month | ⭐⭐⭐⭐⭐ | Fast | Very Good |
| **Offline** | ✅ Unlimited | ⭐⭐ | Instant | None |

## Troubleshooting

### All APIs Failing

If all APIs are failing:

1. **Check Internet Connection**
   - Verify you're connected to the internet
   - Try accessing https://languagetool.org

2. **Check API Status**
   - LanguageTool: https://languagetool.org/status
   - GrammarBot: https://status.grammarbot.io
   - Textgears: https://textgears.com

3. **Configure API Keys**
   - Set up alternative API keys in `.env`
   - Restart the development server

4. **Check Rate Limits**
   - Free tiers have daily/monthly limits
   - Consider upgrading to paid tiers if needed

### API Key Not Working

1. Verify the API key is correct
2. Check if key has expired
3. Ensure `.env` file is in project root
4. Restart dev server after adding keys
5. Check console for error messages

### Offline Checker Active

If you're always seeing the offline checker:

1. Check if LanguageTool API is accessible: `curl https://api.languagetool.org/v2/languages`
2. Configure alternative API keys
3. Check firewall/proxy settings
4. Try different network

## Benefits of Alternative APIs

### 1. High Availability
- Multiple fallbacks ensure continuous service
- No downtime even if primary API is unavailable

### 2. Geographic Redundancy
- Different APIs hosted in different regions
- Better latency for users worldwide

### 3. Cost Effective
- All alternatives have generous free tiers
- No need for paid subscriptions

### 4. Maintained Accuracy
- Alternative APIs provide professional-grade checking
- Much better than offline fallback

### 5. Flexibility
- Choose which APIs to enable
- Configure based on your needs

## Development

### Testing Fallback

To test the fallback mechanism:

1. **Disable LanguageTool**:
   ```env
   VITE_LANGUAGETOOL_API_URL=https://invalid-url.com
   ```

2. **Watch Console**:
   ```
   LanguageTool API failed, trying alternative APIs...
   Trying GrammarBot API...
   ✓ GrammarBot API succeeded with 5 suggestions
   ```

3. **Check Notification**:
   - Should show blue alert with alternative API name

### Adding New Alternative APIs

To add a new alternative API:

1. Create checker function in `alternativeGrammarAPIs.ts`
2. Add to the `apis` array in `checkWithAlternativeAPIs`
3. Update this documentation

## Production Deployment

### Recommended Setup

For production, configure at least one alternative API:

```env
# .env.production
VITE_LANGUAGETOOL_API_URL=https://api.languagetool.org/v2
VITE_GRAMMARBOT_API_KEY=your_production_key
VITE_TEXTGEARS_API_KEY=your_production_key
```

### GitHub Pages Deployment

For GitHub Pages:

1. Add secrets in repository settings:
   - `GRAMMARBOT_API_KEY`
   - `TEXTGEARS_API_KEY`
   - `SAPLING_API_KEY`

2. Update GitHub Actions workflow:
   ```yaml
   - name: Build
     run: npm run build
     env:
       VITE_GRAMMARBOT_API_KEY: ${{ secrets.GRAMMARBOT_API_KEY }}
       VITE_TEXTGEARS_API_KEY: ${{ secrets.TEXTGEARS_API_KEY }}
       VITE_SAPLING_API_KEY: ${{ secrets.SAPLING_API_KEY }}
   ```

## Security Notes

1. **API Keys**: Store in `.env`, never commit to git
2. **Client-Side**: API keys are visible in browser (use free tiers only)
3. **Rate Limiting**: Free tiers are sufficient for most users
4. **HTTPS**: All APIs use secure HTTPS connections

## Support

For issues with:
- **LanguageTool**: https://forum.languagetool.org/
- **GrammarBot**: https://www.grammarbot.io/support
- **Textgears**: https://textgears.com/contact
- **Sapling AI**: https://sapling.ai/support

---

**Made with ❤️ for Manuscript Editor Pro**
