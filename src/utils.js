/* flags */
export const NoFlags = /*                   */ 0b0000000000000000000000
export const Placement = /*                 */ 0b0000000000000000000010 /* 2 */
export const Update = /*                    */ 0b0000000000000000000100 /* 4 */
export const Delection = /*                 */ 0b0000000000000000001000 /* 8 */

export const isStr = s => {
  return typeof s === 'string'
}

export const isStringOrNumber = s => {
  return isStr(s) || typeof s === 'number'
}

export const isFn = fn => {
  return typeof fn === 'function'
}

export const isArray = arr => {
  return Array.isArray(arr)
}

export const isUndefined = t => {
  return typeof t === 'undefined'
}

export const updateNode = (node, prevVal, nextVal) => {
  Object.keys(prevVal).forEach(k => {
    if (k === 'children') {
      if (isStringOrNumber(prevVal[k])) {
        node.textContent = ''
      }
    } else if (k.startsWith('on')) {
      const eventName = k.slice(2).toLowerCase()
      node.removeEventListener(eventName, prevVal[k])
    } else {
      if (!(k in nextVal)) {
        node[k] = ''
      }
    }
  })

  Object.keys(nextVal).forEach(k => {
    if (k === 'children') {
      if (isStringOrNumber(nextVal[k])) {
        node.textContent = nextVal[k]
      }
    } else if (k.startsWith('on')) {
      // 暂时处理
      const eventName = k.slice(2).toLowerCase()
      node.addEventListener(eventName, nextVal[k])
    } else {
      node[k] = nextVal[k]
    }
  })
}

export const areHookInputsEqual = (nextDeps, prevDeps) => {
  if (prevDeps === null) {
    return false
  }

  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (Object.is(nextDeps[i], prevDeps[i])) {
      continue
    }
    return false
  }

  return true
}
