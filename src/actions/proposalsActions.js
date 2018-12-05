import * as types from './actionTypes'

const createParam = (name, obj) => {
  const list = Object.keys(obj).filter(k => obj[k])
  return list.length ? name + '=' + list.join(',') : ''
}

export function getProposals(inhibit = {}, accepted = {}) {
  return async function (dispatch) {
    const params = [createParam('inhibit', inhibit), createParam('accepted', accepted)].filter(a => a).join('&')
    const response = await fetch('/proposals' + (params ? ('?' + params) : ''))
    const result = await response.json()
    if (response.ok) {
      dispatch({type: types.PROPOSALS_LOADED, proposals: result})
    } else {
      dispatch({type: types.ERROR, message: result.error || response.status + ' ' + response.statusText})
    }
  }
}

export function discardProposal(dish) {
  return async function (dispatch, getState) {
    const inhibited = Object.assign({}, getState().proposals.inhibited || {}, {[dish.id]: true})
    dispatch({type: types.PROPOSALS_INHIBITED, inhibited})
    dispatch(getProposals(inhibited, getState().proposals.accepted || {}))
  }
}

export function toggleProposalAcceptance(dish) {
  return async function (dispatch, getState) {
    const accepted = getState().proposals.accepted || {}
    accepted[dish.id] = !accepted[dish.id]
    dispatch({type: types.PROPOSAL_SETACCEPTANCE, accepted})
    dispatch(getProposals(getState().proposals.inhibited || {}, accepted))
  }
}

export function fixAcceptedDishes(accepted, date) {
  return async function (dispatch) {
    const headers = {'content-type': 'application/json'}
    const body = JSON.stringify({accepted, date})
    const response = await fetch('/proposals/fix', {method: 'POST', body, headers})
    const result = await response.json()
    if (response.ok) {
      dispatch(getProposals())
      dispatch({type: types.PROPOSAL_FIXED})
    } else {
      dispatch({type: types.ERROR, message: result.error || response.status + ' ' + response.statusText})
    }
  }
}
