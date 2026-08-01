// Track locally connected WebSocket clients on this server instance
const localPeers = new Set<any>()

export default defineWebSocketHandler({
    open(peer) {
        localPeers.add(peer)
    },

    async message(peer, message) {
        const data = JSON.parse(message.text())

        const payload = {
            user: data.user || 'Anonymous',
            text: data.text,
            timestamp: Date.now()
        }

        // Broadcast the message to all locally connected users
        for (const peer of localPeers) {
            // but don't send back to ourself...
            peer.send(payload)
        }
    },

    close(peer) {
        localPeers.delete(peer)
    },

    error(peer, error) {
        console.error('WebSocket Error:', error)
        localPeers.delete(peer)
    }
})
