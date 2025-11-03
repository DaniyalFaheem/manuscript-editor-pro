# AI Troubleshooting Guide

Common issues and solutions for the AI features in Manuscript Editor Pro.

## Ollama Issues

### Ollama Not Detected

**Symptoms:**
- AI status shows "Offline" or "Unavailable"
- Chat responses say "No AI provider available"

**Solutions:**

1. **Check if Ollama is Running**
   ```bash
   # Check if Ollama service is running
   ollama list
   ```
   If this command works, Ollama is running.

2. **Start Ollama Service**
   ```bash
   # macOS/Linux
   ollama serve
   
   # Windows: Ollama runs as a service automatically
   ```

3. **Verify API Accessibility**
   ```bash
   curl http://localhost:11434/api/tags
   ```
   Should return a JSON response with your installed models.

4. **Check Firewall/Antivirus**
   - Ensure localhost:11434 is not blocked
   - Add Ollama to firewall exceptions

5. **Reinstall Ollama**
   If all else fails, reinstall:
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```

### No Models Available

**Symptoms:**
- Ollama is running but chat doesn't work
- Error: "Model not found"

**Solutions:**

1. **Pull Required Models**
   ```bash
   ollama pull llama3.2
   ollama pull mistral
   ollama pull phi3
   ```

2. **Verify Models are Downloaded**
   ```bash
   ollama list
   ```
   Should show your downloaded models.

3. **Set Default Model in Settings**
   - Click AI chat icon
   - Click Settings (gear icon)
   - Select a model from the dropdown

### Slow Performance

**Symptoms:**
- AI responses are very slow
- System becomes unresponsive

**Solutions:**

1. **Use a Smaller Model**
   - Switch to llama3.2 (3B) or phi3 (3.8B)
   - These are faster and use less RAM

2. **Close Other Applications**
   - Free up system memory
   - Close browser tabs and other apps

3. **Check System Resources**
   ```bash
   # macOS/Linux
   top
   
   # Windows
   Task Manager
   ```

4. **Enable GPU Acceleration**
   - Ensure GPU drivers are up to date
   - Ollama automatically uses GPU if available

5. **Reduce Max Tokens**
   - Shorter responses are faster
   - Adjust in AI settings

## WebLLM Issues

### WebGPU Not Supported

**Symptoms:**
- Browser doesn't support WebGPU
- WebLLM shows as unavailable

**Solutions:**

1. **Use a Supported Browser**
   - Chrome 113+
   - Edge 113+
   - Opera 99+

2. **Enable WebGPU Flags**
   For Chrome/Edge:
   - Go to `chrome://flags`
   - Search for "WebGPU"
   - Enable "WebGPU" flag
   - Restart browser

3. **Update Browser**
   - Ensure you have the latest version
   - WebGPU is relatively new

4. **Check GPU Support**
   - Some older GPUs don't support WebGPU
   - Try on a different device

### Model Download Fails

**Symptoms:**
- WebLLM model download stalls
- Error during initialization

**Solutions:**

1. **Clear Browser Cache**
   - Clear site data
   - Reload the page

2. **Check Internet Connection**
   - Models are downloaded on first use
   - Requires stable internet

3. **Free Up Storage**
   - Models need ~2-4GB of browser storage
   - Clear other site data if needed

## General AI Issues

### Chat Not Responding

**Symptoms:**
- Message sent but no response
- Loading indicator shows indefinitely

**Solutions:**

1. **Check Console for Errors**
   - Press F12 to open DevTools
   - Check Console tab for error messages

2. **Refresh the Page**
   - Sometimes a simple refresh helps
   - Your work is auto-saved

3. **Clear Chat History**
   - Click the trash icon in chat panel
   - Sometimes long history causes issues

4. **Try Different Provider**
   - Settings → Provider Selection
   - Switch from Ollama to WebLLM or vice versa

### Poor Quality Suggestions

**Symptoms:**
- AI suggestions are not helpful
- Responses seem off-topic

**Solutions:**

1. **Be More Specific**
   - Instead of "Fix this", say "Fix grammar in paragraph 2"
   - Provide clear context

2. **Select Text First**
   - Highlight the text you want help with
   - AI focuses on selection

3. **Try a Larger Model**
   - Switch from llama3.2 to mistral
   - Larger models are more accurate

4. **Adjust Grammar Strictness**
   - Settings → Grammar Strictness
   - Try "Strict" mode for more rigorous checks

5. **Use Specific Commands**
   - `/grammar` for grammar only
   - `/style` for style only
   - More focused than general requests

### High Memory Usage

**Symptoms:**
- Browser uses lots of RAM
- System becomes slow

**Solutions:**

1. **Close Unused Tabs**
   - Each tab uses memory
   - Keep only what you need

2. **Use Ollama Instead of WebLLM**
   - Ollama runs as separate process
   - Doesn't use browser memory

