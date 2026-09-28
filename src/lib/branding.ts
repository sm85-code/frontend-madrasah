/** Static logo in `public/logo.png`. Used when pengaturan.logo_url is empty. */
export const DEFAULT_LOGO_URL = '/logo.png'

/** Soft glow so a white logo edge stays visible on light backgrounds. */
export const LOGO_GLOW_CLASS =
  '[filter:drop-shadow(0_0_1px_rgba(15,23,42,0.35))_drop-shadow(0_0_6px_rgba(13,148,136,0.45))_drop-shadow(0_0_14px_rgba(13,148,136,0.28))]'

export function resolveLogoUrl(logoUrl?: string | null): string {
  const trimmed = logoUrl?.trim()
  return trimmed ? trimmed : DEFAULT_LOGO_URL
}
