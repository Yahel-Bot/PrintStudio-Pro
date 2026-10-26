# IMPLEMENTATION PLAN FOR PRINTSTUDIO PRO ENHANCEMENTS

Based on our discussion and your responses, here's what I will implement:

## 1. EXTEND FRONTEND DATA MODELS:
- Add rotation, quantity, and copiesPerPage to PageAnalysis interface
- Initialize these properties in analyzeFile function

## 2. ADD PRINT-DOCUMENT IPC CALL:
- Add print-document to preload.js electronAPI
- Modify handlePrintAndRegister to call print-document after saving sale

## 3. ADD UI CONTROLS:
- Layout selector dropdown (1, 2, 3, 4, 5, 7, 8, 9, 10, 35)
- Rotation selector (0°, 90°, 180°, 270°)
- Per-image quantity controls (input + mouse wheel)
- Per-page copies controls (input + mouse wheel)

## 4. FIX LIVE PREVIEW:
- Modify canvas-area to show exactly what will be printed
- Show images in correct positions with empty spaces as blank
- Do NOT duplicate images to fill empty layout slots

## 5. ENHANCE QR UPLOAD SITE:
- Update server.js to match app's visual style
- Use same colors, fonts, and design patterns
- Improve error handling and user feedback
- Add better visual feedback during upload

## 6. UPDATE BACKEND (if source needs syncing):
- Ensure print_composer.js rotation logic works with frontend
- Verify imageLayout handling in print-document handler

## FILES TO MODIFY:
- src/App.tsx (main frontend logic)
- src/index.css (additional styles if needed)
- preload.js (add print-document to electronAPI)
- server.js (enhance QR upload site)

## APPROACH:
- Make minimal, focused changes
- Follow existing code patterns and styles
- Preserve all existing functionality
- Test each feature incrementally

Please review this plan and confirm if I should proceed with implementation.