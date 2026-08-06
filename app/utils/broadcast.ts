//==============================================================================

export type BroadcastObject = {
    type: string
    data: string
    channel?: string
    sender?: string
}

export const BROADCAST_RECEIVED_EVENT = 'broadcast-received'

//==============================================================================

function waitForSocket(socket: WebSocket): Promise<void> {
  return new Promise((resolve, reject) => {
    if (socket.readyState === WebSocket.OPEN) {
      resolve()
      return
    }
    socket.onopen = () => resolve()
    socket.onerror = (error) => reject(error)
  })
}

export class BroadcastChannel {
    #channel: string
    #owner: string
    #socket: WebSocket

    constructor(channel: string, owner: string) {
        this.#channel = channel
        this.#owner = owner
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        this.#socket = new WebSocket(`${protocol}//${window.location.host}/broadcast`)

        this.#socket.onmessage = (event) => {
            // text v's binary...
            const data: BroadcastObject = JSON.parse(event.data)
            if (data.channel === this.#channel) {
                document.dispatchEvent(
                    new CustomEvent(BROADCAST_RECEIVED_EVENT, {
                        detail: { ...data, seq: this.#seq }
                    })
                )
            }
        }
    }

    close() {
        this.#socket.close()
    }

    async send(data: BroadcastObject) {
        data.channel = this.#channel
        data.sender = this.#owner
        try {
            await waitForSocket(this.#socket)
            this.#socket.send(JSON.stringify(data))
        } catch (err) {
            console.error('WebSocket failed to connect', err)
        }
    }
}

//==============================================================================
