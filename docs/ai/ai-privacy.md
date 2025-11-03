# AI Privacy & Data Handling

Complete transparency on how Manuscript Editor Pro handles your data with AI features.

## Our Privacy Commitment

✅ **Your data is YOURS**
- We never collect or store your documents
- We never sell your data
- We never share with third parties
- We never train models on your content

## How AI Features Work

### 1. Ollama (Local Processing)

**Where Processing Happens:** Your computer

**Data Flow:**
1. You type in the editor
2. Text stays in your browser
3. When you use AI chat:
   - Text is sent to **your local Ollama server**
   - Ollama runs on **localhost (127.0.0.1)**
   - AI model processes text **on your machine**
   - Response returns to your browser

**Network Activity:**
- ✅ Communication: Browser ↔ Localhost only
- ❌ No external servers contacted
- ❌ No internet required (after setup)
- ❌ No data leaves your computer

**Storage:**
- Chat history: Browser localStorage (your device)
- Models: Stored in Ollama directory (your device)
- Documents: Browser localStorage (your device)

**Privacy Level:** 🔒 **MAXIMUM**

### 2. WebLLM (Browser Processing)

**Where Processing Happens:** Your browser

**Data Flow:**
1. You type in the editor
2. Text stays in browser memory
3. When you use AI:
   - AI model runs in **browser WebAssembly**
   - All processing in **browser memory**
   - No network requests
   - Results stay in browser

**Network Activity:**
- ⚠️ First time: Downloads AI model (one-time)
- ✅ After download: Zero network activity
- ❌ No document data sent anywhere
- ❌ No analytics or tracking

**Storage:**
- AI models: Browser cache (your device)
- Chat history: Browser localStorage (your device)
- Documents: Browser localStorage (your device)

**Privacy Level:** 🔒 **MAXIMUM**

### 3. Transformers.js (Browser Processing)

**Where Processing Happens:** Your browser

**Data Flow:**
1. Specialized NLP tasks run entirely in browser
2. Uses WebAssembly and ONNX Runtime
3. All processing local
4. No external API calls

**Network Activity:**
- ⚠️ First time: Downloads models (one-time)
- ✅ After that: Completely offline
- ❌ No data transmitted

**Privacy Level:** 🔒 **MAXIMUM**

## What We DON'T Do

### ❌ We DON'T Collect
- Your documents or text content
- Your writing style or patterns
- Your personal information
- Your usage patterns
- Your AI conversations
- Any analytics or metrics

### ❌ We DON'T Store
- Any data on remote servers
- Any user accounts or profiles
- Any document backups
- Any conversation logs

### ❌ We DON'T Share
- Nothing with third parties
- Nothing with advertisers
- Nothing with analytics services
- Nothing with anyone

### ❌ We DON'T Use Your Data For
- Training AI models
- Marketing purposes
- Selling to data brokers
- Research without consent
- Any purpose whatsoever

## What Data Exists Locally

### On Your Computer

**Browser LocalStorage:**
- Current document content
- Auto-save copies
- Chat history
- AI settings
- UI preferences

**You can clear this anytime:**
- Clear browser data
- Use private/incognito mode
- Delete localStorage manually

**Ollama Directory:**
- AI model files
- Temporary processing files
- No document content

**Note:** Even this local data is temporary and under your control.

## Comparison with Other Tools

| Feature | Manuscript Editor Pro | Grammarly | MS Word Online | Google Docs |
|---------|----------------------|-----------|----------------|-------------|
| **Where AI Runs** | Your device | Their servers | Their servers | Their servers |
| **Data Transmitted** | Nothing | Everything | Everything | Everything |
| **Account Required** | No | Yes | Yes | Yes |
| **Data Retention** | None | Per policy | Per policy | Per policy |
| **Third-party Sharing** | Never | Possible | Possible | Per policy |
| **Training on Your Data** | Never | Possible | Possible | Possible |
| **Offline Capability** | Full | Limited | No | No |
| **Privacy Level** | Maximum | Low | Medium | Low |

## GDPR & Privacy Regulations

### Compliance

✅ **GDPR Compliant (EU)**
- No data collection = No GDPR concerns
- No processing of personal data
- No need for consent notices

✅ **CCPA Compliant (California)**
- No sale of personal information
- No collection of personal information

✅ **Universal Compliance**
- Works the same everywhere
- No regional restrictions
- No legal concerns

### Your Rights

**Right to Access:** No data to access
**Right to Deletion:** No data to delete
**Right to Portability:** Your data stays with you
**Right to Opt-out:** Nothing to opt out of

## Security

### How We Keep Things Secure

1. **No Data Transmission**
   - Biggest security is no network exposure
   - Can't be intercepted if never sent

2. **Local Encryption**
   - Browser storage is encrypted at OS level
   - Modern OS encrypt local data

3. **No Authentication Required**
   - No passwords to leak
   - No accounts to hack

