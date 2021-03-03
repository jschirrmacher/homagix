import { CompleteItem, Dish, Ingredient, Proposal } from '../app-types'
import { ERROR_OCCURED } from '../store/mutation_types'

function encodeParameter([key, val]): string {
  const value = val instanceof Array ? val.join(',') : val
  return key + '=' + encodeURIComponent(value)
}

function prepareQueryParamers(params: Record<string, unknown>): string {
  return Object.entries(params).map(encodeParameter).join('&')
}

let baseUrl = ''

export function setBaseUrl(url: string): void {
  baseUrl = url
}

type FetchError = {
  error: string | Error
  httpStatus: number
}

type FetchResult = FetchError | Record<string, unknown>

export async function doFetch(
  method: string,
  url: string,
  data?: Record<string, unknown>
): Promise<FetchResult> {
  const options = {
    method,
    headers: { accept: 'application/json' },
  } as RequestInit
  if (data && !['get', 'options'].includes(method.toLowerCase())) {
    options.headers = { ...options.headers, ['content-type']: 'application/json' }
    options.body = JSON.stringify(data)
  } else if (data && method.toLowerCase() === 'get') {
    url += '?' + prepareQueryParamers(data)
  }
  try {
    const response = await (global || window).fetch(baseUrl + url, options)
    const content = (response.headers.get('content-type') || '').match(/json/)
      ? await response.json()
      : await response.text()
    return response.ok
      ? content
      : { httpStatus: response.status, error: content }
  } catch (error) {
    return { httpStatus: error.code, error: error.message || error }
  }
}

export function loadData(url: string, mutationType: string) {
  return async function (context: {
    state: { accepted: any[]; declined: any[] }
    commit: (arg0: string, arg1: unknown) => void
  }): Promise<void> {
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
      context.commit(ERROR_OCCURED, {
        message: 'Error accessing server',
        details,
      })
    }
  }
}

type CombinedIngredientsAndStandardItems = {
  allIngredients: Ingredient[]
  standardItems: CompleteItem[]
}

export async function fetchIngredientsAndStandardItems(): Promise<CombinedIngredientsAndStandardItems> {
  try {
    const result = (await doFetch('get', '/ingredients')) as {
      ingredients: Ingredient[]
      standards: CompleteItem[]
      error?: unknown
    }
    if (result.error) {
      throw { message: result.error, details: result }
    }
    return {
      allIngredients: result.ingredients,
      standardItems: result.standards,
    }
  } catch (error) {
    throw { message: 'Error accessing server', details: error }
  }
}

export async function fetchWeekplan(
  startDate: Date,
  declined: string[]
): Promise<Proposal[]> {
  try {
    const result = await doFetch(
      'get',
      '/weekplan/' + startDate.toISOString().split('T')[0],
      { inhibit: declined.join(',') }
    )
    if (result.error) {
      throw { message: result.error, details: result }
    }
    return (result as unknown) as Proposal[]
  } catch (error) {
    throw { message: 'Error accessing server', details: error }
  }
}

export async function setFavorite(
  dishId: string,
  isFavorite: boolean
): Promise<Dish> {
  try {
    const result = await doFetch(
      isFavorite ? 'post' : 'delete',
      '/dishes/' + dishId + '/favorites'
    )
    if (result.error) {
      throw { message: result.error, details: result }
    }
    return result as Dish
  } catch (error) {
    throw { message: 'Error accessing server', details: error }
  }
}
