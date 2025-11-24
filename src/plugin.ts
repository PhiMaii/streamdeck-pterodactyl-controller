import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { PerformPowerAction } from "./actions/perform-power-action";
import { ShowOnlinePlayers } from "./actions/show-online-players";
import { ExternalApiManager, PterodactylApiManager } from "./api-manager";



let apiManager = new PterodactylApiManager();
let externalApiManager = new ExternalApiManager();
export { apiManager, externalApiManager };



// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.TRACE);

// Register the increment action.
streamDeck.actions.registerAction(new PerformPowerAction());
streamDeck.actions.registerAction(new ShowOnlinePlayers());


// Finally, connect to the Stream Deck.
streamDeck.connect();
