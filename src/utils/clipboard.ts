import * as Clipboard from "expo-clipboard";

/**
 * Copy text to the system clipboard.
 */
export async function copyToClipboard(text: string): Promise<void> {
  await Clipboard.setStringAsync(text ?? "");
}

/**
 * Get plain text from the system clipboard (empty string if unavailable).
 */
export async function getClipboardText(): Promise<string> {
  try {
    const text = await Clipboard.getStringAsync();
    return text ?? "";
  } catch {
    return "";
  }
}