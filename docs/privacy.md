# 🔒 Privacy Policy - Manuscript Editor Pro

**Last Updated**: November 2024

## Our Commitment

Manuscript Editor Pro is built with **privacy as a core principle**. We believe your writing is personal, and it should stay that way.

---

## Simple Promise

**Your text never leaves your device.**

Everything happens in your browser. No servers, no uploads, no cloud storage.

---

## What We Do

### ✅ Process Locally

- All grammar checking happens in your browser
- All text analysis happens on your device
- All ML inference happens client-side
- No internet required after initial load

### ✅ Store Locally Only

- Documents saved to browser localStorage
- Settings stored in browser localStorage
- ML models cached in IndexedDB
- Everything stays on your device

### ✅ Zero Tracking

- No analytics or telemetry
- No usage tracking
- No error reporting (unless you report bugs)
- No third-party scripts

---

## What We Don't Do

### ❌ No Data Collection

- We don't collect your text
- We don't collect your documents
- We don't collect personal information
- We don't collect usage data

### ❌ No Cloud Storage

- Documents not uploaded to servers
- No cloud synchronization
- No remote backups
- Everything local

### ❌ No User Accounts

- No sign-up required
- No login system
- No user profiles
- No authentication

### ❌ No Third-Party Services

- No external APIs for core features
- No advertising networks
- No social media trackers
- No affiliate links

### ❌ No Cookies

- No tracking cookies
- No analytics cookies
- No advertising cookies
- Only essential browser storage (localStorage)

---

## Technical Details

### How Local Processing Works

```
┌────────────────────────────────────┐
│       Your Browser (Local)         │
│                                    │
│  ┌──────────────────────────────┐ │
│  │     Your Text (Private)      │ │
│  └──────────────────────────────┘ │
│               ↓                    │
│  ┌──────────────────────────────┐ │
│  │  Analysis Engine (Local)     │ │
│  │  • Grammar Rules             │ │
│  │  • ML Models (Local)         │ │
│  │  • Preprocessor              │ │
│  └──────────────────────────────┘ │
│               ↓                    │
│  ┌──────────────────────────────┐ │
│  │  Suggestions (Local)         │ │
│  └──────────────────────────────┘ │
│                                    │
│  No external connection!           │
└────────────────────────────────────┘
```

### Data Storage

**localStorage** (maximum ~10MB):
- Auto-saved documents
- User preferences
- Settings

**IndexedDB** (hundreds of MB):
- ML model cache
- Large document cache

**sessionStorage** (temporary):
- Current session state only
- Cleared when browser closes

**All storage is**:
- Device-local only
- Not synchronized
- Not accessible to us
- Cleared when you clear browser data

---

## Machine Learning Privacy

### Client-Side Models

- Models run in your browser using WebAssembly
- No cloud API calls
- No text sent to external servers
- Models cached locally (IndexedDB)

### Model Loading

1. **Initial Load**: Models downloaded once from CDN
2. **Cache**: Stored in your browser's IndexedDB
3. **Inference**: Runs locally using ONNX Runtime
4. **Updates**: Manual update only (no auto-updates without permission)

### Model Sources

All ML models are:
- Open-source (MIT/Apache licensed)
- Publicly available
- Quantized for privacy (smaller = faster local inference)
- Inspectable (model architecture visible)

---

## Open Source Transparency

### Full Code Access

