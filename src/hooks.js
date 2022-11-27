import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop.js'
import { areHookInputsEqual } from './utils.js'

let currentlyRenderingFiber = null
let workInProgressHook = null

// 老 hook
let currentHook = null

export const HookLayout = /*      */ 0b010
export const HookPassive = /*     */ 0b100

const updateWorkInProgressHook = () => {
  let hook = {}

  const current = currentlyRenderingFiber.alternate

  if (current) {
    // 组件更新
    currentlyRenderingFiber.memorizedState = current.memorizedState
    if (workInProgressHook) {
      workInProgressHook = hook = workInProgressHook.next
      currentHook = currentHook.next
    } else {
      workInProgressHook = hook = currentlyRenderingFiber.memorizedState
      currentHook = current.memorizedState
    }
  } else {
    // 初次渲染
    currentHook = null

    hook = {
      memorizedState: null,
      next: null,
    }
    if (workInProgressHook) {
      workInProgressHook = workInProgressHook.next = hook
    } else {
      // 头 hook
      workInProgressHook = currentlyRenderingFiber.memorizedState = hook
    }
  }

  return hook
}

export const renderWithHooks = wip => {
  currentlyRenderingFiber = wip
  currentlyRenderingFiber.memorizedState = null
  workInProgressHook = null

  currentlyRenderingFiber.updateQueueOfEffect = []
  currentlyRenderingFiber.updateQueueOfLayoutEffect = []
}

const dispatchReducerAction = (fiber, hook, reducer, action) => {
  hook.memorizedState = reducer
    ? reducer(hook.memorizedState, action)
    : typeof action === 'function'
    ? action(hook.memorizedState)
    : action
  fiber.alternate = { ...fiber }
  fiber.sibling = null
  scheduleUpdateOnFiber(fiber)
}

export const useReducer = (reducer, initalState) => {
  const hook = updateWorkInProgressHook()

  if (!currentlyRenderingFiber.alternate) {
    // 初次渲染
    hook.memorizedState = initalState
  }

  // const dispatch = () => {
  //   hook.memorizedState = reducer(hook.memorizedState)
  //   currentlyRenderingFiber.alternate = { ...currentlyRenderingFiber }
  //   scheduleUpdateOnFiber(currentlyRenderingFiber)
  // }

  const dispatch = dispatchReducerAction.bind(
    null,
    currentlyRenderingFiber,
    hook,
    reducer
  )

  return [hook.memorizedState, dispatch]
}

export const useState = initalState => useReducer(null, initalState)

export const updateEffectImp = (hooksFlags, create, deps) => {
  const hook = updateWorkInProgressHook()

  if (currentHook) {
    const prevEffect = currentHook.memorizedState
    if (deps) {
      const prevDeps = prevEffect.deps
      if (areHookInputsEqual(prevDeps, deps)) {
        return
      }
    }
  }

  const effect = { hooksFlags, create, deps }

  hook.memorizedState = effect

  if (hooksFlags & HookPassive) {
    currentlyRenderingFiber.updateQueueOfEffect.push(effect)
  } else if (hooksFlags & HookLayout) {
    currentlyRenderingFiber.updateQueueOfLayoutEffect.push(effect)
  }
}

export const useEffect = (create, deps) => {
  return updateEffectImp(HookPassive, create, deps)
}

export const useLayoutEffect = (create, deps) => {
  return updateEffectImp(HookLayout, create, deps)
}
