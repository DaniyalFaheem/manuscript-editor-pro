# Ollama Setup Guide

Ollama provides completely free, lifetime AI capabilities for Manuscript Editor Pro. Install once and enjoy unlimited AI-powered editing forever!

## What is Ollama?

Ollama is a free, open-source tool that runs large language models locally on your computer. No API keys, no subscriptions, no internet required after setup.

## Installation

### macOS

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Or download from: https://ollama.com/download/mac

### Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Windows

Download the installer from: https://ollama.com/download/windows

## Recommended Models

After installing Ollama, pull these recommended models:

### 1. Llama 3.2 (3B) - Fast & Efficient
```bash
ollama pull llama3.2
```
- **Size**: ~2GB
- **Speed**: Very fast
- **Best for**: Quick grammar checks, simple edits

### 2. Mistral (7B) - Balanced Performance
```bash
ollama pull mistral
```
- **Size**: ~4GB
- **Speed**: Fast
- **Best for**: General editing, style improvements

### 3. Phi-3 (3.8B) - Lightweight
```bash
ollama pull phi3
```
- **Size**: ~2.3GB
- **Speed**: Very fast
- **Best for**: Grammar and spelling checks

## Verify Installation

Test that Ollama is running:

```bash
ollama list
```

You should see the models you've installed.

## Using with Manuscript Editor Pro

1. Make sure Ollama is running (it starts automatically after installation)
2. Open Manuscript Editor Pro
3. Click the AI chat icon
4. Start chatting! The AI will automatically detect Ollama

## Troubleshooting

### Ollama Not Detected

If the AI shows "Ollama unavailable":

1. Check if Ollama is running:
   ```bash
   ollama serve
   ```

2. Verify the API is accessible:
   ```bash
   curl http://localhost:11434/api/tags
   ```

3. If using a custom port, update settings in the AI Settings panel

### Model Download Issues

If a model fails to download:

1. Check your internet connection
2. Try again - downloads resume automatically
3. Free up disk space if needed

### Performance Issues

If Ollama is slow:

1. Use a smaller model (llama3.2 or phi3)
2. Close other applications
3. Check CPU/RAM usage

## Updating Ollama

To update Ollama and your models:

```bash
# Update Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Update models
ollama pull llama3.2
ollama pull mistral
ollama pull phi3
```

## Privacy & Security

- ✅ All processing happens locally on your computer
- ✅ No data is sent to external servers
- ✅ Your documents stay 100% private
- ✅ Works completely offline

## System Requirements

- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 5-10GB for models
- **OS**: macOS 11+, Ubuntu 18.04+, Windows 10+

## Advanced Configuration

### Custom Port

To run Ollama on a custom port:

```bash
OLLAMA_HOST=0.0.0.0:11435 ollama serve
```

Then update the port in AI Settings.

### GPU Acceleration

Ollama automatically uses GPU if available. Supported GPUs:
- NVIDIA GPUs (CUDA)
- AMD GPUs (ROCm)
- Apple Silicon (Metal)

## Support

- Ollama Documentation: https://ollama.com/docs
- GitHub Issues: https://github.com/ollama/ollama/issues
- Manuscript Editor Pro Issues: [Your repo issues]

## Cost Comparison

| Service | Monthly Cost | Annual Cost | Ollama |
|---------|-------------|-------------|--------|
| ChatGPT Plus | $20 | $240 | **$0** |
| Grammarly Premium | $30 | $360 | **$0** |
| Microsoft Editor | $10 | $120 | **$0** |

**Total Savings**: $720/year with Ollama! 🎉
