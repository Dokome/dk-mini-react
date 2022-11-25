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

export const updateNode = (node, prevVal, nextVal) => {
  Object.keys(nextVal).forEach(k => {
    if (k === 'children') {
      if (isStringOrNumber(nextVal[k])) {
        node.textContent = nextVal[k]
      }
    } else {
      node[k] = nextVal[k]
    }
  })
}
