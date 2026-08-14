import { createServer } from "node:http";
import path from "path";

import express from "express";
import { Server } from "socket.io";

import { publisher, subscriber, redis } from "./redis-connection.js";

const CHECKBOX_COUNT = 100;

const CHECKBOX_STATE_KEY = "checkbox-state";

async function main() {
    const PORT = process.env.PORT ?? 8000;

    const app = express();
    app.use(express.static(path.resolve("./public")));
    //express.static first check for routes , if no routes found then go to public folder by default

    const httpServer = createServer(app);

    const io = new Server();
    io.attach(httpServer);

    await subscriber.subscribe("internal-server:checkbox:changed");
    subscriber.on("message", (channel, message) => {
        if (channel === "internal-server:checkbox:changed") {
            const data = JSON.parse(message);
            io.emit("server:checkbox:changed", data);
        }
    });

    //socket io handlers
    io.on("connection", (socket) => {
        console.log("Socket Connected", { id: socket.id });

        socket.on("client:checkbox:changed", async (data) => {
            console.log(`[Socket:${socket.id}]:client:checkbox:change`, data);
            const { index, checked } = data;

            const existingState = await redis.get(CHECKBOX_STATE_KEY);
            if (existingState) {
                const remoteData = await JSON.parse(existingState);
                remoteData[index] = checked;
                await redis.set(CHECKBOX_STATE_KEY, JSON.stringify(remoteData));
            } else {
                await redis.set(CHECKBOX_STATE_KEY, JSON.stringify(new Array(CHECKBOX_COUNT).fill(false)));
            }

            await publisher.publish("internal-server:checkbox:changed", JSON.stringify(data));
        });
    });

    //express handlers
    app.get("/health", (req, res) => {
        return res.json({ healthy: true });
    });

    app.get("/checkboxes", async (req, res) => {
        const existingState = await redis.get(CHECKBOX_STATE_KEY);
        if (existingState) {
            const data = await JSON.parse(existingState);
            return res.json({ checkboxes: data });
        }
        return res.json({ checkboxes: new Array(CHECKBOX_COUNT).fill(false) });
    });

    httpServer.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
}

main();
