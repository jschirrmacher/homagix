import { ERROR_OCCURED, WEEKPLAN_LOADED } from '../store/mutation_types.js'

function encodeParameter([key, val]) {
  const value = val instanceof Array ? val.join(',') : val
  return key + '=' + encodeURIComponent(value)
}

function prepareQueryParamers(params) {
  return Object.entries(params).map(encodeParameter).join('&')
}

let baseUrl = ''

export function setBaseUrl(url) {
  baseUrl = url
}

export async function doFetch(method, url, data) {
  const options = { method }
  if (data && !['get', 'options'].includes(method.toLowerCase())) {
    options.headers = {'content-type': 'application/json'}
    options.body = JSON.stringify(data)
  } else if (data && method.toLowerCase() === 'get') {
    url += '?' + prepareQueryParamers(data)
  }
  try {
    const response = await (global || window).fetch(baseUrl + url, options)
    const content = response.headers.get('content-type').match(/json/) ? await response.json() : await response.text()
    return response.ok ? content : { httpStatus: response.status, error: content }
  } catch (error) {
    return { httpStatus: error.code, error: error.message || error}
  }
}

export function loadData(url, mutationType) {
  return async function (context) {
    try {
      const params = {
        accepted: context.state.accepted.join(','),
        inhibit: context.state.declined.join(','),
      }
      const result = await doFetch('get', url, params)
      if (result.error) {
        throw result
      }
      context.commit(mutationType, result)
    } catch (details) {
      context.commit(ERROR_OCCURED, { message: 'Error accessing server', details })
    }
  }
}

export async function fetchWeekplan(startDate, declined) {
  try {
    const result = await doFetch('get', '/weekplan/' + startDate.toISOString().split('T')[0], { inhibit: declined.join(',') })
    if (result.error) {
      throw result
    }
    return [WEEKPLAN_LOADED, { weekplan: result }]
  } catch (error) {
    return [ERROR_OCCURED, { message: 'Error accessing server', details: error }]
  }
}
