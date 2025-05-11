class WebSocketService {
    constructor() {
        this.url = "ws://localhost:3000";
        this.socket = new WebSocket(this.url);
    }

    connect() {
        this.socket.onopen = () => console.log("Connected to WebSocket.");
        this.socket.onerror = (error) => console.error("WebSocket error:", error);
        this.socket.onclose = () => console.log("WebSocket connection closed.");
    }

    onMessage(callback) {
        this.socket.onmessage = callback;
    }

    sendMessage(message) {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            console.error("WebSocket is not open. Ready state: ", this.socket.readyState);
        }
    }

    close() {
        this.socket.close();
    }
}

export default WebSocketService;