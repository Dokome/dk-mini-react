const compare = (a, b) => {
  const diff = a.sortIndex - b.sortIndex
  return diff === 0 ? a.id - b.id : diff
}

export const peek = heap => {
  return !heap.length ? null : heap[0]
}

export const push = (heap, node) => {
  const index = heap.length

  heap.push(node)
  siftUp(heap, node, index)
}

const siftUp = (heap, node, index) => {
  let cur = index

  while (cur > 0) {
    const parentIndex = (cur - 1) >> 1
    const parent = heap[parentIndex]

    if (compare(node, parent) > 0) {
      heap[parentIndex] = node
      heap[index] = parent
      cur = parentIndex
    } else {
      return
    }
  }
}

export const pop = heap => {
  if (heap.length === 0) {
    return null
  }

  const first = heap[0]
  const last = heap.pop()

  if (first !== last) {
    heap[0] = last
    siftDown(heap, last, 0)
  }

  return first
}

const siftDown = (heap, node, index) => {
  const half = heap.length >> 1
  let cur = index

  while (cur < half) {
    const leftIndex = cur * 2 + 1
    const rightIndex = leftIndex + 1
    const left = heap[leftIndex]
    const right = heap[rightIndex]

    if (compare(left, node) < 0) {
      if (rightIndex < heap.length && compare(right, left) < 0) {
        // right 最小
        heap[cur] = right
        heap[rightIndex] = node
        cur = rightIndex
      } else {
        // right 不存在或者 left < right
        heap[cur] = left
        heap[leftIndex] = node
        cur = leftIndex
      }
    } else if (rightIndex < heap.length && compare(right, left) < 0) {
      heap[cur] = right
      heap[rightIndex] = node
      cur = rightIndex
    } else {
      return
    }
  }
}
