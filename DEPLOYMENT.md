# DevChronicle Landing Page - Deployment Guide

## 🚀 Quick Start (Local)

```bash
# Start the server
npm run serve
```

Visit `http://localhost:3000` to view the landing page.

## 📦 Replit Deployment

### Option 1: Direct Upload
1. Create a new Repl on Replit
2. Upload these files:
   - `public/` directory (with index.html, styles.css, script.js)
   - `server.js`
   - `package.json`
   - `.replit`
   - `replit.nix`
3. Click "Run" - Replit will automatically install dependencies and start the server

### Option 2: Import from GitHub
1. Push your code to GitHub
2. On Replit, click "Import from GitHub"
3. Select your repository
4. Replit will automatically detect the configuration and run

## 🔧 Configuration

### Environment Variables (Optional)
- `PORT` - Server port (default: 3000)

### Replit Configuration
The `.replit` file configures:
- Run command: `npm run serve`
- Port mapping: 3000 → 80
- Deployment target: Cloud Run

## 🎨 Customization

### Update GitHub Links
Search for `yourusername` in `public/index.html` and replace with your actual GitHub username.

### Modify Colors
Edit CSS variables in `public/styles.css`:
```css
:root {
    --bg-primary: #0a0e27;
    --accent-primary: #6366f1;
    /* ... more variables */
}
```

### Add More Tools
Follow the pattern in the "Tools Section" of `index.html` to add more tool demonstrations.

## 📊 Features Included

✅ Dark theme with animated stars background
✅ Responsive design (mobile-friendly)
✅ 5 interactive tool demonstrations with animations
✅ Smooth scroll navigation
✅ Copy-to-clipboard for code snippets
✅ Intersection Observer animations
✅ SEO-friendly structure

## 🛠️ Tech Stack

- **Frontend**: Pure HTML, CSS, JavaScript (no frameworks)
- **Fonts**: Google Fonts (Inter, JetBrains Mono)
- **Server**: Node.js HTTP server
- **Animations**: CSS animations + Intersection Observer API

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 3000 is already in use
lsof -i :3000

# Use a different port
PORT=8080 npm run serve
```

### Files not loading
Ensure the `public/` directory structure is correct:
```
public/
├── index.html
├── styles.css
└── script.js
```

### Animations not working
Check browser console for JavaScript errors. Ensure all files are loaded correctly.

## 📝 License

MIT License - Feel free to customize and use for your projects!