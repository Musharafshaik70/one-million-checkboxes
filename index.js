import { createServer } from "node:http";
import express from "express";

async function main() {
    const PORT = process.env.PORT ?? 8000;

    const app = express();
    const httpServer = createServer(app);

    app.get("/health", (req, res) => {
        return res.json({ healthy: true });
    });

    httpServer.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
}

main();
