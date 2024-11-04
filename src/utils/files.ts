import { Any } from '../types'

/**
 * 
 */
export async function fetchJSON (url: string): Promise<Any> {
  try {
      const response = await fetch(url);
      
      // Check if the response is OK (status code 200-299)
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data
  } catch (error) {
      console.error('Error fetching JSON:', error);
  }

  return false
}
