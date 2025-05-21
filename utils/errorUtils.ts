/**
 * Checks if an error is related to quota or rate limits
 * @param error The error to check
 * @returns True if the error is related to quota or rate limits
 */
export function isQuotaOrRateLimitError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || '';
  const errorString = JSON.stringify(error).toLowerCase();
  
  return (
    errorMessage.includes('quota') ||
    errorMessage.includes('rate limit') ||
    errorMessage.includes('too many requests') ||
    errorMessage.includes('exceeded') ||
    errorMessage.includes('limit') ||
    errorString.includes('quota') ||
    errorString.includes('rate limit') ||
    errorString.includes('too many requests') ||
    errorString.includes('exceeded') ||
    errorString.includes('limit')
  );
}
