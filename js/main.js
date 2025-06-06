import { SplineRenderer } from './spline.js';
import { UIManager } from './ui.js';

class SplineEditor {
    constructor() {
        this.canvas = document.getElementById('splineCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.splineRenderer = new SplineRenderer(this.canvas, this.ctx);
        this.uiManager = new UIManager();
        
        this.isDragging = false;
        this.dragPointIndex = -1;
        this.mousePos = { x: 0, y: 0 };
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.render();
        
        // Start animation loop
        this.animate();
    }
    
    setupCanvas() {
        const container = this.canvas.parentElement;
        
        const resizeCanvas = () => {
            const rect = container.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
            
            // Set canvas style dimensions
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
            
            this.render();
        };
        
        // Initial resize
        resizeCanvas();
        
        // Handle window resize
        window.addEventListener('resize', resizeCanvas);
    }
    
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('contextmenu', (e) => this.handleRightClick(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // UI button events
        document.getElementById('clearBtn').addEventListener('click', () => {
            // Remove any existing context menu
            const existingMenu = document.getElementById('contextMenu');
            if (existingMenu) {
                existingMenu.remove();
            }
            
            this.splineRenderer.clearPoints();
            this.uiManager.updatePointCount(0);
            this.uiManager.showNotification('All points cleared', 'info', 2000);
            this.render();
        });
        
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportSpline();
        });
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    getTouchPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0] || e.changedTouches[0];
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    }
    
    handleMouseDown(e) {
        e.preventDefault();
        this.mousePos = this.getMousePos(e);
        
        // Check if clicking on existing point
        const pointIndex = this.splineRenderer.getPointAt(this.mousePos.x, this.mousePos.y);
        
        if (pointIndex !== -1) {
            // Select the clicked point
            this.splineRenderer.setSelectedPoint(pointIndex);
            
            // Start dragging existing point
            this.isDragging = true;
            this.dragPointIndex = pointIndex;
            this.canvas.style.cursor = 'grabbing';
        } else {
            // Deselect any previously selected point
            this.splineRenderer.setSelectedPoint(-1);
            
            // Add new point
            this.splineRenderer.addPoint(this.mousePos.x, this.mousePos.y);
            const pointCount = this.splineRenderer.getPointCount();
            this.uiManager.updatePointCount(pointCount);
            
            // Select the newly created point
            const newPointIndex = pointCount - 1;
            this.splineRenderer.setSelectedPoint(newPointIndex);
            
            // Show notification when spline becomes valid
            if (pointCount === this.splineRenderer.minPoints) {
                this.uiManager.showNotification(
                    'Spline is now valid! Add more points to create complex curves.',
                    'success',
                    3000
                );
            }
        }
        
        this.render();
    }
    
    handleMouseMove(e) {
        e.preventDefault();
        this.mousePos = this.getMousePos(e);
        
        if (this.isDragging && this.dragPointIndex !== -1) {
            // Update point position
            this.splineRenderer.updatePoint(this.dragPointIndex, this.mousePos.x, this.mousePos.y);
            this.render();
        } else {
            // Check if hovering over point
            const pointIndex = this.splineRenderer.getPointAt(this.mousePos.x, this.mousePos.y);
            const previousHovered = this.splineRenderer.getHoveredPoint();
            
            // Update hover state
            this.splineRenderer.setHoveredPoint(pointIndex);
            
            // Update cursor
            this.canvas.style.cursor = pointIndex !== -1 ? 'grab' : 'crosshair';
            
            // Re-render if hover state changed
            if (previousHovered !== pointIndex) {
                this.render();
            }
        }
    }
    
    handleMouseUp(e) {
        e.preventDefault();
        this.isDragging = false;
        this.dragPointIndex = -1;
        
        // Update cursor based on hover state
        const pointIndex = this.splineRenderer.getPointAt(this.mousePos.x, this.mousePos.y);
        this.canvas.style.cursor = pointIndex !== -1 ? 'grab' : 'crosshair';
    }
    
    handleRightClick(e) {
        e.preventDefault();
        const mousePos = this.getMousePos(e);
        const pointIndex = this.splineRenderer.getPointAt(mousePos.x, mousePos.y);
        
        if (pointIndex !== -1) {
            // Check if we can remove the point (minimum 2 points required)
            if (this.splineRenderer.canRemovePoint()) {
                // Show context menu
                this.showContextMenu(e, pointIndex);
            } else {
                // Show notification that minimum points are required
                this.uiManager.showNotification(
                    `Cannot remove point. Minimum ${this.splineRenderer.minPoints} points required for a valid spline.`,
                    'warning'
                );
            }
        }
    }
    
    // Touch event handlers
    handleTouchStart(e) {
        e.preventDefault();
        const touch = this.getTouchPos(e);
        this.handleMouseDown({ clientX: touch.x, clientY: touch.y, preventDefault: () => {} });
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const touch = this.getTouchPos(e);
        this.handleMouseMove({ clientX: touch.x, clientY: touch.y, preventDefault: () => {} });
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.handleMouseUp({ preventDefault: () => {} });
    }
    
    showContextMenu(e, pointIndex) {
        // Remove any existing context menu
        const existingMenu = document.getElementById('contextMenu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        // Create context menu
        const contextMenu = document.createElement('div');
        contextMenu.id = 'contextMenu';
        contextMenu.style.cssText = `
            position: fixed;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            background: #333;
            border: 1px solid #555;
            border-radius: 6px;
            padding: 8px 0;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            min-width: 150px;
        `;
        
        // Create delete option
        const deleteOption = document.createElement('div');
        deleteOption.textContent = `Delete Point ${pointIndex}`;
        deleteOption.style.cssText = `
            padding: 8px 16px;
            color: #e0e0e0;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
        `;
        
        deleteOption.addEventListener('mouseenter', () => {
            deleteOption.style.backgroundColor = '#ef4444';
        });
        
        deleteOption.addEventListener('mouseleave', () => {
            deleteOption.style.backgroundColor = 'transparent';
        });
        
        deleteOption.addEventListener('click', () => {
            const success = this.splineRenderer.removePoint(pointIndex);
            if (success) {
                this.uiManager.updatePointCount(this.splineRenderer.getPointCount());
                this.uiManager.showNotification(`Point ${pointIndex} deleted`, 'success', 2000);
                this.render();
            }
            contextMenu.remove();
        });
        
        contextMenu.appendChild(deleteOption);
        document.body.appendChild(contextMenu);
        
        // Close context menu when clicking elsewhere
        const closeMenu = (event) => {
            if (!contextMenu.contains(event.target)) {
                contextMenu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        
        // Delay adding the click listener to prevent immediate closure
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 10);
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Render spline
        this.splineRenderer.render();
    }
    
    drawGrid() {
        const gridSize = 20;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    animate() {
        this.render();
        requestAnimationFrame(() => this.animate());
    }
    
    deleteSelectedPoint() {
        const selectedIndex = this.splineRenderer.getSelectedPoint();
        if (selectedIndex !== -1) {
            if (this.splineRenderer.canRemovePoint()) {
                const success = this.splineRenderer.removePoint(selectedIndex);
                if (success) {
                    this.uiManager.updatePointCount(this.splineRenderer.getPointCount());
                    this.uiManager.showNotification(`Point ${selectedIndex} deleted`, 'success', 2000);
                    this.render();
                }
            } else {
                this.uiManager.showNotification(
                    `Cannot remove point. Minimum ${this.splineRenderer.minPoints} points required for a valid spline.`,
                    'warning'
                );
            }
        } else {
            this.uiManager.showNotification('No point selected', 'info', 1500);
        }
    }
    
    clearSelection() {
        // Remove any context menus
        const contextMenu = document.getElementById('contextMenu');
        if (contextMenu) {
            contextMenu.remove();
        }
        
        // Clear selection
        this.splineRenderer.setSelectedPoint(-1);
        this.render();
        this.uiManager.showNotification('Selection cleared', 'info', 1500);
    }
    
    exportSpline() {
        const points = this.splineRenderer.getPoints();
        const splineData = {
            points: points,
            canvasSize: {
                width: this.canvas.width,
                height: this.canvas.height
            },
            timestamp: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(splineData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `spline_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize the spline editor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.splineEditor = new SplineEditor();
}); 