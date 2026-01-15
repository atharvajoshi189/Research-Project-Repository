
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Converts a Google Drive view/share URL to a direct download URL.
 * If the URL is not a Google Drive URL, it returns the original URL.
 * 
 * Supports formats:
 * - https://drive.google.com/file/d/FILE_ID/view...
 * - https://drive.google.com/open?id=FILE_ID...
 */
export function getSmartDownloadUrl(url: string): string {
    if (!url) return "";

    const googleDriveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|Docs\.google\.com\/file\/d\/)([-w]+)/i;
    const match = url.match(googleDriveRegex);

    if (match && match[1]) {
        const fileId = match[1];
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    return url;
}
