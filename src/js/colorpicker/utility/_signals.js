export class Signal {
    constructor() {
        this.subscribers = [];
    }

    on(fn) {
        this.subscribers.push(fn);
    }

    off(fn) {
        this.subscribers = this.subscribers.filter(el => el !== fn);
    }

    emit(data) {
        this.subscribers.forEach(el => el(data));
    }
}

export const globalSignals = {
    colorChange : new Signal()
}