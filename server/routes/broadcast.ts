//==============================================================================

import type { Message, Peer } from 'crossws'

//==============================================================================

const localPeers: Map<string, Peer> = new Map()

//==============================================================================

export default defineWebSocketHandler({
    open(peer: Peer) {
        console.debug(`[ws] Client connected: ${peer.id}`)

        localPeers.set(peer.id, peer)
    },

    message(peer: Peer, message: Message) {
        const textMessage = message.text()
        console.debug(`[ws] Peer ${peer.id} received: ${textMessage}`)

        // Broadcast the message to all locally connected users
        // but not back to ourself...
        for (const localPeer of localPeers.values()) {
            if (localPeer.id !== peer.id) {
                localPeer.send(textMessage)
            }
        }
    },

    close(peer: Peer, details) {
        console.debug(`[ws] Client disconnected: ${peer.id} (${details.code})`)

        localPeers.delete(peer.id)
    },

    error(peer: Peer, error: Error) {
        console.error(`[ws] Error on peer ${peer.id}:`, error)

        localPeers.delete(peer.id)
    }
})

//==============================================================================
