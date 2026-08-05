import { createServer } from "node:http";
import path from "path";
import express from "express";

async function main() {
    const PORT = process.env.PORT ?? 8000;

    const app = express();
    app.use(express.static(path.resolve("./public")));
    //express.static first check for routes , if no routes found then go to public folder by default

    const httpServer = createServer(app);

    app.get("/health", (req, res) => {
        return res.json({ healthy: true });
    });

    httpServer.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
}

main();
