import * as types from './actionTypes'

const createParam = (name, obj) => {
  const list = Object.keys(obj).filter(k => obj[k])
  return list.length ? name + '=' + list.join(',') : ''
}

export function getProposals(inhibit = {}, accepted = {}) {
  const params = [createParam('inhibit', inhibit), createParam('accepted', accepted)].filter(a => a).join('&')
  return doRemoteAction('GET', '/proposals' + (params ? ('?' + params) : ''), null, response => {
    return [{type: types.PROPOSALS_LOADED, proposals: response.content}]
  })
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
  return doRemoteAction('POST', '/proposals/fix', {accepted, date}, () => {
    return [{type: types.PROPOSAL_FIXED}, getProposals()]
  })
}

export function getIngredients() {
  return doRemoteAction('GET', '/ingredients', null, response => {
    return [{type: types.INGREDIENTS_LOADED, ingredients: response.content}]
  })
}

export function setItemGroup(item, group){
  return doRemoteAction('PUT', '/ingredients/' + item.id, {group}, response => {
    return [{type: types.INGREDIENT_UPDATED, ingredient: response.content}]
  })
}

function doRemoteAction(method, path, body = null, callback) {
  return async function (dispatch) {
    const headers = body ? {'content-type': 'application/json'} : {}
    const response = await fetch(path, {method, headers, body: body && JSON.stringify(body)})
    const contentType = response.headers.get('content-type') || 'text/plain'
    response.content = contentType.match(/json/) ? await response.json() : {message: await response.text()}
    if (!response.ok) {
      response.error = (response.error ? response.error + ': ' : '') + response.status + ' ' + response.statusText
      dispatch({type: types.ERROR, message: response.error})
    } else {
      callback(response).forEach(dispatch)
    }
  }
}
