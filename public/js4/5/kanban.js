let lists = []
let items = []
let undos = []

// List class
function List(container, index) {
  this.index = index

  const input = container.querySelector(".input")
  const textarea = input.querySelector("textarea")
  const button = input.querySelector("button")

  // Add click funcionality to the Submit button
  button.addEventListener("click", () => {
    const text = textarea.value
    if (!text) return
    const item = new Item(text, this)
    this.addItem(item)
    textarea.value = ""
    undos.push({ new: item })
  })

  // Add the item to this list and update the display
  this.addItem = (item) => {
    const itemElement = this.updateItemElement(item)
    container.insertBefore(itemElement, input)
    items.push(item)
    updateLocalStorage()
  }

  // Swap the item to another list (deletes the object and creates a new one for the new list)
  this.swapTo = (item, list) => {
    const newItem = new Item(item.text, list)
    undos.push({ old: item, new: newItem })
    list.addItem(newItem)
    item.delete()
  }

  // Update the item element to display on the list and add click funcionality to swap and delete
  this.updateItemElement = (item) => {
    const itemElement = item.getNewElement()
    const left = itemElement.querySelector(".left")
    const right = itemElement.querySelector(".right")
    const text = itemElement.querySelector(".text")

    text.addEventListener("click", (e) => {
      e.stopPropagation()
      if (confirm("Delete this entry?")) {
        undos.push({ old: item })
        item.delete()
      }
    })
    if (this.index > 0) {
      left.innerText = "<"
      left.addEventListener("click", () => {
        this.swapTo(item, lists[this.index - 1])
      })
    }
    if (this.index < lists.length - 1) {
      right.innerText = ">"
      right.addEventListener("click", () => {
        this.swapTo(item, lists[this.index + 1])
      })
    }

    return itemElement
  }
}

// Item class
function Item(text, list) {
  this.text = text
  this.index = list.index // index of the list this item is in

  let element = {}

  // Delete the item from the list and its element to remove from display
  this.delete = () => {
    const idx = items.indexOf(this)
    items.splice(idx, 1)
    element.remove()
    updateLocalStorage()
  }

  // Creates a new element for the item
  this.getNewElement = () => {
    element = document.createElement("div")
    element.classList.add("item")
    element.innerHTML = `
      <div class="arrow left"></div>
      <div class="text">${this.text}</div>
      <div class="arrow right"></div>
    `
    return element
  }
}

// Save the items array of objects to local storage
const updateLocalStorage = () => {
  localStorage.setItem("items", JSON.stringify(items))
}

// Loads the local storage if it exists
const loadLocalStorage = () => {
  const ls = localStorage.getItem("items")
  return JSON.parse(ls)
}

// Starts the app, renders the lists and add the items from local storage
const start = () => {
  ls = loadLocalStorage()
  const containers = document.querySelectorAll(".container")
  lists = Array.from(containers).map((container, i) => {
    return new List(container, i)
  })

  if (ls) {
    ls.forEach((item) => {
      const list = lists[item.index]
      list.addItem(new Item(item.text, list))
    })
  }
}

// Undo functionality
const undo = () => {
  const obj = undos.pop() // retrieve the last action
  if (obj.new) {
    // delete the new item
    obj.new.delete()
  }
  if (obj.old) {
    // restore the old item
    lists[obj.old.index].addItem(obj.old)
  }
}

start()
