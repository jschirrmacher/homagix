const headers = {
  'content-type': 'application/json',
}

export default async function (
  method: string,
  url: string,
  fields: Record<string, unknown>,
  expectedHttpErrors = {}
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(url, {
      body: JSON.stringify(fields),
      headers,
      method,
    })
    if (!response.ok) {
      if (expectedHttpErrors && expectedHttpErrors[response.status]) {
        return { error: expectedHttpErrors[response.status] }
      }
      return { error: `${response.status} ${response.statusText}` }
    }
    return await response.json()
  } catch (error) {
    return { error }
  }
}
