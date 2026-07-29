import { getRedisClient } from '#server/utils/redis'

export const OPENCOR_CHANNEL = 'opencor'

// Track locally connected WebSocket clients on this server instance
const localPeers = new Set<any>()

// Initialize the Redis Subscription listener
const subClient = getRedisClient('sub')
const pubClient = getRedisClient('pub')

subClient.subscribe(OPENCOR_CHANNEL)
subClient.on('message', (channel, message) => {
    if (channel === OPENCOR_CHANNEL) {
        // Broadcast the message received from Redis to all locally connected users
        const parsedMessage = JSON.parse(message)
        for (const peer of localPeers) {
            peer.send(parsedMessage)
        }
    }
})

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

        // Publish message to Redis instead of sending it locally.
        // This scales across multiple server instances perfectly.
        await pubClient.publish(OPENCOR_CHANNEL, JSON.stringify(payload))
    },

    close(peer) {
        localPeers.delete(peer)
    },

    error(peer, error) {
        console.error('WebSocket Error:', error)
        localPeers.delete(peer)
    }
})
