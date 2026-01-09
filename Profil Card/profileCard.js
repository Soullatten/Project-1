class InteractiveProfileCard {
    constructor(options = {}) {
        this.wrapper = document.querySelector('.pc-card-wrapper');
        this.shell = document.querySelector('.pc-card-shell');
        this.card = document.querySelector('.pc-card');
        
        this.config = {
            initialDuration: 1200,
            initialXOffset: 70,
            initialYOffset: 60,
            deviceBetaOffset: 20,
            enterTransitionMs: 180,
            enableTilt: true,
            enableMobileTilt: false,
            mobileTiltSensitivity: 5,
            ...options
        };
        
        this.enterTimer = null;
        this.leaveRaf = null;
        this.animationId = null;
        
        this.currentX = 0;
        this.currentY = 0;
        this.targetX = 0;
        this.targetY = 0;
        
        this.running = false;
        this.lastTs = 0;
        this.initialUntil = 0;
        
        this.DEFAULT_TAU = 0.14;
        this.INITIAL_TAU = 0.6;
        
        this.init();
    }
    
    clamp(v, min = 0, max = 100) {
        return Math.min(Math.max(v, min), max);
    }
    
    round(v, precision = 3) {
        return parseFloat(v.toFixed(precision));
    }
    
    adjust(v, fMin, fMax, tMin, tMax) {
        return this.round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));
    }
    
    getOffsets(event, element) {
        const rect = element.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
    
    setVarsFromXY(x, y) {
        if (!this.shell || !this.wrapper) return;
        
        const width = this.shell.clientWidth || 1;
        const height = this.shell.clientHeight || 1;
        
        const percentX = this.clamp((100 / width) * x);
        const percentY = this.clamp((100 / height) * y);
        
        const centerX = percentX - 50;
        const centerY = percentY - 50;
        
        const properties = {
            '--pointer-x': `${percentX}%`,
            '--pointer-y': `${percentY}%`,
            '--background-x': `${this.adjust(percentX, 0, 100, 35, 65)}%`,
            '--background-y': `${this.adjust(percentY, 0, 100, 35, 65)}%`,
            '--pointer-from-center': `${this.clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
            '--pointer-from-top': `${percentY / 100}`,
            '--pointer-from-left': `${percentX / 100}`,
            '--rotate-x': `${this.round(-(centerX / 5))}deg`,
            '--rotate-y': `${this.round(centerY / 4)}deg`
        };
        
        Object.entries(properties).forEach(([key, value]) => {
            this.wrapper.style.setProperty(key, value);
        });
    }
    
    setImmediate(x, y) {
        this.currentX = x;
        this.currentY = y;
        this.setVarsFromXY(x, y);
    }
    
    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.start();
    }
    
    toCenter() {
        if (!this.shell) return;
        this.setTarget(this.shell.clientWidth / 2, this.shell.clientHeight / 2);
    }
    
    beginInitial(durationMs) {
        this.initialUntil = performance.now() + durationMs;
        this.start();
    }
    
    step(timestamp) {
        if (!this.running) return;
        
        if (this.lastTs === 0) this.lastTs = timestamp;
        const dt = (timestamp - this.lastTs) / 1000;
        this.lastTs = timestamp;
        
        const tau = timestamp < this.initialUntil ? this.INITIAL_TAU : this.DEFAULT_TAU;
        const k = 1 - Math.exp(-dt / tau);
        
        this.currentX += (this.targetX - this.currentX) * k;
        this.currentY += (this.targetY - this.currentY) * k;
        
        this.setVarsFromXY(this.currentX, this.currentY);
        
        const stillFar = Math.abs(this.targetX - this.currentX) > 0.05 || 
                        Math.abs(this.targetY - this.currentY) > 0.05;
        
        if (stillFar || document.hasFocus()) {
            this.animationId = requestAnimationFrame(this.step.bind(this));
        } else {
            this.running = false;
            this.lastTs = 0;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }
    }
    
    start() {
        if (this.running || !this.config.enableTilt) return;
        this.running = true;
        this.lastTs = 0;
        this.animationId = requestAnimationFrame(this.step.bind(this));
    }
    
    cancel() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.running = false;
        this.lastTs = 0;
    }
    
    handlePointerMove = (event) => {
        if (!this.shell || !this.config.enableTilt) return;
        const { x, y } = this.getOffsets(event, this.shell);
        this.setTarget(x, y);
    }
    
    handlePointerEnter = (event) => {
        if (!this.shell || !this.config.enableTilt) return;
        
        this.shell.classList.add('active');
        this.shell.classList.add('entering');
        
        if (this.enterTimer) clearTimeout(this.enterTimer);
        this.enterTimer = setTimeout(() => {
            this.shell.classList.remove('entering');
        }, this.config.enterTransitionMs);
        
        const { x, y } = this.getOffsets(event, this.shell);
        this.setTarget(x, y);
    }
    
    handlePointerLeave = () => {
        if (!this.shell || !this.config.enableTilt) return;
        
        this.toCenter();
        
        const checkSettle = () => {
            const settled = Math.hypot(this.targetX - this.currentX, this.targetY - this.currentY) < 0.6;
            if (settled) {
                this.shell.classList.remove('active');
                this.leaveRaf = null;
            } else {
                this.leaveRaf = requestAnimationFrame(checkSettle);
            }
        };
        
        if (this.leaveRaf) cancelAnimationFrame(this.leaveRaf);
        this.leaveRaf = requestAnimationFrame(checkSettle);
    }
    
    handleDeviceOrientation = (event) => {
        if (!this.shell || !this.config.enableTilt) return;
        
        const { beta, gamma } = event;
        if (beta == null || gamma == null) return;
        
        const centerX = this.shell.clientWidth / 2;
        const centerY = this.shell.clientHeight / 2;
        const x = this.clamp(centerX + gamma * this.config.mobileTiltSensitivity, 0, this.shell.clientWidth);
        const y = this.clamp(
            centerY + (beta - this.config.deviceBetaOffset) * this.config.mobileTiltSensitivity,
            0,
            this.shell.clientHeight
        );
        
        this.setTarget(x, y);
    }
    
    handleCardClick = () => {
        if (!this.config.enableMobileTilt || location.protocol !== 'https:') return;
        
        if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission()
                .then(state => {
                    if (state === 'granted') {
                        window.addEventListener('deviceorientation', this.handleDeviceOrientation);
                    }
                })
                .catch(console.error);
        } else {
            window.addEventListener('deviceorientation', this.handleDeviceOrientation);
        }
    }
    
    init() {
        if (!this.config.enableTilt || !this.shell) return;
        
        // Add event listeners
        this.shell.addEventListener('pointerenter', this.handlePointerEnter);
        this.shell.addEventListener('pointermove', this.handlePointerMove);
        this.shell.addEventListener('pointerleave', this.handlePointerLeave);
        this.shell.addEventListener('click', this.handleCardClick);
        
        // Initial animation
        const initialX = (this.shell.clientWidth || 0) - this.config.initialXOffset;
        const initialY = this.config.initialYOffset;
        this.setImmediate(initialX, initialY);
        this.toCenter();
        this.beginInitial(this.config.initialDuration);
        

    }
    
    destroy() {
        if (this.shell) {
            this.shell.removeEventListener('pointerenter', this.handlePointerEnter);
            this.shell.removeEventListener('pointermove', this.handlePointerMove);
            this.shell.removeEventListener('pointerleave', this.handlePointerLeave);
            this.shell.removeEventListener('click', this.handleCardClick);
        }
        
        window.removeEventListener('deviceorientation', this.handleDeviceOrientation);
        
        if (this.enterTimer) clearTimeout(this.enterTimer);
        if (this.leaveRaf) cancelAnimationFrame(this.leaveRaf);
        
        this.cancel();
        this.shell?.classList.remove('entering');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profileCard = new InteractiveProfileCard({
        enableTilt: true,
        enableMobileTilt: false,
        mobileTiltSensitivity: 5
    });
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            window.profileCard.toCenter();
        }, 150);
    });
    
    // Handle page visibility
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            window.profileCard?.cancel();
        }
    });
});