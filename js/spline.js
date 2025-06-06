export class SplineRenderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.points = [];
        this.controlPoints = [];
        this.selectedPointIndex = -1;
        this.hoveredPointIndex = -1;
        
        // Visual settings
        this.pointRadius = 6;
        this.controlPointRadius = 4;
        this.splineColor = '#60a5fa';
        this.pointColor = '#fbbf24';
        this.pointHoverColor = '#f59e0b';
        this.controlLineColor = 'rgba(251, 191, 36, 0.5)';
        this.selectedPointColor = '#ef4444';
        this.pointStrokeColor = '#ffffff';
        this.pointStrokeWidth = 2;
        
        // Minimum points required for a valid spline
        this.minPoints = 2;
    }
    
    addPoint(x, y) {
        this.points.push({ x, y });
        this.updateControlPoints();
    }
    
    removePoint(index) {
        if (index >= 0 && index < this.points.length && this.canRemovePoint()) {
            this.points.splice(index, 1);
            
            // Adjust selected point index if necessary
            if (this.selectedPointIndex === index) {
                this.selectedPointIndex = -1;
            } else if (this.selectedPointIndex > index) {
                this.selectedPointIndex--;
            }
            
            // Adjust hovered point index if necessary
            if (this.hoveredPointIndex === index) {
                this.hoveredPointIndex = -1;
            } else if (this.hoveredPointIndex > index) {
                this.hoveredPointIndex--;
            }
            
            this.updateControlPoints();
            return true;
        }
        return false;
    }
    
    updatePoint(index, x, y) {
        if (index >= 0 && index < this.points.length) {
            this.points[index] = { x, y };
            this.updateControlPoints();
        }
    }
    
    getPointAt(x, y) {
        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];
            const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
            if (distance <= this.pointRadius + 5) {
                return i;
            }
        }
        return -1;
    }
    
    setHoveredPoint(index) {
        this.hoveredPointIndex = index;
    }
    
    setSelectedPoint(index) {
        this.selectedPointIndex = index;
    }
    
    getSelectedPoint() {
        return this.selectedPointIndex;
    }
    
    getHoveredPoint() {
        return this.hoveredPointIndex;
    }
    
    canRemovePoint() {
        return this.points.length > this.minPoints;
    }
    
    isValidSpline() {
        return this.points.length >= this.minPoints;
    }
    
    getPoints() {
        return [...this.points];
    }
    
    getPointCount() {
        return this.points.length;
    }
    
    clearPoints() {
        this.points = [];
        this.controlPoints = [];
        this.selectedPointIndex = -1;
        this.hoveredPointIndex = -1;
    }
    
    updateControlPoints() {
        if (this.points.length < 2) {
            this.controlPoints = [];
            return;
        }
        
        this.controlPoints = [];
        
        for (let i = 0; i < this.points.length; i++) {
            if (i === 0) {
                // First point
                const next = this.points[i + 1];
                const current = this.points[i];
                const dx = next.x - current.x;
                const dy = next.y - current.y;
                
                this.controlPoints.push({
                    cp1: { x: current.x, y: current.y },
                    cp2: { x: current.x + dx * 0.3, y: current.y + dy * 0.3 }
                });
            } else if (i === this.points.length - 1) {
                // Last point
                const prev = this.points[i - 1];
                const current = this.points[i];
                const dx = current.x - prev.x;
                const dy = current.y - prev.y;
                
                this.controlPoints.push({
                    cp1: { x: current.x - dx * 0.3, y: current.y - dy * 0.3 },
                    cp2: { x: current.x, y: current.y }
                });
            } else {
                // Middle points
                const prev = this.points[i - 1];
                const current = this.points[i];
                const next = this.points[i + 1];
                
                // Calculate tangent
                const dx = next.x - prev.x;
                const dy = next.y - prev.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                const unitX = dx / length;
                const unitY = dy / length;
                
                const controlDistance = Math.min(
                    Math.sqrt(Math.pow(current.x - prev.x, 2) + Math.pow(current.y - prev.y, 2)),
                    Math.sqrt(Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2))
                ) * 0.3;
                
                this.controlPoints.push({
                    cp1: {
                        x: current.x - unitX * controlDistance,
                        y: current.y - unitY * controlDistance
                    },
                    cp2: {
                        x: current.x + unitX * controlDistance,
                        y: current.y + unitY * controlDistance
                    }
                });
            }
        }
    }
    
    render() {
        if (this.points.length === 0) return;
        
        // Only draw spline curve if we have enough points
        if (this.isValidSpline()) {
            this.drawSpline();
        }
        
        // Draw control lines (optional, for debugging)
        // this.drawControlLines();
        
        // Always draw points (even if spline is not valid)
        this.drawPoints();
    }
    
    drawSpline() {
        if (this.points.length < 2) return;
        
        this.ctx.strokeStyle = this.splineColor;
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Add glow effect
        this.ctx.shadowColor = this.splineColor;
        this.ctx.shadowBlur = 10;
        
        this.ctx.beginPath();
        
        if (this.points.length === 2) {
            // Simple line for two points
            this.ctx.moveTo(this.points[0].x, this.points[0].y);
            this.ctx.lineTo(this.points[1].x, this.points[1].y);
        } else {
            // Smooth spline for multiple points
            this.ctx.moveTo(this.points[0].x, this.points[0].y);
            
            for (let i = 0; i < this.points.length - 1; i++) {
                const current = this.points[i];
                const next = this.points[i + 1];
                const currentControl = this.controlPoints[i];
                const nextControl = this.controlPoints[i + 1];
                
                this.ctx.bezierCurveTo(
                    currentControl.cp2.x, currentControl.cp2.y,
                    nextControl.cp1.x, nextControl.cp1.y,
                    next.x, next.y
                );
            }
        }
        
        this.ctx.stroke();
        
        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }
    
    drawControlLines() {
        if (this.controlPoints.length === 0) return;
        
        this.ctx.strokeStyle = this.controlLineColor;
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        
        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];
            const control = this.controlPoints[i];
            
            // Draw control lines
            this.ctx.beginPath();
            this.ctx.moveTo(point.x, point.y);
            this.ctx.lineTo(control.cp1.x, control.cp1.y);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(point.x, point.y);
            this.ctx.lineTo(control.cp2.x, control.cp2.y);
            this.ctx.stroke();
        }
        
        this.ctx.setLineDash([]);
    }
    
    drawPoints() {
        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];
            const isSelected = i === this.selectedPointIndex;
            const isHovered = i === this.hoveredPointIndex;
            
            // Draw point shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(point.x + 1, point.y + 1, this.pointRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Determine point color based on state
            let pointColor = this.pointColor;
            if (isSelected) {
                pointColor = this.selectedPointColor;
            } else if (isHovered) {
                pointColor = this.pointHoverColor;
            }
            
            // Draw point fill
            this.ctx.fillStyle = pointColor;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, this.pointRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw point border
            this.ctx.strokeStyle = this.pointStrokeColor;
            this.ctx.lineWidth = this.pointStrokeWidth;
            this.ctx.stroke();
            
            // Draw point number
            this.ctx.fillStyle = '#000000';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(i.toString(), point.x, point.y);
            
            // Add a subtle glow effect for selected points
            if (isSelected) {
                this.ctx.shadowColor = this.selectedPointColor;
                this.ctx.shadowBlur = 8;
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, this.pointRadius + 2, 0, Math.PI * 2);
                this.ctx.strokeStyle = this.selectedPointColor;
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
                this.ctx.shadowColor = 'transparent';
                this.ctx.shadowBlur = 0;
            }
        }
    }
    
    // Mathematical helper functions
    static lerp(start, end, t) {
        return start + (end - start) * t;
    }
    
    static cubicBezier(p0, p1, p2, p3, t) {
        const oneMinusT = 1 - t;
        const oneMinusT2 = oneMinusT * oneMinusT;
        const oneMinusT3 = oneMinusT2 * oneMinusT;
        const t2 = t * t;
        const t3 = t2 * t;
        
        return {
            x: oneMinusT3 * p0.x + 3 * oneMinusT2 * t * p1.x + 3 * oneMinusT * t2 * p2.x + t3 * p3.x,
            y: oneMinusT3 * p0.y + 3 * oneMinusT2 * t * p1.y + 3 * oneMinusT * t2 * p2.y + t3 * p3.y
        };
    }
    
    getSplineLength() {
        if (this.points.length < 2) return 0;
        
        let totalLength = 0;
        const samples = 100;
        
        for (let i = 0; i < this.points.length - 1; i++) {
            const current = this.points[i];
            const next = this.points[i + 1];
            const currentControl = this.controlPoints[i];
            const nextControl = this.controlPoints[i + 1];
            
            let prevPoint = current;
            
            for (let j = 1; j <= samples; j++) {
                const t = j / samples;
                const point = SplineRenderer.cubicBezier(
                    current,
                    currentControl.cp2,
                    nextControl.cp1,
                    next,
                    t
                );
                
                const dx = point.x - prevPoint.x;
                const dy = point.y - prevPoint.y;
                totalLength += Math.sqrt(dx * dx + dy * dy);
                
                prevPoint = point;
            }
        }
        
        return totalLength;
    }
    
    getPointOnSpline(t) {
        if (this.points.length < 2) return null;
        
        const segmentCount = this.points.length - 1;
        const segmentT = t * segmentCount;
        const segmentIndex = Math.floor(segmentT);
        const localT = segmentT - segmentIndex;
        
        if (segmentIndex >= segmentCount) {
            return this.points[this.points.length - 1];
        }
        
        const current = this.points[segmentIndex];
        const next = this.points[segmentIndex + 1];
        const currentControl = this.controlPoints[segmentIndex];
        const nextControl = this.controlPoints[segmentIndex + 1];
        
        return SplineRenderer.cubicBezier(
            current,
            currentControl.cp2,
            nextControl.cp1,
            next,
            localT
        );
    }
} 