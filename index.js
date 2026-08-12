import { createServer } from "node:http";
import path from "path";

import express from "express";
import { Server } from "socket.io";

const CHECKBOX_COUNT = 100;
const state = {
    checkboxes: new Array(CHECKBOX_COUNT).fill(false),
};

async function main() {
    const PORT = process.env.PORT ?? 8000;

    const app = express();
    app.use(express.static(path.resolve("./public")));
    //express.static first check for routes , if no routes found then go to public folder by default

    const httpServer = createServer(app);

    //socket io handlers
    const io = new Server();
    io.attach(httpServer);

    io.on("connection", (socket) => {
        console.log("Socket Connected", { id: socket.id });

        socket.on("client:checkbox:changed", (data) => {
            console.log(`[Socket:${socket.id}]:client:checkbox:change`, data);
            const { index, checked } = data;
            state.checkboxes[index] = checked;
            io.emit("server:checkbox:changed", data);
        });
    });

    //express handlers
    app.get("/health", (req, res) => {
        return res.json({ healthy: true });
    });

    app.get("/checkboxes", (req, res) => {
        return res.status(200).send({ checkboxes: state.checkboxes });
    });

    httpServer.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
}

main();
