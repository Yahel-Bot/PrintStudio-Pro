# PrintStudio Pro - Setup Guide

## Requirements

PrintStudio Pro requires the following dependencies to work correctly on a new PC:

### 1. Python 3.8 or higher
- Download from: https://www.python.org/downloads/
- **Important**: During installation, check the option "Add Python to PATH"
- Verify installation by running: `python --version` in Command Prompt

### 2. Python Dependencies
After installing Python, run the following command in PowerShell or Command Prompt:

```bash
pip install comtypes PyMuPDF opencv-python numpy
```

This installs:
- **comtypes**: For Microsoft Office automation (Word, Excel, PowerPoint)
- **PyMuPDF (fitz)**: For PDF processing
- **opencv-python (cv2)**: For image analysis
- **numpy**: Required by opencv-python

### 3. Microsoft Office (Optional but recommended)
- Word, Excel, and PowerPoint are required to convert DOCX, XLSX, and PPTX files
- LibreOffice can also be used as an alternative
- If these are not installed, the app will still work for PDF and image files

## Installation Steps

1. **Download the Executable**
   - Get the latest `PrintStudio Pro X.X.X.exe` from the build folder

2. **Install Python**
   - Run the Python installer
   - Make sure to check "Add Python to PATH"
   - Complete the installation

3. **Install Python Dependencies**
   - Open PowerShell or Command Prompt
   - Run: `pip install comtypes PyMuPDF opencv-python numpy`
   - Wait for installation to complete

4. **Run PrintStudio Pro**
   - Double-click the `.exe` file
   - The app will automatically:
     - Start a public tunnel (localtunnel) for cross-network file uploads
     - Display a QR code for mobile uploads
     - Connect to available system printers
     - Display a mobile-friendly upload interface on the tunnel URL

## First Launch

When you run PrintStudio Pro for the first time:

1. The app window will open with the main interface
2. A public tunnel URL will be generated (this takes 3-5 seconds)
3. The QR code will update to show the public upload URL
4. Mobile devices and other computers can now scan the QR or visit the URL to upload files

## Troubleshooting

### "No printers found"
- Ensure at least one printer is installed on your PC
- Windows should auto-detect network and USB printers
- Try restarting the app if printers were added after startup

### "Error converting document"
- Verify that Microsoft Office or LibreOffice is installed
- Try using Python's test: `python -c "import comtypes.client; print('OK')"`
- Ensure the file format is supported (PDF, DOCX, XLSX, PPTX)

### "Error analyzing image"
- Verify OpenCV is installed: `python -c "import cv2; print('OK')"`
- Supported formats: JPG, PNG, WEBP, BMP, TIFF
- Try with a different image if one fails

### "Tunnel error"
- This is usually temporary; restart the app
- Check your internet connection
- Localtunnel service may be temporarily down

## Features

✅ **Local Network Upload**: Upload files via QR from mobile on same WiFi
✅ **Cross-Network Upload**: Public tunnel allows uploads from any device anywhere
✅ **Document Analysis**: Automatically detects color, ink coverage, and paper type
✅ **Smart Pricing**: Calculates printing costs based on ink usage
✅ **Batch Processing**: Process multiple files at once
✅ **Historical Records**: Keep daily sales records and print receipts
✅ **Multi-Printer Support**: Switch between installed printers

## License

ISC License - Free to use and modify
