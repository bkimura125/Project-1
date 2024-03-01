const requestService = require('../service/RequestService');

class RequestQueue {
    constructor() {
        this.queue = [];
        this.requestService = requestService;
        this.initialized = false;
    }

    async initialize() {
        if (!this.initialized) {
            try {
                this.queue = await this.requestService.queryRequestByStatus();
                this.initialized = true;
            } catch (error) {
                console.error('Error initializing RequestQueue:', error);
            }
        }
    }

    async addRequest(request) {
        this.queue.push(request);
    }

    async processNextRequest() {
        if (this.queue.length > 0) {
            return this.queue.shift();
        } else {
            return null; // Queue is empty
        }
    }

    async getAllRequests() {
        return this.queue;
    }
}

module.exports = RequestQueue;