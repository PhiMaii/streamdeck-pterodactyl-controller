import streamDeck, { action, DidReceiveSettingsEvent, SingletonAction, WillAppearEvent, type JsonValue, type KeyDownEvent, type SendToPluginEvent } from "@elgato/streamdeck";
import { apiManager, externalApiManager } from "../plugin";
import { pngToBase64DataUrl } from "../utils";

@action({ UUID: "net.phimai.pterodactyl.show-online-players" })
export class ShowOnlinePlayers extends SingletonAction<ShowOnlinePlayersSettings> {

    override async onKeyDown(ev: KeyDownEvent<ShowOnlinePlayersSettings>): Promise<void> {
        streamDeck.logger.info("ShowOnlinePlayers Key Down");
        let globalSettings = await streamDeck.settings.getGlobalSettings();
        let panelUrl = globalSettings.panelUrl as string;
        let apiKey = globalSettings.apiKey as string;
        let serverID = globalSettings.serverID as string;

        // let players: string[] = await apiManager.runCommand(panelUrl, apiKey, serverID);

        // streamDeck.logger.info(`Online players: ${players.join(", ")}`);

        // externalApiManager.downloadPlayerHeads(players, 144, `D:/Daten/Programmieren/streamdeck-plugins/pterodactyl-controller/net.phimai.pterodactyl.sdPlugin/data/heads`);

        // const dataUrl = pngToBase64DataUrl(`D:/Daten/Programmieren/streamdeck-plugins/pterodactyl-controller/net.phimai.pterodactyl.sdPlugin/data/heads` + `/PhiMai.png`);

        // await ev.action.setImage(dataUrl ?? "");
    }

    override async onWillAppear(ev: WillAppearEvent<ShowOnlinePlayersSettings>): Promise<void> {
        ev.action.setImage(`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font
    Awesome Free 7.1.0 by @fontawesome - https://fontawesome.com License -
    https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
    <g transform="translate(320, 320) scale(0.65) translate(-320, -320)">
        <path fill="#ffffff"
            d="M320 80C377.4 80 424 126.6 424 184C424 241.4 377.4 288 320 288C262.6 288 216 241.4 216 184C216 126.6 262.6 80 320 80zM96 152C135.8 152 168 184.2 168 224C168 263.8 135.8 296 96 296C56.2 296 24 263.8 24 224C24 184.2 56.2 152 96 152zM0 480C0 409.3 57.3 352 128 352C140.8 352 153.2 353.9 164.9 357.4C132 394.2 112 442.8 112 496L112 512C112 523.4 114.4 534.2 118.7 544L32 544C14.3 544 0 529.7 0 512L0 480zM521.3 544C525.6 534.2 528 523.4 528 512L528 496C528 442.8 508 394.2 475.1 357.4C486.8 353.9 499.2 352 512 352C582.7 352 640 409.3 640 480L640 512C640 529.7 625.7 544 608 544L521.3 544zM472 224C472 184.2 504.2 152 544 152C583.8 152 616 184.2 616 224C616 263.8 583.8 296 544 296C504.2 296 472 263.8 472 224zM160 496C160 407.6 231.6 336 320 336C408.4 336 480 407.6 480 496L480 512C480 529.7 465.7 544 448 544L192 544C174.3 544 160 529.7 160 512L160 496z" />
    </g>
</svg>`)}`)
    }

}



export type ShowOnlinePlayersSettings = {
}