import * as Clipboard from "expo-clipboard";

export async function copyToClipboard(text: string) {
  if (!text) return;
  await Clipboard.setStringAsync(text);
}

export async function pasteFromClipboard(): Promise<string> {
  return await Clipboard.getStringAsync();
}
