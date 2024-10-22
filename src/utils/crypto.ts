/**
 * 
 */
export async function getSha256 (message: string) {
  // Encode the string as a Uint8Array
  const msgBuffer = new TextEncoder().encode(message)

  // Hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)

  // Convert the hash to a hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('')

  return hashHex
}

/**
 * 
 */
export function getGUID () {
  // Generate random values for the GUID
  const randomValues = new Uint8Array(512)
  window.crypto.getRandomValues(randomValues)

  // Convert to hexadecimal and format as GUID
  return Array
    .from(randomValues, byte => byte.toString(16).padStart(2, '0'))
    .join('') + Date.now()
}