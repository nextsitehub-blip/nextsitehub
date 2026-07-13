export class Helpers {
  /**
   * Formats a raw number of bytes into human-readable notation (e.g. 1.24 MB).
   */
  public static formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  /**
   * Safe JSON sanitizer.
   */
  public static safeJsonParse<T>(jsonStr: string, fallback: T): T {
    try {
      return JSON.parse(jsonStr) as T;
    } catch {
      return fallback;
    }
  }

  /**
   * Normalizes URLs into secure absolute layouts.
   */
  public static cleanUrl(url: string): string {
    if (!url) return "";
    let cleaned = url.trim();
    if (!/^https?:\/\//i.test(cleaned)) {
      cleaned = "https://" + cleaned;
    }
    return cleaned;
  }
}