3. **Restart Browser**
   - Fresh start can help
   - Your work is auto-saved

4. **Upgrade RAM**
   - 8GB minimum recommended
   - 16GB ideal for smooth performance

## Connection Issues

### API Timeout

**Symptoms:**
- Request timeout errors
- "Failed to fetch" messages

**Solutions:**

1. **Check Ollama Port**
   - Default: localhost:11434
   - Verify in Settings → Ollama URL

2. **Increase Timeout**
   - Some models need more time
   - Wait longer before retrying

3. **Check Network Settings**
   - Ensure localhost is not blocked
   - Check proxy settings

### CORS Errors

**Symptoms:**
- CORS policy errors in console
- Cross-origin request blocked

**Solutions:**

1. **Use Ollama with CORS Enabled**
   ```bash
   OLLAMA_ORIGINS="*" ollama serve
   ```

2. **Access via Localhost**
   - Use http://localhost not http://127.0.0.1
   - They're technically different origins

## Browser-Specific Issues

### Firefox Issues

**Problem:** WebGPU not available in Firefox
**Solution:** Firefox doesn't support WebGPU yet. Use Ollama or Chrome.

### Safari Issues

**Problem:** Some features don't work in Safari
**Solution:** Safari has limited WebGPU support. Use Chrome or Ollama.

### Mobile Browsers

**Problem:** AI features slow or unavailable on mobile
**Solution:** AI features are optimized for desktop. Use Ollama on desktop for best experience.

## Data & Privacy Issues

### Chat History Not Saving

**Symptoms:**
- Chat history disappears on refresh
- Previous conversations lost

**Solutions:**

1. **Check Browser Storage**
   - Ensure site data is allowed
   - Check storage quota

2. **Don't Use Incognito Mode**
   - Incognito clears storage on close
   - Use regular browsing mode

3. **Check Browser Settings**
   - Allow cookies and site data
   - Don't clear on exit

### Privacy Concerns

**Question:** Is my data being sent anywhere?

**Answer:**
- ✅ **Ollama**: 100% local, nothing sent externally
- ✅ **WebLLM**: 100% in-browser, nothing sent externally
- ✅ **Transformers.js**: 100% local, nothing sent externally

All AI processing happens on your device. No data is transmitted to external servers.

## Still Having Issues?

### Get Help

1. **Check Documentation**
   - [Ollama Setup Guide](ollama-setup.md)
   - [AI Features Overview](ai-features.md)
   - [Chat Commands](chat-commands.md)

2. **Check Ollama Documentation**
   - https://ollama.com/docs
   - https://github.com/ollama/ollama

3. **Open an Issue**
   - GitHub Issues: [Your Repo URL]
   - Provide:
     - Operating system
     - Browser and version
     - Error messages (F12 console)
     - Steps to reproduce

### Debug Mode

Enable debug logging:
1. Open browser console (F12)
2. Check for detailed error messages
3. Include these in your issue report

### System Information

Helpful info to include:
```bash
# Operating System
uname -a  # Linux/Mac
systeminfo  # Windows

# Ollama version
ollama --version

# Browser version
# Check: Menu → About

# Available models
ollama list

# System resources
free -h  # Linux
vm_stat  # Mac
systeminfo | findstr Memory  # Windows
```

## Common Error Messages

### "No AI provider available"
- Install and start Ollama
- Or ensure browser supports WebGPU

### "Model not found"
- Pull the model: `ollama pull llama3.2`
- Check model name in settings

### "Failed to fetch"
- Check Ollama is running
- Verify localhost:11434 is accessible

### "Insufficient memory"
- Close other applications
- Use a smaller model
- Upgrade system RAM

### "WebGPU not supported"
- Update browser to latest version
- Enable WebGPU flags
- Try Chrome/Edge 113+

## Performance Tips

### For Best Performance

1. **Use Ollama with GPU**
   - Fastest option
   - Best for frequent use

2. **Close Unnecessary Apps**
   - Free up system resources
   - Dedicated resources to AI

3. **Use Appropriate Model**
   - llama3.2: Quick checks
   - mistral: Balanced
   - Only use larger models when needed

4. **Cache Management**
   - First request is slower (loading)
   - Subsequent requests are faster (cached)

5. **Optimize Settings**
   - Adjust max tokens
   - Lower temperature for consistency
   - Higher for creativity

## Preventing Issues

### Best Practices

1. **Keep Software Updated**
   - Update Ollama regularly
   - Keep browser current

2. **Monitor Resources**
   - Check RAM usage
   - Watch disk space

3. **Regular Maintenance**
   - Clear browser cache occasionally
   - Remove unused Ollama models

4. **Backup Important Work**
   - Export documents regularly
   - Don't rely solely on auto-save

---

**Still stuck?** Open an issue with detailed information, and we'll help you out!
