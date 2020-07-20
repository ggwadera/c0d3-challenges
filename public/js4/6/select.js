const container = document.querySelector(".container")
const selection = document.querySelector(".selection")
const blockSize = 50
const blockMargin = 2
const blockWidth = blockSize + 2 * blockMargin

let gridSize = 5
let blocks = []
let initialCoords = null
let mouseDown = false

// Block class
function Block(row, column) {
  this.row = row
  this.column = column

  // add block element to the container
  const element = document.createElement("div")
  element.classList.add("block")
  container.insertBefore(element, selection)

  // block is selected
  this.on = () => {
    element.classList.add("on")
  }

  // block is not selected
  this.off = () => {
    element.classList.remove("on")
  }
}


// Select the blocks inside the selection box
const selectBlocks = (width, height) => {
  const top = parseInt(selection.style.top)
  const left = parseInt(selection.style.left)

  const initialRow = Math.floor(top / blockWidth)
  const finalRow = Math.floor((top + height) / blockWidth)
  const initialColumn = Math.floor(left / blockWidth)
  const finalColumn = Math.floor((left + width) / blockWidth)

  blocks.forEach((block) => {
    block.off()
    if (block.row >= initialRow && block.row <= finalRow) {
      if (block.column >= initialColumn && block.column <= finalColumn) {
        block.on()
      }
    }
  })
}

container.addEventListener("mousedown", (e) => {
  mouseDown = true
  initialCoords = {
    x: e.clientX,
    y: e.clientY,
  }
  selection.style.display = "inline-block"
})

container.addEventListener("mousemove", (e) => {
  if (mouseDown) {
    const top = e.clientY - initialCoords.y
    const left = e.clientX - initialCoords.x
    const height = Math.abs(top)
    const width = Math.abs(left)

    selection.style.height = `${height}px`
    selection.style.width = `${width}px`
    selection.style.top = top < 0 ? `${e.clientY}px` : `${initialCoords.y}px`
    selection.style.left = left < 0 ? `${e.clientX}px` : `${initialCoords.x}px`
    selectBlocks(width, height)
  }
})

container.addEventListener("mouseup", () => {
  mouseDown = false
  selection.style.display = "none"
  selection.style.height = `0px`
  selection.style.width = `0px`
  blocks.forEach((block) => block.off())
})

const createGrid = () => {
  container.style.width = `${blockWidth * gridSize}px`
  blocks = [...Array(gridSize * gridSize).keys()].map((e) => {
    const row = Math.floor(e / gridSize)
    const col = e % gridSize
    return new Block(row, col)
  })
}

createGrid()