- **GitHub**: [https://github.com/DaniyalFaheem/manuscript-editor-pro](https://github.com/DaniyalFaheem/manuscript-editor-pro)
- **License**: MIT (fully open)
- **Auditable**: Anyone can inspect the code
- **Community-verified**: Open to security audits

### What You Can Verify

1. **No external API calls** (search for `fetch`, `XMLHttpRequest`)
2. **No analytics** (search for `analytics`, `tracking`)
3. **No user identification** (search for `userId`, `fingerprint`)
4. **Local storage only** (search for `localStorage`, `indexedDB`)

---

## Data Retention

### What We Keep: Nothing

We don't have servers, so we can't keep your data.

### What Your Browser Keeps

**Auto-saved documents**:
- Retention: Until you clear browser data
- Location: Browser localStorage
- Access: You only
- Deletion: Clear browser data or delete manually

**Settings**:
- Retention: Until you clear browser data
- Location: Browser localStorage
- Access: You only
- Deletion: Clear browser data or reset settings

**ML model cache**:
- Retention: Until you clear browser data
- Location: Browser IndexedDB
- Access: You only
- Deletion: Clear browser data or cache

---

## Your Rights

### Right to Access

- Your data is always on your device
- No need to request access from us
- Use browser DevTools to inspect storage

### Right to Delete

- Clear browser data anytime
- Clear specific documents in the app
- Reset settings to default

### Right to Export

- Export documents anytime
- Multiple formats available
- No restrictions

### Right to Privacy

- No account needed
- No authentication
- No tracking
- No data collection

---

## Third-Party Content

### CDN for Assets

We use Content Delivery Networks (CDNs) to serve:
- JavaScript bundles
- CSS stylesheets
- ML model files
- Font files

**Privacy impact**:
- CDN may log IP address and request (standard web behavior)
- No personal data in requests
- No tracking cookies
- HTTPS encrypted

**CDNs used**:
- GitHub Pages (hosting)
- (Optional) CloudFlare CDN (assets)

### No Other Third Parties

- No analytics (Google Analytics, etc.)
- No advertising networks
- No social media widgets
- No external fonts (self-hosted)

---

## Security Measures

### Data Security

**In Transit**:
- HTTPS encryption for CDN downloads
- No data transmitted after initial load

**At Rest**:
- Browser's built-in security
- Same-origin policy
- Content Security Policy headers

**Processing**:
- Sandboxed JavaScript execution
- No eval() or unsafe code execution
- Input sanitization

### Vulnerability Response

If you find a security issue:
1. **Report**: Email or private GitHub issue
2. **Acknowledgment**: Within 48 hours
3. **Fix**: Priority patch
4. **Disclosure**: Coordinated disclosure

---

## Children's Privacy

- No age restrictions (content-appropriate)
- No data collection (any age)
- No account needed (any age)
- COPPA compliant (no data = compliant)

---

## International Users

### GDPR Compliance (EU)

✅ **Compliant by design**:
- No data collection = no GDPR concerns
- No data processing on servers
- No data transfer outside device
- No consent needed (no tracking)

### CCPA Compliance (California)

✅ **Compliant by design**:
- No personal information collected
- No data sold (obviously)
- No data shared
- No opt-out needed (nothing to opt out of)

### Other Jurisdictions

Compliant with most privacy laws because:
- No data collection
- No servers
- No tracking
- Local processing

---

## Browser Permissions

### Required Permissions

**None!**

The app works without any special browser permissions.

### Optional Permissions

**File System Access** (when you import/export):
- Prompt: Browser asks permission
- Purpose: Read/write files
- Scope: Specific files you select
- Revocable: Yes, anytime

---

## Changes to This Policy

### How We Update

- Policy posted on GitHub
- Version history available (git log)
- Material changes announced in README
- No retroactive changes (past is past)

### Notification

- GitHub releases
- README announcement
- No email (we don't have your email!)

---

## Contact & Questions

### Questions About Privacy?

- 📧 Open a GitHub Issue (public)
- 🔐 Report security issues privately
- 💬 GitHub Discussions

### Where to Find Us

- **GitHub**: [DaniyalFaheem/manuscript-editor-pro](https://github.com/DaniyalFaheem/manuscript-editor-pro)
- **Issues**: [GitHub Issues](https://github.com/DaniyalFaheem/manuscript-editor-pro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/DaniyalFaheem/manuscript-editor-pro/discussions)

---

## Summary

### TL;DR

1. ✅ Everything happens in your browser
2. ✅ No data sent to servers
3. ✅ No tracking whatsoever
4. ✅ Open source & auditable
5. ✅ Free forever

**Your privacy is not a feature - it's the foundation.**

---

## Verification

### How to Verify Our Claims

1. **Open DevTools**: F12 in most browsers
2. **Network Tab**: Watch for external requests
3. **Application Tab**: Check localStorage/IndexedDB
4. **Console**: Look for errors/warnings
5. **Source Code**: Review on GitHub

You should see:
- ✅ No analytics requests
- ✅ No tracking pixels
- ✅ Only CDN requests (initial load)
- ✅ Local storage usage only

---

**Questions?** We're happy to explain any aspect of our privacy practices.

**Last Updated**: November 2024
