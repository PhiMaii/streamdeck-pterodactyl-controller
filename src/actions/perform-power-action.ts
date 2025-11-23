import streamDeck, { action, DidReceiveSettingsEvent, SingletonAction, WillAppearEvent, type JsonValue, type KeyDownEvent, type SendToPluginEvent } from "@elgato/streamdeck";
import type { DataSourcePayload, DataSourceResult } from "../sdpi";

import { ApiManager } from "../api-manager";

import { getActionIcon, getSVGFromFile, instertStatusIndicator } from "../image";


@action({ UUID: "net.phimai.pterodactyl.perform-power-action" })
export class PerformPowerAction extends SingletonAction<Settings> {

	public apiManager = new ApiManager();

	//@ts-ignore
	override async onKeyDown(ev: KeyDownEvent<PowerActionSettings>): Promise<void> {
		// streamDeck.logger.info("settings: " + JSON.stringify(await streamDeck.settings.getGlobalSettings()));
		let action = ev.payload.settings.action;
		await ev.action.setImage(`data:image/svg+xml,${encodeURIComponent(getSVGFromFile("imgs/actions/perform-power-action/spinner.svg"))}`);
		if (await this.apiManager.performAction()) {
			// ev.action.showOk();
			await ev.action.setImage(`data:image/svg+xml,${encodeURIComponent(getSVGFromFile(`imgs/actions/perform-power-action/key-${action}.svg`))}`);
		} else {
			ev.action.showAlert();
		}
	}

	override async onSendToPlugin(ev: SendToPluginEvent<JsonValue, PowerActionSettings>): Promise<void> {
		if (ev.payload instanceof Object && "event" in ev.payload && ev.payload.event === "getServers") {
			streamDeck.logger.info(streamDeck.ui.current);
			streamDeck.ui.current?.sendToPropertyInspector({
				event: "getServers",
				items: await this.apiManager.getAvailableServers(),
			} satisfies DataSourcePayload);
		}
	}

	//@ts-ignore
	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<PowerActionSettings>): Promise<void> | void {
		streamDeck.logger.info(`Settings updated: ${JSON.stringify(ev.payload.settings)}`);
		streamDeck.settings.setGlobalSettings(ev.payload.settings);

		let svgData = getActionIcon(ev.payload.settings.action);
		await ev.action.setImage(`data:image/svg+xml,${encodeURIComponent(svgData)}`);

	}

	//@ts-ignore
	override async onWillAppear(ev: WillAppearEvent<PowerActionSettings>): Promise<void> {
		let action = ev.payload.settings.action;
		let serverID = ev.payload.settings.serverID;
		let status = await this.apiManager.getServerStatus(serverID);
		streamDeck.logger.info(`Server status for ${serverID}: ${status}`);
		//@ts-ignore
		// await ev.action.setImage(`data:image/svg+xml,${encodeURIComponent(instertStatusIndicator(getSVGFromFile(`imgs/actions/perform-power-action/key-${action}.svg`), status))}`);
		await ev.action.setImage(`data:image/svg+xml,${encodeURIComponent(getSVGFromFile(`imgs/actions/perform-power-action/key-${action}.svg`))}`);

		await ev.action.setTitle(await this.apiManager.getServerNameFromID(serverID));


	}

}

export type PowerActionSettings = {
	ip: string;
	protocol: string;
	apiKey: string;
	serverID: string;
	action: string;
};

type Settings = {
	product?: string;
};
