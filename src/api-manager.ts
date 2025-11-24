import type { DataSourcePayload, DataSourceResult } from "./sdpi";
import streamDeck from "@elgato/streamdeck";
import axios from "axios";
import WebSocket from "ws";

import fs from "fs";
import https from "https";
import path from "path";


import type { PowerActionSettings } from "./actions/perform-power-action";


export class PterodactylApiManager {
    async getAvailableServers(): Promise<DataSourceResult> {
        const obj = await streamDeck.settings.getGlobalSettings();
        streamDeck.logger.info("Global settings: " + JSON.stringify(obj));
        //@ts-ignore
        const response = await axios.get(`${obj.protocol}://${obj.ip}/api/client`, {
            headers: {
                Authorization: `Bearer ${obj.apiKey}`,
                Accept: "Application/vnd.pterodactyl.v1+json",
                "Content-Type": "application/json",
            },
        });

        const servers = response.data.data;

        return servers.map((entry: any) => ({
            value: entry.attributes.identifier,   // Identifier
            label: entry.attributes.name,         // Name
        }));
    }

    async getServerNameFromID(serverID: string): Promise<string> {
        try {
            // Get global settings for API credentials
            const settings = await streamDeck.settings.getGlobalSettings();

            const response = await axios.get(`${settings.protocol}://${settings.ip}/api/client`, {
                headers: {
                    Authorization: `Bearer ${settings.apiKey}`,
                    Accept: "Application/vnd.pterodactyl.v1+json",
                    "Content-Type": "application/json",
                },
            });

            const servers = response.data.data;

            // Find the server with the given ID
            const server = servers.find((entry: any) => entry.attributes.identifier === serverID);

            if (server) {
                return server.attributes.name;
            } else {
                return "null"; // Not found
            }
        } catch (error) {
            streamDeck.logger.error("Error fetching server name:", error);
            return "null";
        }
    }


    async performAction(): Promise<boolean> {
        try {
            const obj: PowerActionSettings = await streamDeck.settings.getGlobalSettings();
            const url = `${obj.protocol}://${obj.ip}/api/client/servers/${obj.serverID}/power`;

            const response = await axios.post(
                url,
                { signal: obj.action },
                {
                    headers: {
                        Authorization: `Bearer ${obj.apiKey}`,
                        Accept: "Application/vnd.pterodactyl.v1+json",
                        "Content-Type": "application/json",
                    },
                    validateStatus: () => true, // Prevent Axios from throwing on non-2xx status
                }
            );

            return response.status === 204;
        } catch (error) {
            streamDeck.logger.error("Error restarting server:", error);
            return false;
        }
    }

