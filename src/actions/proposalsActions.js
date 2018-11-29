import * as types from './actionTypes'

export function getProposals(inhibit, accepted) {
  return async function (dispatch) {
    const params = []
    if (inhibit && inhibit.length) {
      params.push('inhibit=' + inhibit.join(','))
    }
    if (accepted && accepted.length) {
      params.push('accepted=' + accepted.join(','))
    }
    const url = '/proposals' + (params.length ? ('?' + params.join('&')) : '')
    const response = await fetch(url)
    const result = await response.json()
    if (response.ok) {
      dispatch({type: types.PROPOSALS_LOADED, proposals: result})
    } else {
      dispatch({type: types.ERROR, message: result.error || response.status + ' ' + response.statusText})
    }
  }
}
