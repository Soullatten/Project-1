
        class SparkEffect {
            constructor() {
                this.canvas = document.getElementById('canvas');
                this.ctx = this.canvas.getContext('2d');
                this.container = document.getElementById('container');
                this.sparks = [];
                this.animationId = null;
                
                // Default properties
                this.properties = {
                    sparkColor: '#ffffff',
                    sparkSize: 10,
                    sparkRadius: 15,
                    sparkCount: 8,
                    duration: 400,
                    easing: 'ease-out',
                    extraScale: 1.0
                };
                
                this.init();
            }
            
            init() {
                this.setupCanvas();
                this.bindEvents();
                this.bindControls();
                this.startAnimation();
            }
            
            setupCanvas() {
                const resize = () => {
                    this.canvas.width = this.container.clientWidth;
                    this.canvas.height = this.container.clientHeight;
                };
                
                resize();
                window.addEventListener('resize', resize);
                
                // Also observe container resize
                const resizeObserver = new ResizeObserver(() => {
                    resize();
                });
                resizeObserver.observe(this.container);
            }
            
            bindEvents() {
                this.container.addEventListener('click', (e) => this.handleClick(e));
            }
            
            bindControls() {
                // Color
                document.getElementById('sparkColor').addEventListener('input', (e) => {
                    this.properties.sparkColor = e.target.value;
                });
                
                // Spark Size
                const sparkSize = document.getElementById('sparkSize');
                const sizeValue = document.getElementById('sizeValue');
                sparkSize.addEventListener('input', (e) => {
                    this.properties.sparkSize = parseInt(e.target.value);
                    sizeValue.textContent = this.properties.sparkSize;
                });
                
                // Spark Radius
                const sparkRadius = document.getElementById('sparkRadius');
                const radiusValue = document.getElementById('radiusValue');
                sparkRadius.addEventListener('input', (e) => {
                    this.properties.sparkRadius = parseInt(e.target.value);
                    radiusValue.textContent = this.properties.sparkRadius;
                });
                
                // Spark Count
                const sparkCount = document.getElementById('sparkCount');
                const countValue = document.getElementById('countValue');
                sparkCount.addEventListener('input', (e) => {
                    this.properties.sparkCount = parseInt(e.target.value);
                    countValue.textContent = this.properties.sparkCount;
                });
                
                // Duration
                const duration = document.getElementById('duration');
                const durationValue = document.getElementById('durationValue');
                duration.addEventListener('input', (e) => {
                    this.properties.duration = parseInt(e.target.value);
                    durationValue.textContent = this.properties.duration;
                });
                
                // Easing
                document.getElementById('easing').addEventListener('change', (e) => {
                    this.properties.easing = e.target.value;
                });
                
                // Extra Scale
                const extraScale = document.getElementById('extraScale');
                const scaleValue = document.getElementById('scaleValue');
                extraScale.addEventListener('input', (e) => {
                    this.properties.extraScale = parseFloat(e.target.value);
                    scaleValue.textContent = this.properties.extraScale.toFixed(1);
                });
            }
            
            getEaseFunction(t) {
                switch (this.properties.easing) {
                    case 'linear':
                        return t;
                    case 'ease-in':
                        return t * t;
                    case 'ease-in-out':
                        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                    default: // ease-out
                        return t * (2 - t);
                }
            }
            
            handleClick(e) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const now = performance.now();
                const newSparks = [];
                
                for (let i = 0; i < this.properties.sparkCount; i++) {
                    newSparks.push({
                        x,
                        y,
                        angle: (2 * Math.PI * i) / this.properties.sparkCount,
                        startTime: now
                    });
                }
                
                this.sparks.push(...newSparks);
            }
            
            draw(timestamp) {
                // Clear canvas
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Update and draw sparks
                this.sparks = this.sparks.filter((spark) => {
                    const elapsed = timestamp - spark.startTime;
                    
                    // Remove spark if duration has passed
                    if (elapsed >= this.properties.duration) {
                        return false;
                    }
                    
                    // Calculate progress
                    const progress = elapsed / this.properties.duration;
                    const eased = this.getEaseFunction(progress);
                    
                    // Calculate position
                    const distance = eased * this.properties.sparkRadius * this.properties.extraScale;
                    const lineLength = this.properties.sparkSize * (1 - eased);
                    
                    const x1 = spark.x + distance * Math.cos(spark.angle);
                    const y1 = spark.y + distance * Math.sin(spark.angle);
                    const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
                    const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);
                    
                    // Draw spark line
                    this.ctx.strokeStyle = this.properties.sparkColor;
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.stroke();
                    
                    return true;
                });
                
                // Continue animation
                this.animationId = requestAnimationFrame((ts) => this.draw(ts));
            }
            
            startAnimation() {
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                }
                this.animationId = requestAnimationFrame((ts) => this.draw(ts));
            }
        }
        
        // Initialize the spark effect when page loads
        window.addEventListener('DOMContentLoaded', () => {
            new SparkEffect();
        });