import fs from "fs";

export function pngToBase64DataUrl(filePath: string): string | null {
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return null;
    }

    try {
        const fileBuffer = fs.readFileSync(filePath);
        const base64 = fileBuffer.toString("base64");
        return `data:image/png;base64,${base64}`;
    } catch (err) {
        console.error("Failed to read or convert file:", err);
        return null;
    }
}