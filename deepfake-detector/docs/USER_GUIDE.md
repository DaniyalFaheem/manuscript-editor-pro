# User Guide

Welcome to the Deepfake Detector! This guide will help you understand how to use the application to detect manipulated images and videos.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Analyzing Images](#analyzing-images)
3. [Analyzing Videos](#analyzing-videos)
4. [Understanding Results](#understanding-results)
5. [Using the Browser Extension](#using-the-browser-extension)
6. [API Usage](#api-usage)
7. [FAQ](#faq)

## Getting Started

### Accessing the Application

1. **Web Application:** Navigate to `http://localhost:3000` (or your deployed URL)
2. **API Documentation:** Visit `http://localhost:8000/docs` for interactive API docs

### Creating an Account (Optional)

While you can use the application anonymously, creating an account provides:
- Higher rate limits
- Analysis history
- API key generation
- Saved preferences

To register:
1. Click "Sign Up" in the top navigation
2. Enter your email and create a password
3. Verify your email (if required)

## Analyzing Images

### Upload an Image

1. Navigate to the **Analyze** page
2. Click the upload area or drag and drop an image
3. Supported formats: JPEG, PNG, WEBP, BMP, GIF
4. Maximum file size: 100 MB

### Analyze from URL

1. Click the "From URL" tab
2. Paste a direct link to an image
3. Click "Analyze"

### Analysis Process

The system performs multiple analyses:
- **CNN Classification:** EfficientNet and XceptionNet models analyze the image
- **Facial Landmark Detection:** Checks for unnatural facial features
- **Texture Analysis:** Examines skin texture and lighting
- **Metadata Examination:** Reviews EXIF data for editing software
- **Frequency Analysis:** Detects GAN fingerprints

## Analyzing Videos

### Upload a Video

1. Navigate to the **Analyze** page
2. Select "Video" upload
3. Supported formats: MP4, AVI, MOV, MKV, WEBM
4. Maximum file size: 100 MB

### Video Analysis Features

Videos receive additional analysis:
- **Frame-by-Frame Analysis:** Each sampled frame is analyzed
- **Temporal Consistency:** Checks for inconsistencies between frames
- **Blink Detection:** Analyzes natural blinking patterns
- **Audio-Visual Sync:** Checks lip sync (if audio present)
- **Optical Flow:** Detects unnatural motion

### Frame Sampling

By default, the system analyzes every 10th frame. You can adjust this:
- Lower values = more thorough but slower
- Higher values = faster but may miss subtle manipulations

## Understanding Results

### Confidence Score

The main result is a **confidence score** from 0% to 100%:
- **0-30%:** Low risk - Content appears authentic
- **30-60%:** Medium risk - Some suspicious elements detected
- **60-80%:** High risk - Likely manipulated
- **80-100%:** Very high risk - Strong indicators of deepfake

### Model Results

Each model provides its own assessment:

| Model | Specialization |
|-------|----------------|
| **EfficientNet** | General deepfake detection, fast processing |
| **XceptionNet** | Facial manipulation, high accuracy |
| **ResNet** | Various manipulation types |
| **Ensemble** | Combined voting for best accuracy |

### Detailed Analysis

Expand the "Detailed Analysis" section to see:

#### Facial Landmarks
- **Anomaly Detected:** Whether unnatural facial features were found
- **Landmark Count:** Number of facial points detected
- **Symmetry Score:** How symmetric the face appears

#### Texture Analysis
- **Skin Texture Score:** Quality of skin texture
- **Lighting Consistency:** Whether lighting is consistent
- **Noise Pattern Anomaly:** Whether digital noise patterns are suspicious

#### Metadata
- **Camera Information:** Original camera make/model
- **Software:** Any editing software detected
- **Warnings:** Specific concerns found in metadata

### Heatmap Visualization

The heatmap shows which regions of the image are most suspicious:
- **Red areas:** High suspicion
- **Yellow areas:** Medium suspicion
- **Green areas:** Low suspicion

Use the controls to:
- Adjust overlay opacity
- Zoom in/out
- Pan around the image

### Video Timeline

For videos, the timeline shows:
- Green segments: Frames detected as real
- Red segments: Frames detected as fake
- Click any segment to jump to that frame

## Using the Browser Extension

### Installation

1. Download the extension from Chrome Web Store (or load unpacked for development)
2. Click the extension icon to open the popup
3. Configure your settings

### Context Menu Analysis

Right-click any image or video on a webpage:
1. Select "Analyze image for deepfake" or "Analyze video for deepfake"
2. A loading indicator will appear
3. Results display as a badge on the media

### Automatic Scanning

Enable "Auto-scan images on page" to automatically analyze all images when you visit a page.

**Note:** This may slow down browsing and uses your rate limit.

### Result Badges

After analysis, images display badges:
- ✓ **GREEN badge:** Content appears authentic
- ⚠️ **RED badge:** Potential deepfake detected
- Click the badge for detailed results

## API Usage

### Getting Started

1. Create an account and generate an API key
2. Include your key in request headers:
   ```
   X-API-Key: df_your_api_key
   ```

### Example: Analyze an Image

```python
import requests

url = "http://localhost:8000/api/v1/analyze/image"
headers = {"X-API-Key": "df_your_api_key"}
files = {"file": open("image.jpg", "rb")}

response = requests.post(url, headers=headers, files=files)
result = response.json()

print(f"Deepfake: {result['result']['is_deepfake']}")
print(f"Confidence: {result['result']['confidence'] * 100:.1f}%")
```

### Example: Analyze from URL

```python
import requests

url = "http://localhost:8000/api/v1/analyze/url"
headers = {
    "X-API-Key": "df_your_api_key",
    "Content-Type": "application/json"
}
data = {
    "url": "https://example.com/suspicious-image.jpg",
    "include_heatmap": True
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
```

See the [API Documentation](API.md) for complete endpoint reference.

## FAQ

### How accurate is the detection?

Our ensemble model achieves approximately 96% accuracy on standard benchmark datasets (FaceForensics++, Celeb-DF). However, accuracy can vary:
- High-quality deepfakes may be harder to detect
- Heavily compressed images lose detection signals
- New deepfake techniques may not be detected

### What types of manipulation can you detect?

- **Face swaps:** Deepfakes, FaceSwap, Face2Face
- **Face reenactment:** Lip sync manipulation
- **Full synthetic faces:** GAN-generated faces
- **AI-generated images:** DALL-E, Midjourney, Stable Diffusion
- **Traditional editing:** Photoshop manipulation

### Is my data stored?

- Files are processed in memory when possible
- Uploaded files are automatically deleted after analysis
- You can enable "Anonymous mode" for no tracking
- See our [Privacy Policy](privacy.md) for details

### What if the detection is wrong?

Our system isn't perfect. If you believe a result is incorrect:
1. Click "Report Issue" on the results page
2. Select whether you believe the content is real or fake
3. Add any additional context
4. Submit - this helps improve our models!

### How can I improve detection accuracy?

- **Use high-quality images:** Avoid heavily compressed files
- **Use the original source:** Screenshots lose information
- **Analyze multiple frames:** For videos, use lower frame sampling
- **Use ensemble mode:** Multiple models catch more issues

### What are the rate limits?

| Plan | Requests/minute | Requests/hour |
|------|-----------------|---------------|
| Anonymous | 10 | 100 |
| Free Account | 30 | 500 |
| API Key | 60 | 1,000 |

### Can I use this commercially?

The application is open source under the MIT license. You can:
- Use it for personal projects
- Integrate it into your products
- Modify and redistribute

Please attribute the original project.

### How do I report bugs?

1. Check existing issues: https://github.com/DaniyalFaheem/manuscript-editor-pro/issues
2. Create a new issue with:
   - Description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - System information

## Tips for Best Results

1. **Use original files:** Avoid screenshots or re-compressed media
2. **Check multiple times:** Results can vary slightly
3. **Look at all indicators:** Don't rely solely on the main score
4. **Consider context:** Technical detection is one tool among many
5. **Stay updated:** New deepfake techniques emerge regularly

## Getting Help

- **Documentation:** See API.md and DEPLOYMENT.md
- **Issues:** https://github.com/DaniyalFaheem/manuscript-editor-pro/issues
- **Discussion:** Join our community discussions

---

Thank you for using Deepfake Detector! Together, we can help maintain trust in digital media.