4. **Open Source**
   - Code is public and auditable
   - Community reviewed
   - No hidden behavior

### Threat Model

**What could go wrong:**

1. **Someone accesses your computer**
   - Could see your documents
   - **Solution:** Use OS-level encryption (FileVault, BitLocker)
   - Lock your computer when away

2. **Browser vulnerability**
   - Could expose browser storage
   - **Solution:** Keep browser updated
   - Use browser security features

3. **Malware on your system**
   - Could access any local files
   - **Solution:** Use antivirus
   - Don't install untrusted software

**What CAN'T go wrong:**
- ✅ Data breach of our servers (we have none)
- ✅ Interception of data in transit (nothing transmitted)
- ✅ Unauthorized access to your data (we can't access it)

## Sensitive Documents

### Extra Protection

If working with highly sensitive documents:

1. **Use Offline Mode**
   - Disconnect from internet
   - AI still works with Ollama

2. **Use Encrypted Drive**
   - FileVault (Mac)
   - BitLocker (Windows)
   - LUKS (Linux)

3. **Use Private Browsing**
   - No persistent storage
   - Clears on close

4. **Use Dedicated Computer**
   - Air-gapped if necessary
   - No network access

5. **Regular Cleanup**
   - Clear browser data regularly
   - Delete Ollama temporary files

### For Organizations

**Compliance-Friendly:**
- Medical (HIPAA): Safe - no PHI transmitted
- Legal: Safe - attorney-client privilege protected
- Financial: Safe - no financial data shared
- Academic: Safe - protects research confidentiality

**Enterprise Deployment:**
- Can run entirely on-premise
- No cloud dependencies
- No licensing per user
- No data leaving network

## Transparency

### Open Source Advantages

1. **Code Review**
   - Anyone can inspect code
   - No hidden functionality
   - Community verification

2. **Security Audits**
   - Public security reviews
   - Issue tracking visible
   - Fixes transparent

3. **Build Verification**
   - Can build from source
   - Verify no tracking added
   - Trust but verify

### What We Log

**Browser Console:**
- Error messages (local only)
- Debug information (local only)
- Performance metrics (local only)

**These never leave your computer.**

### No Analytics

We deliberately don't use:
- Google Analytics
- Mixpanel
- Sentry
- Any tracking service

**Why?** Your privacy matters more than our metrics.

## Questions & Answers

### Q: Can you see my documents?
**A:** No. Impossible. They never leave your device.

### Q: Are you training AI on my writing?
**A:** No. We never see your writing, so we can't train on it.

### Q: What about browser extensions?
**A:** They can access page content. Use trusted extensions only.

### Q: Is chat history private?
**A:** Yes. Stored only in your browser's localStorage.

### Q: Can I delete all my data?
**A:** Yes. Clear browser data or use incognito mode.

### Q: Do you use cookies?
**A:** No tracking cookies. Only essential localStorage.

### Q: What about future features?
**A:** Commitment: Privacy-first forever. Any new feature must maintain this standard.

### Q: How can I verify this?
**A:** 
1. Inspect network tab (F12) - no requests
2. Review source code on GitHub
3. Use network monitoring tools
4. Community verification

### Q: What if I find a privacy issue?
**A:** Report immediately on GitHub. We take privacy seriously.

## Best Practices

### For Maximum Privacy

1. **Use Ollama**
   - Most private option
   - Never touches internet

2. **Don't Use Cloud Storage**
   - Export documents manually
   - Store on encrypted drive

3. **Clear Regularly**
   - Clear browser data monthly
   - Clear chat history

4. **Use Incognito for Sensitive Work**
   - No persistence
   - Fresh start each time

5. **Audit Your Browser**
   - Review extensions
   - Check permissions
   - Update regularly

### Red Flags (Not in Our Software)

Watch for these in other tools:
- ❌ "Requires account"
- ❌ "Cloud syncing"
- ❌ "Telemetry"
- ❌ "Analytics"
- ❌ "Requires internet"
- ❌ "Data processing on servers"

## Contact

### Report Privacy Concerns

If you find any privacy issues:
1. Open GitHub issue (use "Security" label)
2. Email: [Provide contact if available]
3. Expect prompt response

### Security Vulnerability

For security vulnerabilities:
1. Report privately on GitHub
2. Responsible disclosure appreciated
3. We'll credit you in fix

## Our Pledge

We pledge to:
- ✅ Keep all processing local
- ✅ Never collect user data
- ✅ Remain open source
- ✅ Prioritize privacy always
- ✅ Be transparent about changes

**This is our permanent commitment.**

---

## Summary

**Simple version:** Your data stays on your computer. Period.

**Detailed version:** All AI processing happens locally on your device. No data is transmitted, collected, stored, or shared. Ever. You maintain complete control and ownership of your documents and conversations.

**Trust but verify:** Our code is open source. Check it yourself!

---

Last Updated: 2025-11-03
Version: 1.0

Questions? Open an issue on GitHub!
