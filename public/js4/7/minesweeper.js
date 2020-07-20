const container = document.querySelector(".container")
const blockSize = 50
const gridSize = 10

// directions array to check surrounding blocks
const directions = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, -1],
  [0, 1],
]

let blocks = []
let numOfBombs = 0
let numSelected = 0

function Block(row, column, isBomb) {
  this.row = row
  this.column = column
  this.isSelected = false
  this.isBomb = isBomb

  // add block element to the container
  const element = document.createElement("div")
  element.classList.add("block")
  container.append(element)

  // add click and ctrl + click funcionality
  element.addEventListener("click", (e) => {
    e.stopPropagation()
    if (!e.ctrlKey) {
      if (this.isBomb) {
        this.flag()
        element.innerText = "💣"
        return gameOver()
      }
      this.select()
      if (hasUserWon()) {
        return gameOver(true)
      }
    } else {
      this.flag()
    }
  })

  // add right click funcionality
  element.addEventListener("contextmenu", () => {
    if (!this.isSelected) this.flag()
  })

  // select this block and the surroundings if bomb count is 0
  this.select = () => {
    if (!this.isSelected) {
      this.isSelected = true
      numSelected += 1
      const neighbors = getNeighbors()
      const bombs = countBombs(neighbors)
      if (!bombs) {
        neighbors.forEach((b) => b.select())
      } else {
        element.innerText = bombs
      }
      element.classList.add("selected")
    }
  }

  // flag this block
  this.flag = () => {
    element.classList.toggle("marked")
  }

  // get array of neighbors around this block
  const getNeighbors = () => {
    return directions.reduce((acc, direction) => {
      const row = this.row + direction[0]
      const col = this.column + direction[1]
      if (col >= 0 && col < gridSize) {
        if (row >= 0 && row < gridSize) {
          acc.push(blocks[row * gridSize + col])
        }
      }
      return acc
    }, [])
  }
}

// create the block grid
const createGrid = () => {
  container.style.width = `${blockSize * gridSize}px`
  blocks = [...Array(gridSize * gridSize).keys()].map((e) => {
    const row = Math.floor(e / gridSize)
    const col = e % gridSize
    const isBomb = Math.random() >= 0.9
    return new Block(row, col, isBomb)
  })
}

// count bombs inside the array
const countBombs = (arr) => {
  return arr.reduce((acc, b) => {
    if (b.isBomb) {
      acc += 1
    }
    return acc
  }, 0)
}

// start new game
const startGame = () => {
  createGrid()
  numOfBombs = countBombs(blocks)
  console.log(`Number of bombs = ${numOfBombs}`)
}

// check if user has won the game
const hasUserWon = () => {
  return (numSelected + numOfBombs) === (gridSize * gridSize)
}

const gameOver = (win = false) => {
  if (win) alert("Congratulations, you won!")
  if (confirm("Game Over. Start new game?")) {
    container.innerHTML = ""
    startGame()
  }
}

startGame()
