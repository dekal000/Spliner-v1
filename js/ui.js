export class UIManager {
    constructor() {
        this.pointCountElement = document.getElementById('pointCount');
        this.clearButton = document.getElementById('clearBtn');
        this.exportButton = document.getElementById('exportBtn');
        
        this.setupUI();
    }
    
    setupUI() {
        // Add hover effects and tooltips
        this.addTooltip(this.clearButton, 'Clear all points from the canvas');
        this.addTooltip(this.exportButton, 'Export spline data as JSON file');
        
        // Add keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Add responsive behavior
        this.setupResponsiveBehavior();
    }
    
    addTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 5px 8px;
            border-radius: 4px;
            font-size: 12px;
            pointer-events: none;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s;
            white-space: nowrap;
        `;
        
        document.body.appendChild(tooltip);
        
        element.addEventListener('mouseenter', (e) => {
            const rect = element.getBoundingClientRect();
            tooltip.style.left = rect.left + 'px';
            tooltip.style.top = (rect.bottom + 5) + 'px';
            tooltip.style.opacity = '1';
        });
        
        element.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Prevent default behavior for our shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'delete':
                    case 'backspace':
                        e.preventDefault();
                        this.clearButton.click();
                        break;
                    case 's':
                        e.preventDefault();
                        this.exportButton.click();
                        break;
                    case 'z':
                        e.preventDefault();
                        // TODO: Implement undo functionality
                        this.showNotification('Undo not yet implemented');
                        break;
                }
            }
            
            // ESC key to clear selection
            if (e.key === 'Escape') {
                // TODO: Clear any active selections
                this.showNotification('Selection cleared');
            }
        });
    }
    
    setupResponsiveBehavior() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.updateLayout();
        });
        
        // Initial layout update
        this.updateLayout();
    }
    
    updateLayout() {
        // Adjust UI elements based on screen size
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // Mobile-specific adjustments
            this.pointCountElement.style.display = 'none';
        } else {
            this.pointCountElement.style.display = 'inline';
        }
    }
    
    updatePointCount(count) {
        if (this.pointCountElement) {
            this.pointCountElement.textContent = `Points: ${count}`;
            
            // Add animation effect
            this.pointCountElement.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.pointCountElement.style.transform = 'scale(1)';
            }, 150);
        }
    }
    
    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Styling
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 1001;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
    
    getNotificationColor(type) {
        switch (type) {
            case 'success':
                return '#10b981';
            case 'error':
                return '#ef4444';
            case 'warning':
                return '#f59e0b';
            default:
                return '#60a5fa';
        }
    }
    
    // Progress indicator for long operations
    showProgress(show = true, message = 'Processing...') {
        let progressOverlay = document.getElementById('progressOverlay');
        
        if (show) {
            if (!progressOverlay) {
                progressOverlay = document.createElement('div');
                progressOverlay.id = 'progressOverlay';
                progressOverlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 2000;
                    opacity: 0;
                    transition: opacity 0.3s;
                `;
                
                const progressContent = document.createElement('div');
                progressContent.style.cssText = `
                    background: #333;
                    padding: 30px;
                    border-radius: 10px;
                    text-align: center;
                    color: white;
                `;
                
                const spinner = document.createElement('div');
                spinner.style.cssText = `
                    width: 40px;
                    height: 40px;
                    border: 4px solid #60a5fa;
                    border-top: 4px solid transparent;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 15px;
                `;
                
                const messageElement = document.createElement('div');
                messageElement.textContent = message;
                messageElement.style.fontSize = '16px';
                
                progressContent.appendChild(spinner);
                progressContent.appendChild(messageElement);
                progressOverlay.appendChild(progressContent);
                document.body.appendChild(progressOverlay);
                
                // Add CSS animation
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            setTimeout(() => {
                progressOverlay.style.opacity = '1';
            }, 10);
            
        } else if (progressOverlay) {
            progressOverlay.style.opacity = '0';
            setTimeout(() => {
                if (progressOverlay.parentNode) {
                    progressOverlay.parentNode.removeChild(progressOverlay);
                }
            }, 300);
        }
    }
    
    // Theme toggle functionality
    toggleTheme() {
        const body = document.body;
        const isDark = body.classList.contains('dark-theme');
        
        if (isDark) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        }
        
        this.showNotification(`Switched to ${isDark ? 'light' : 'dark'} theme`);
    }
    
    // Initialize theme from localStorage
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.classList.add(`${savedTheme}-theme`);
    }
    
    // Utility methods for UI state management
    enableButton(button) {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    }
    
    disableButton(button) {
        button.disabled = true;
        button.style.opacity = '0.5';
        button.style.cursor = 'not-allowed';
    }
    
    // Animation helpers
    animateElement(element, keyframes, duration = 300) {
        return element.animate(keyframes, {
            duration: duration,
            easing: 'ease-out',
            fill: 'forwards'
        });
    }
    
    // Cleanup method
    destroy() {
        // Remove event listeners and clean up
        const tooltips = document.querySelectorAll('.tooltip');
        tooltips.forEach(tooltip => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        });
        
        const progressOverlay = document.getElementById('progressOverlay');
        if (progressOverlay && progressOverlay.parentNode) {
            progressOverlay.parentNode.removeChild(progressOverlay);
        }
    }
} 