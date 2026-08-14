import Redis from "ioredis";

function createRedisConnection() {
    return new Redis({
        host: "localhost",
        port: 6379,
    });
}

export const publisher = createRedisConnection();
export const subscriber = createRedisConnection();
//useful for read/write operations
export const redis = createRedisConnection();
