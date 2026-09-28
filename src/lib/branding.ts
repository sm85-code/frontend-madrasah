/** Static logo in `public/logo.png`. Used when pengaturan.logo_url is empty. */
export const DEFAULT_LOGO_URL = '/logo.png'

export function resolveLogoUrl(logoUrl?: string | null): string {
  const trimmed = logoUrl?.trim()
  return trimmed ? trimmed : DEFAULT_LOGO_URL
}
