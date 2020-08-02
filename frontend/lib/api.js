import { ERROR_OCCURED } from '@/store/mutation_types'

export async function doFetch(method, url, data) {
  const options = { method }
  if (data && !['get', 'options'].includes(method.toLowerCase())) {
    options.headers = {'content-type': 'application/json'}
    options.body = JSON.stringify(data)
  } else if (data && method.toLowerCase() === 'get') {
    url += '?' + Object.values(data).map((val, key) => `${key}=${encodeURIComponent(val)}`).join('&')
  }
  const response = await fetch(url, options)
  const content = response.headers.get('content-type').match(/json/) ? await response.json() : await response.text()
  return response.ok ? content : { httpStatus: response.status, error: content }
}

export function loadData(url, mutationType) {
  return async function (context) {
    const params = {
      accepted: context.state.accepted.join(','),
      inhibit: context.state.declined.join(','),
    }
    const result = await doFetch('get', url, params)
    if (result.error) {
      context.commit(ERROR_OCCURED, { message: 'Error accessing server', details: result })
    } else {
      context.commit(mutationType, result)
    }
  }
}
