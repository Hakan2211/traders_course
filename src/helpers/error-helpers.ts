export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as any).message === 'string'
  ) {
    // Check if the message is a stringified JSON array (common with Zod)
    try {
      const parsed = JSON.parse((error as any).message)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // It looks like a Zod error array
        return parsed.map((e: any) => e.message || JSON.stringify(e)).join(', ')
      }
    } catch {
      // Not a JSON string, just return the message
    }
    return (error as any).message
  }

  // Handle case where error might be an array of objects (ZodError issues directly?)
  if (Array.isArray(error)) {
    return error.map((e) => getErrorMessage(e)).join(', ')
  }

  if (error instanceof Error) {
    return error.message
  }

  try {
    return JSON.stringify(error)
  } catch {
    return 'An unknown error occurred'
  }
}
