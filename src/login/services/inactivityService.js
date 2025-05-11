// src/services/inactivityService.js

class CustomEventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    emit(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(...args));
        }
    }

    off(event, listenerToRemove) {
        if (!this.events[event]) return;

        this.events[event] = this.events[event].filter(listener => listener !== listenerToRemove);
    }
}

class InactivityService extends CustomEventEmitter {
    constructor(timeout = 10800000) { // 1 minute in milliseconds
        super();
        this.timeout = timeout;
        this.events = ['mousemove', 'keydown', 'scroll', 'click'];
        this.resetTimer = this.resetTimer.bind(this);
        this.startTimer();
    }

    startTimer() {
        this.timer = setTimeout(() => {
            this.emit('timeout');
        }, this.timeout);

        this.events.forEach(event => {
            window.addEventListener(event, this.resetTimer);
        });
    }

    resetTimer() {
        clearTimeout(this.timer);
        this.startTimer();
    }

    stopTimer() {
        clearTimeout(this.timer);
        this.events.forEach(event => {
            window.removeEventListener(event, this.resetTimer);
        });
    }
}

export default new InactivityService();