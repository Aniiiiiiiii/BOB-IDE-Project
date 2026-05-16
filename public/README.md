# DevChronicle Landing Page

This is the interactive landing page for the DevChronicle MCP Server.

## Features

- 🎨 Dark-themed, modern design
- ✨ Smooth animations and transitions
- 📱 Fully responsive layout
- 🎭 Interactive tool demonstrations
- 🚀 Optimized for Replit deployment

## Running Locally

```bash
# Start the development server
npm run serve

# Or use the preview command
npm run preview
```

The page will be available at `http://localhost:3000`

## Deploying to Replit

1. Upload all files from the `public/` directory
2. Upload `server.js` to the root
3. Ensure `package.json` includes the serve script
4. Click "Run" in Replit - it will automatically start the server

## Structure

```
public/
├── index.html    # Main HTML structure
├── styles.css    # All styling and animations
└── script.js     # Interactive functionality
server.js         # Simple HTTP server
```

## Customization

- Update GitHub links in `index.html` (search for "yourusername")
- Modify color scheme in `styles.css` (`:root` variables)
- Add more tool demos by following the existing pattern

## Technologies

- Pure HTML, CSS, and JavaScript (no frameworks)
- Google Fonts (Inter & JetBrains Mono)
- CSS Grid & Flexbox for layout
- Intersection Observer API for scroll animations