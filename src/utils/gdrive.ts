/**
 * Google Drive URL Parser and Embed/Thumbnail Generator
 * Enables Zero-Storage media handling by leveraging the user's Google Drive.
 */

export interface GDriveParsedInfo {
  isGDrive: boolean
  fileId: string | null
  thumbnailUrl: string | null
  previewUrl: string | null
  directDownloadUrl: string | null
  originalUrl: string
}

/**
 * Extracts Google Drive file ID from various sharing formats:
 * - https://drive.google.com/file/d/{ID}/view...
 * - https://drive.google.com/open?id={ID}
 * - https://drive.google.com/uc?id={ID}
 * - https://drive.google.com/thumbnail?id={ID}
 */
export function extractGDriveFileId(url: string): string | null {
  if (!url || typeof url !== 'string') return null

  const trimmed = url.trim()
  if (!trimmed.includes('drive.google.com') && !trimmed.includes('docs.google.com')) {
    return null
  }

  // Format 1: /file/d/{id} or /folders/{id} or /d/{id}
  const fileDMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{15,})/i)
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1]
  }

  // Format 2: id={id}
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{15,})/i)
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1]
  }

  return null
}

/**
 * Parses any URL and checks if it's a Google Drive link.
 * If yes, generates high-res thumbnail & embed preview URLs.
 */
export function parseGoogleDriveUrl(url: string, size = 1200): GDriveParsedInfo {
  const fileId = extractGDriveFileId(url)

  if (!fileId) {
    return {
      isGDrive: false,
      fileId: null,
      thumbnailUrl: null,
      previewUrl: null,
      directDownloadUrl: null,
      originalUrl: url || '',
    }
  }

  return {
    isGDrive: true,
    fileId,
    // Google Drive direct high-res thumbnail endpoint (cached, fast, maintains aspect ratio)
    thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`,
    // Embedded viewer for docs/sheets/images
    previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    // Direct download/view link
    directDownloadUrl: `https://drive.google.com/uc?export=view&id=${fileId}`,
    originalUrl: url,
  }
}

/**
 * Checks if a URL likely points to an image (either via extension or GDrive parser)
 */
export function isImageUrl(url: string): boolean {
  if (!url) return false
  const lower = url.toLowerCase()
  if (extractGDriveFileId(url)) return true
  return /\.(jpg|jpeg|png|webp|gif|svg|avif)(\?.*)?$/i.test(lower)
}
