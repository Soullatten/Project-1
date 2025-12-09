class ScrollReveal {
            constructor() {
                this.defaults = {
                    blur: false,
                    duration: 1000,
                    easing: 'ease-out',
                    delay: 0,
                    threshold: 0.1,
                    initialOpacity: 0
                };
                
                this.properties = { ...this.defaults };
                this.observers = new Map();
                this.revealedElements = new Set();
                
                this.init();
            }
            
            init() {
                this.bindControls();
                this.observeAllElements();
                this.updateAllElements();
                
                // Listen for new elements added dynamically
                const observer = new MutationObserver(() => {
                    this.observeAllElements();
                });
                
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
            
            bindControls() {
                // Blur toggle
                document.getElementById('blurToggle').addEventListener('change', (e) => {
                    this.properties.blur = e.target.value === 'true';
                    this.updateAllElements();
                });
                
                // Duration
                const duration = document.getElementById('duration');
                const durationValue = document.getElementById('durationValue');
                duration.addEventListener('input', (e) => {
                    this.properties.duration = parseInt(e.target.value);
                    durationValue.textContent = this.properties.duration;
                    this.updateAllElements();
                });
                
                // Easing
                document.getElementById('easing').addEventListener('change', (e) => {
                    this.properties.easing = e.target.value;
                    this.updateAllElements();
                });
                
                // Delay
                const delay = document.getElementById('delay');
                const delayValue = document.getElementById('delayValue');
                delay.addEventListener('input', (e) => {
                    this.properties.delay = parseInt(e.target.value);
                    delayValue.textContent = this.properties.delay;
                });
                
                // Threshold
                const threshold = document.getElementById('threshold');
                const thresholdValue = document.getElementById('thresholdValue');
                threshold.addEventListener('input', (e) => {
                    const value = parseInt(e.target.value);
                    this.properties.threshold = value / 100;
                    thresholdValue.textContent = value;
                    this.restartObservation();
                });
                
                // Initial Opacity
                const initialOpacity = document.getElementById('initialOpacity');
                const opacityValue = document.getElementById('opacityValue');
                initialOpacity.addEventListener('input', (e) => {
                    const value = parseInt(e.target.value);
                    this.properties.initialOpacity = value / 100;
                    opacityValue.textContent = (value / 100).toFixed(1);
                    this.updateAllElements();
                });
            }
            
            observeAllElements() {
                const elements = document.querySelectorAll('[data-reveal]');
                
                elements.forEach(element => {
                    // Skip if already revealed or being observed
                    if (this.revealedElements.has(element) || this.observers.has(element)) {
                        return;
                    }
                    
                    // Set initial state
                    this.setElementState(element, false);
                    
                    // Create observer for this element
                    const observer = new IntersectionObserver(
                        ([entry]) => {
                            if (entry.isIntersecting) {
                                observer.unobserve(element);
                                this.observers.delete(element);
                                
                                setTimeout(() => {
                                    this.setElementState(element, true);
                                    this.revealedElements.add(element);
                                }, this.properties.delay);
                            }
                        },
                        { threshold: this.properties.threshold }
                    );
                    
                    observer.observe(element);
                    this.observers.set(element, observer);
                });
            }
            
            setElementState(element, inView) {
                const style = element.style;
                
                if (inView) {
                    style.opacity = '1';
                    style.filter = this.properties.blur ? 'blur(0px)' : 'none';
                } else {
                    style.opacity = this.properties.initialOpacity.toString();
                    style.filter = this.properties.blur ? 'blur(10px)' : 'none';
                }
                
                style.transition = `opacity ${this.properties.duration}ms ${this.properties.easing}, filter ${this.properties.duration}ms ${this.properties.easing}`;
                style.willChange = 'opacity, filter';
            }
            
            updateAllElements() {
                // Update all revealed elements with new properties
                this.revealedElements.forEach(element => {
                    this.setElementState(element, true);
                });
                
                // Update all observed elements
                this.observers.forEach((observer, element) => {
                    this.setElementState(element, false);
                });
            }
            
            restartObservation() {
                // Clear all observers
                this.observers.forEach(observer => observer.disconnect());
                this.observers.clear();
                
                // Reset revealed elements to be observed again
                this.revealedElements.clear();
                
                // Restart observation
                this.observeAllElements();
            }
            
            resetAll() {
                this.properties = { ...this.defaults };
                
                // Reset control values
                document.getElementById('blurToggle').value = 'false';
                document.getElementById('duration').value = '1000';
                document.getElementById('durationValue').textContent = '1000';
                document.getElementById('easing').value = 'ease-out';
                document.getElementById('delay').value = '0';
                document.getElementById('delayValue').textContent = '0';
                document.getElementById('threshold').value = '10';
                document.getElementById('thresholdValue').textContent = '10';
                document.getElementById('initialOpacity').value = '0';
                document.getElementById('opacityValue').textContent = '0.0';
                
                this.restartObservation();
            }
        }
        
        // Initialize when page loads
        window.addEventListener('DOMContentLoaded', () => {
            window.scrollReveal = new ScrollReveal();
            
            // Add reset button to controls
            const controls = document.querySelector('.controls');
            const resetBtn = document.createElement('button');
            resetBtn.textContent = 'Reset to Defaults';
            resetBtn.style.cssText = `
                grid-column: 1 / -1;
                padding: 12px 24px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.3s;
            `;
            resetBtn.onmouseover = () => resetBtn.style.background = '#5a6fd8';
            resetBtn.onmouseout = () => resetBtn.style.background = '#667eea';
            resetBtn.onclick = () => window.scrollReveal.resetAll();
            controls.appendChild(resetBtn);
        });