    async getServerStatus(serverId: string): Promise<string | null> {
        try {
            // Get global settings (protocol, ip, apiKey)
            const settings: PowerActionSettings = await streamDeck.settings.getGlobalSettings();

            const url = `${settings.protocol}://${settings.ip}/api/client/servers/${serverId}`;

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${settings.apiKey}`,
                    Accept: "Application/vnd.pterodactyl.v1+json",
                    "Content-Type": "application/json",
                },
            });

            // Extract status from response
            return response.data.attributes.status;

        } catch (error) {
            streamDeck.logger.error("Error fetching server status: " + String(error));
            return "error";
        }
    }


    // ##############################




    // async runCommand() {

    //     const PANEL_URL = "http://192.168.178.12"; // replace with your panel URL
    //     const API_KEY = "ptlc_X8ZbKcAVkert4obg6PDsLHNbFRPF1SrEQDIGiZPes05";        // replace with your API key
    //     const SERVER_ID = "81f81ada";               // replace with your server ID
    //     const COMMAND = "list"; // replace with your command

    //     streamDeck.logger.info("Running command via WebSocket...");
    //     try {
    //         const response = await axios.get(`${PANEL_URL}/api/client/servers/${SERVER_ID}/websocket`, {
    //             headers: {
    //                 "Authorization": `Bearer ${API_KEY}`,
    //                 "Accept": "Application/vnd.pterodactyl.v1+json",
    //                 "Content-Type": "application/json",
    //             },
    //         });

    //         const { token, socket } = response.data.data;

    //         streamDeck.logger.info("WebSocket token and URL obtained.", { token, socket });

    //         const ws = new WebSocket(socket, {
    //             headers: { "Origin": PANEL_URL },
    //         });

    //         streamDeck.logger.info("WebSocket connection initiated.");

    //         ws.on("open", () => {
    //             ws.send(JSON.stringify({ event: "auth", args: [token] }));
    //             streamDeck.logger.info("WebSocket authentication sent.");
    //         });

    //         ws.on("message", (data: WebSocket.Data) => {
    //             // streamDeck.logger.info("WebSocket data received:", data);
    //             const messageString = data.toString();
    //             // streamDeck.logger.info("WebSocket message received:", messageString);

    //             let message;
    //             try {
    //                 message = JSON.parse(messageString);

    //                 // Auth successful -> send command
    //                 if (message.event === "auth success") {
    //                     ws.send(JSON.stringify({ event: "send command", args: [COMMAND] }));
    //                 }
    //                 let output = "";
    //                 // Output from the command
    //                 if (message.event === "console output") {
    //                     const output = message.args[0];
    //                     if (output && output.includes("There are") && output.includes("players online")) {
    //                         const namesPart = output.split(":").pop()?.trim();
    //                         const players = namesPart && namesPart.length > 0
    //                             //@ts-ignore
    //                             ? namesPart.split(",").map((name) => name.trim())
    //                             : [];
    //                         ws.close();
    //                         streamDeck.logger.warn(players); // return the array
    //                     }
    //                 }

    //                 // // Check for the specific command output pattern
    //                 // if (output.includes("There are") && output.includes("players online")) {
    //                 //     ws.close(); // close WS after receiving expected output
    //                 // }
    //             } catch (err) {
    //                 streamDeck.logger.error("Failed to parse message:", data, err);
    //             }
    //         });

    //         ws.on("close", () => streamDeck.logger.info("WebSocket closed."));
    //         ws.on("error", (err) => streamDeck.logger.info("WebSocket error:", err));
    //     } catch (err) {
    //         streamDeck.logger.error("Error:", err);
    //     }
    // }

    async runCommand(panelUrl: string, apiKey: string, serverID: string): Promise<string[]> {
        const PANEL_URL = panelUrl; // your panel URL
        const API_KEY = apiKey; // your API key
        const SERVER_ID = serverID; // your server ID
        const COMMAND = "list"; // the command

        streamDeck.logger.info("Running command via WebSocket...");

        return new Promise<string[]>(async (resolve, reject) => {
            try {
                const response = await axios.get(`${PANEL_URL}/api/client/servers/${SERVER_ID}/websocket`, {
                    headers: {
                        "Authorization": `Bearer ${API_KEY}`,
                        "Accept": "Application/vnd.pterodactyl.v1+json",
                        "Content-Type": "application/json",
                    },
                });

                const { token, socket } = response.data.data;
                streamDeck.logger.info("WebSocket token and URL obtained.", { token, socket });

                const ws = new WebSocket(socket, { headers: { "Origin": PANEL_URL } });
                streamDeck.logger.info("WebSocket connection initiated.");

                ws.on("open", () => {
                    ws.send(JSON.stringify({ event: "auth", args: [token] }));
                    streamDeck.logger.info("WebSocket authentication sent.");
                });

                ws.on("message", (data: WebSocket.Data) => {
                    const messageString = data.toString();

                    let message;
                    try {
                        message = JSON.parse(messageString);

                        // Auth successful -> send command
                        if (message.event === "auth success") {
                            streamDeck.logger.info("Authentication successful. Sending command...");
                            ws.send(JSON.stringify({ event: "send command", args: [COMMAND] }));
                        }

                        // Output from the command
                        if (message.event === "console output") {
                            const output = message.args[0];
                            if (output && output.includes("There are") && output.includes("players online")) {
                                const namesPart = output.split(":").pop()?.trim();
                                const players = namesPart && namesPart.length > 0
                                    //@ts-ignore
                                    ? namesPart.split(",").map(name => name.trim())
                                    : [];
                                ws.close();
                                streamDeck.logger.warn(players); // log the array
                                resolve(players); // resolve the promise
                            }
                        }
                    } catch (err) {
                        streamDeck.logger.error("Failed to parse message:", data, err);
                        reject(err);
                    }
                });

                ws.on("close", () => streamDeck.logger.info("WebSocket closed."));
                ws.on("error", (err) => {
                    streamDeck.logger.error("WebSocket error:", err);
                    reject(err);
                });
            } catch (err) {
                streamDeck.logger.error("Error:", err);
                reject(err);
            }
        });
    }

}


export class ExternalApiManager {
    downloadPlayerHeads(
        players: string[],
        size = 144,
        folder: string
    ): void {
        if (!Array.isArray(players) || players.length === 0) {
            streamDeck.logger.warn("No players to download.");
            return;
        }

        // Ensure folder exists
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }
        streamDeck.logger.info("Folder exists or created:", folder);

        players.forEach((username) => {
            const outputFile = path.join(folder, `${username}.png`);

            // Check if file already exists
            if (fs.existsSync(outputFile)) {
                streamDeck.logger.info(`File for ${username} already exists, skipping download.`);
                return;
            }

            const url = `https://api.mcheads.org/avatar/${username}/${size}`;
            https
                .get(url, (res) => {
                    if (res.statusCode !== 200) {
                        streamDeck.logger.error(`Failed to download ${username}:`, res.statusCode);
                        return;
                    }

                    const fileStream = fs.createWriteStream(outputFile);
                    res.pipe(fileStream);

                    fileStream.on("finish", () => {
                        fileStream.close();
                        streamDeck.logger.info(`Downloaded ${username}'s head to ${outputFile}`);
                    });
                })
                .on("error", (err) => {
                    streamDeck.logger.error(`Request error for ${username}:`, err);
                });
        });
    }
}
