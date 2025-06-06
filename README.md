# Spliner - Web-Based Spline Editor

A modern, interactive web-based spline editor built with HTML5 Canvas and vanilla JavaScript. Create smooth curves by placing control points and manipulating Bezier splines in real-time.

## Features

- **Interactive Canvas**: Full-screen responsive canvas that adapts to any screen size
- **Smooth Splines**: Mathematical Bezier curve rendering for smooth, professional curves
- **Point Management**: Click to add points, drag to move them, right-click to remove
- **Dark Theme**: Modern dark UI with subtle animations and visual effects
- **Export Functionality**: Save your spline data as JSON for later use
- **Keyboard Shortcuts**: Efficient workflow with keyboard shortcuts
- **Mobile Support**: Touch-friendly interface for tablets and mobile devices
- **Grid Background**: Reference grid for precise positioning

## Demo

Simply open `index.html` in your web browser to start using the spline editor. No installation or build process required!

## Usage

### Basic Operations

1. **Adding Points**: Click anywhere on the canvas to add a control point
2. **Moving Points**: Click and drag existing points to reshape your spline
3. **Removing Points**: Right-click on any point to remove it
4. **Clearing**: Click the "Clear" button to remove all points
5. **Exporting**: Click "Export" to download your spline data as a JSON file

### Keyboard Shortcuts

- `Ctrl/Cmd + S`: Export spline data
- `Ctrl/Cmd + Delete`: Clear all points
- `Escape`: Clear selection (future feature)

### Mouse Controls

- **Left Click**: Add new point or start dragging existing point
- **Left Click + Drag**: Move existing points
- **Right Click**: Remove point at cursor position

## Project Structure

```
Spliner/
├── index.html          # Main HTML file
├── styles.css          # CSS styling with dark theme
├── js/
│   ├── main.js         # Main application logic and event handling
│   ├── spline.js       # Spline mathematics and rendering
│   └── ui.js           # User interface management
└── README.md           # Project documentation
```

## Technical Details

### Architecture

The project follows a modular architecture with three main JavaScript modules:

- **main.js**: Handles initialization, event management, and coordinates between modules
- **spline.js**: Contains the `SplineRenderer` class with mathematical calculations for Bezier curves
- **ui.js**: Manages user interface elements, notifications, and responsive behavior

### Spline Mathematics

Uses cubic Bezier curves with automatically calculated control points based on:
- Point positions and distances
- Tangent calculations for smooth transitions
- Adaptive control point positioning for natural curves

### Canvas Rendering

- Hardware-accelerated Canvas 2D API
- Dynamic resolution adjustment for crisp rendering
- Smooth animations with `requestAnimationFrame`
- Glow effects and anti-aliasing for professional appearance

## Browser Compatibility

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Features Used**:
  - ES6 Modules
  - Canvas 2D API
  - Flexbox layout
  - CSS Grid (for responsive design)
  - File API (for export functionality)

## Customization

### Visual Settings

You can customize the appearance by modifying the constants in `spline.js`:

```javascript
// Visual settings in SplineRenderer constructor
this.pointRadius = 8;              // Size of control points
this.splineColor = '#60a5fa';      // Curve color
this.pointColor = '#fbbf24';       // Point color
```

### Grid Settings

Modify the grid size in `main.js`:

```javascript
const gridSize = 20; // Grid spacing in pixels
```

## Export Format

Exported JSON contains:

```json
{
  "points": [
    {"x": 100, "y": 200},
    {"x": 300, "y": 150}
  ],
  "canvasSize": {
    "width": 1920,
    "height": 1080
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Development

### Local Development

1. Clone the repository
2. Open `index.html` in a modern web browser
3. Start editing the code - changes will be reflected immediately

### Adding Features

The modular architecture makes it easy to extend:

- Add new tools in `ui.js`
- Implement different curve types in `spline.js`
- Add new export formats in `main.js`

## Performance

- Optimized rendering with RAF
- Efficient point detection algorithms
- Minimal DOM manipulation
- Hardware-accelerated canvas operations

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## Future Enhancements

- [ ] Undo/Redo functionality
- [ ] Multiple spline layers
- [ ] SVG export
- [ ] Pen pressure sensitivity
- [ ] Bezier handle visibility toggle
- [ ] Animation timeline
- [ ] Collaborative editing

---

**Built with ❤️ using vanilla JavaScript and HTML5 Canvas** 