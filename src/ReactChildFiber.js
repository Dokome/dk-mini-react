// 节点复用的条件
import { createFiber } from './ReactFiber.js'
import { isArray, isStringOrNumber, Placement, Update } from './utils.js'

const sameNode = (a, b) => {
  return a && b && a.type === b.type && a.key === b.key
}

const mapRemainingChildren = currentFirstChild => {
  const existingChildren = new Map()

  let existingChild = currentFirstChild
  while (existingChild) {
    existingChildren.set(
      existingChild.key || existingChild.index,
      existingChild
    )
    existingChild = existingChild.sibling
  }

  return existingChildren
}

const placeChild = (
  newFiber,
  lastPlacedIndex,
  newIndex,
  shouldTrackSideEffects
) => {
  newFiber.index = newIndex
  if (!shouldTrackSideEffects) {
    // 初次渲染只记录下标
    return lastPlacedIndex
  } else {
    const current = newFiber.alternate
    if (current) {
      const oldIndex = current.index
      if (oldIndex < lastPlacedIndex) {
        newFiber.flags |= Placement
        return lastPlacedIndex
      } else {
        return oldIndex
      }
    } else {
      newFiber.flags |= Placement
      return lastPlacedIndex
    }
  }
}

const deleteChild = (returnFiber, childTodelete) => {
  const deletions = returnFiber.deletions
  if (deletions) {
    returnFiber.deletions.push(childTodelete)
  } else {
    returnFiber.deletions = [childTodelete]
  }
}

const deleteRemainingChild = (returnFiber, currentFirstChild) => {
  let childTodelete = currentFirstChild

  while (childTodelete) {
    deleteChild(returnFiber, childTodelete)
    childTodelete = childTodelete.sibling
  }
}

// 协调 diff
export const reconcileChildren = (returnFiber, children) => {
  if (isStringOrNumber(children)) {
    return
  }

  const newChildren = isArray(children) ? children : [children]

  //  oldFiber 的头节点
  let oldFiber = returnFiber.alternate?.child
  let previousNewFiber = null
  let newIndex = 0
  // 上一次 DOM 节点插入的位置
  let lastPlacedIndex = 0
  // 判断 returnFiber 是初次渲染还是更新
  let shouldTrackSideEffects = Boolean(returnFiber.alternate)
  // 下一个 oldFiber | 暂时缓存一下 oldFiber
  let nextOldFiber = null

  /*
   * 1. 从左往右比较新老节点检查是否可复用
   */
  for (; oldFiber && newIndex < newChildren.length; newIndex++) {
    const newChild = newChildren[newIndex]

    if (newChild == null) {
      continue
    }

    if (oldFiber.index > newIndex) {
      nextOldFiber = oldFiber
      oldFiber = null
    } else {
      nextOldFiber = oldFiber.sibling
    }

    const same = sameNode(newChild, oldFiber)

    if (!same) {
      if (oldFiber === null) {
        oldFiber = nextOldFiber
      }
      break
    }

    const newFiber = createFiber(newChild, returnFiber)
    Object.assign(newFiber, {
      stateNode: oldFiber.stateNode,
      alternate: oldFiber,
      flags: Update,
    })

    lastPlacedIndex = placeChild(
      newFiber,
      lastPlacedIndex,
      newIndex,
      shouldTrackSideEffects
    )

    if (previousNewFiber === null) {
      returnFiber.child = newFiber
    } else {
      previousNewFiber.sibling = newFiber
    }

    previousNewFiber = newFiber
    oldFiber = nextOldFiber
  }

  /**
   * 2. 新节点没了老节点还有
   */
  if (newIndex === newChildren.length) {
    deleteRemainingChild(returnFiber, oldFiber)
    return
  }

  /*
   * 3. 部分节点的初次渲染
   */
  if (!oldFiber) {
    for (; newIndex < newChildren.length; newIndex++) {
      const newChild = newChildren[newIndex]

      if (newChild == null) {
        continue
      }

      const newFiber = createFiber(newChild, returnFiber)

      lastPlacedIndex = placeChild(
        newFiber,
        lastPlacedIndex,
        newIndex,
        shouldTrackSideEffects
      )

      if (previousNewFiber === null) {
        returnFiber.child = newFiber
      } else {
        previousNewFiber.sibling = newFiber
      }

      previousNewFiber = newFiber
    }
  }

  /**
   * 4. 新老节点都还有
   * 构建 old 单链表为哈希表
   * 遍历新节点，通过新节点的 key 去哈希表中查找节点，找到就复用，并且删除哈希表中对应的节点
   * */
  const existingChildren = mapRemainingChildren(oldFiber)

  for (; newIndex < newChildren.length; newIndex++) {
    const newChild = newChildren[newIndex]

    if (newChild == null) {
      continue
    }

    const newFiber = createFiber(newChild, returnFiber)
    const matchedFiber = existingChildren.get(newFiber.key || newFiber.index)

    if (matchedFiber) {
      Object.assign(newFiber, {
        stateNode: matchedFiber.stateNode,
        alternate: matchedFiber.alternate,
        flags: Update,
      })

      existingChildren.delete(newFiber.key || newFiber.index)
    }

    lastPlacedIndex = placeChild(
      newFiber,
      lastPlacedIndex,
      newIndex,
      shouldTrackSideEffects
    )

    if (previousNewFiber === null) {
      returnFiber.child = newFiber
    } else {
      previousNewFiber.sibling = newFiber
    }

    previousNewFiber = newFiber
  }

  /**
   * 5. old 的哈希表中还有值
   */

  if (shouldTrackSideEffects) {
    existingChildren.forEach(child => deleteChild(returnFiber, child))
  }

  // 如果新节点遍历完了 但是老节点还有 老节点要被删除
  if (newIndex === newChildren.length) {
    deleteRemainingChild(returnFiber, oldFiber)
    return
  }
}
