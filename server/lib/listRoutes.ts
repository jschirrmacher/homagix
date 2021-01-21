// Adapted from https://github.com/expressjs/express/issues/3308#issuecomment-300957572
function resolve(path, layer) {
  if (layer.route) {
    return layer.route.stack.map(
      resolve.bind(null, path.concat(split(layer.route.path)))
    )
  } else if (layer.name === 'router' && layer.handle.stack) {
    return layer.handle.stack.flatMap(
      resolve.bind(null, path.concat(split(layer.regexp)))
    )
  } else if (layer.method && layer.handle.name) {
    return [
      layer.method.toUpperCase(),
      path.concat(split(layer.regexp)).filter(Boolean).join('/'),
      layer.handle.name,
    ]
  }
}

function split(thing: string | { fast_slash: boolean }) {
  if (typeof thing === 'string') {
    return thing.split('/')
  } else if (thing.fast_slash) {
    return ''
  } else {
    const match = thing
      .toString()
      .replace('\\/?', '')
      .replace('(?=\\/|$)', '$')
      .match(/^\/\^((?:\\[.*+?^${}()|[\]\\/]|[^.*+?^${}()|[\]\\/])*)\$\//)
    return match
      ? match[1].replace(/\\(.)/g, '$1').split('/')
      : '<complex:' + thing.toString() + '>'
  }
}

export default function (app) {
  const routes = app._router.stack
    .flatMap(resolve.bind(null, []))
    .filter(Boolean)
    .map(e => [e[0] + ' ' + e[1], e[2]])

  const maxLen = routes.reduce(
    (max, route) => Math.max(max, route[0].length),
    0
  )

  return routes.map(r => r[0].padEnd(maxLen) + ' -> ' + r[1]).join('\n')
}
