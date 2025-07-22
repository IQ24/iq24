export function getLogoURL(id: string, ext?: string) {
  return `https://cdn-engine.iq24.ai/${id}.${ext || "jpg"}`;
}

export function getFileExtension(url: string) {
  return url.split(".").pop();
}
