// Turns an axios error from the API into a message for the user.
// Business errors come back as ProblemDetails { title }, validation errors as { title, errors: { Field: [msg] } }.
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data

  if (data?.errors && typeof data.errors === 'object') {
    const messages = Object.values(data.errors).flat()
    if (messages.length) return messages.join(' ')
  }
  if (data?.title) return data.title
  if (!error?.response) return 'Cannot reach the server. Is the API running?'
  if (error.response.status === 403) return 'You do not have permission to do this.'
  return fallback
}

// Field-level validation errors keyed by lower-camel field name, for showing under inputs
export function getFieldErrors(error) {
  const errors = error?.response?.data?.errors
  if (!errors || typeof errors !== 'object') return {}

  return Object.fromEntries(
    Object.entries(errors).map(([key, messages]) => {
      const field = key.replace(/^\$\./, '')
      return [field.charAt(0).toLowerCase() + field.slice(1), messages.join(' ')]
    }),
  )
}
