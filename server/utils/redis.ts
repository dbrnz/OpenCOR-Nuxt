import { Redis } from 'ioredis'

let redisPublishClient: Redis | null = null
let redisSubscribeClient: Redis | null = null

export function getRedisClient(type: 'pub' | 'sub' = 'pub') {
    const config = useRuntimeConfig()
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

    if (type === 'sub') {
        if (!redisSubscribeClient) {
            redisSubscribeClient = new Redis(redisUrl)
        }
        return redisSubscribeClient
    }

    if (!redisPublishClient) {
        redisPublishClient = new Redis(redisUrl)
    }
    return redisPublishClient
}
