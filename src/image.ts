import fs from "fs";

export function getActionIcon(action: string): string {
    let path = `imgs/actions/perform-power-action/key-${action}.svg`
    const svgContent = fs.readFileSync(path, "utf-8");
    return svgContent
}

export function instertStatusIndicator(svgData: string, status: string): string {

    let statusColor: string;

    switch (status) {
        case "running":
            statusColor = "rgb(42, 255, 0)";
            break;

        case "starting":
            statusColor = "rgb(13, 172, 240)";
            break;

        case "stopping":
            statusColor = "rgb(255, 162, 0)";
            break;

        case "offline":
            statusColor = "rgb(91, 91, 91)";
            break;

        case null:
        case undefined:
            statusColor = "rgb(255, 0, 204)";
            break;

        default:
            statusColor = `rgb(255, 0, 204)`;
            break;
    }



    const ellipse =
        `<ellipse style="fill: ${statusColor};" cx="100" cy="100" rx="30" ry="30" />\n`;

    // Find the first <g ...> tag
    const gIndex = svgData.indexOf("<g");

    if (gIndex === -1) {
        // If no <g> tag found, return original
        return svgData;
    }

    // Insert ellipse right before <g>
    const before = svgData.slice(0, gIndex);
    const after = svgData.slice(gIndex);

    return before + ellipse + after;
}

export function getSVGFromFile(path: string): string {
    return fs.readFileSync(path, "utf-8");
}