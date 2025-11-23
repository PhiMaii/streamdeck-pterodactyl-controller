import type { DataSourcePayload, DataSourceResult } from "./sdpi";
import streamDeck from "@elgato/streamdeck";
import axios from "axios";

import type { PowerActionSettings } from "./actions/perform-power-action";


export class ApiManager {
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
            console.error("Error fetching server name:", error);
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
            console.error("Error restarting server:", error);
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
}