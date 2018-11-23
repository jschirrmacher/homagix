import * as types from './actionTypes'

export function getProposals(inhibit) {
  return async function (dispatch) {
    let url = '/proposals'
    if (inhibit && inhibit.length) {
      url += '?inhibit=' + inhibit.join(',')
    }
    const response = await fetch(url)
    const result = await response.json()
    if (response.ok) {
      dispatch({type: types.PROPOSALS_LOADED, proposals: result})
    } else {
      dispatch({type: types.ERROR, message: result.error || response.status + ' ' + response.statusText})
    }
  }
}
