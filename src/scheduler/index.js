import { peek, pop, push } from './minHeap.js'

const taskQueue = []
const chanel = new MessageChannel()
const port = chanel.port2
let taskIdCount = 1

chanel.port1.onmessage = () => {
  workLoop()
}

const workLoop = () => {
  let currentTask = peek(taskQueue)
  while (currentTask) {
    const callback = currentTask.callback
    callback && callback()
    currentTask.callback = null
    pop(taskQueue)
    currentTask = peek(taskQueue)
  }
}

const getCurrentTime = () => {
  return performance.now()
}

const requestHostCallback = () => {
  port.postMessage(null)
}

export const scheduleCallback = callback => {
  const currentTime = getCurrentTime()
  const timeout = -1
  const expirtationTime = currentTime - timeout
  const task = {
    id: taskIdCount++,
    expirtationTime,
    callback,
    sortIndex: expirtationTime,
  }

  push(taskQueue, task)

  // 请求调度
  requestHostCallback()
}
