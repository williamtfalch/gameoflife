export const Gameoflife = {
  getNumCellNeighbours: function(cells,x,y) {
    let numCellNeighbours = 0 

    for(let i=0;i<3;i++) {
      const ny = String(y-1+i)

      for(let j=0;j<3;j++) {
        const nx = x-1+j

        const isCellNeighbour = (cells.hasOwnProperty(ny) && cells[ny].has(nx)) ? true : false

        if (isCellNeighbour) {
          numCellNeighbours += 1
        }
      }
    }

    numCellNeighbours -= 1

    return numCellNeighbours
  },

  getCellCandidates: function(cells) {
    const cellCandidates = {}

    for (let row in cells) {
      for (let column of cells[row]) {
        for(let i=0;i<3;i++) {
          const ny = row-1+i

          if (!cellCandidates.hasOwnProperty(ny)) {
            cellCandidates[ny] = {}
          }
    
          for(let j=0;j<3;j++) {
            const nx = column-1+j

            if (!cellCandidates[ny].hasOwnProperty(nx)) {
              cellCandidates[ny][nx] = 0
            }

            cellCandidates[ny][nx] += 1
          }
        }

        cellCandidates[row][column] -= 1
      } 
    }

    return cellCandidates
  },

  getCellsFromCandidates: function(candidates) {
    const rule = numCandidateNeighbours => numCandidateNeighbours === 3 ? true : false
    const newCells = {}

    for (let row in candidates) {
      for (let column in candidates[row]) {
        if (rule(candidates[row][column])) {
          if (!newCells.hasOwnProperty(row)) {
            newCells[row] = new Set()
          }

          newCells[row].add(Number(column))
        }
      }
    }

    return newCells
  },

  getSurvivingCells: function(cells) {
    const rule = numNeighbours => (numNeighbours === 2 || numNeighbours === 3) ? true : false
    const survivingCells = {}

    for (let row in cells) {
      for (let column of cells[row]) {
        const numCellNeighbours = this.getNumCellNeighbours(cells, column, row)

        if (rule(numCellNeighbours)) {
          if (!survivingCells.hasOwnProperty(row)) {
            survivingCells[row] = new Set()
          }

          survivingCells[row].add(column)
        }
      }
    }

    return survivingCells
  },

  mergeCells: function(newCells, survivingCells) {
    const mergedCells = Object.assign({}, survivingCells)

    for (let row in newCells) {
      if (!mergedCells.hasOwnProperty(row)) {
        mergedCells[row] = new Set(newCells[row])
      } else {
        mergedCells[row] = new Set([...mergedCells[row], ...newCells[row]])
      }
    }

    return mergedCells
  },

  map2str: cells => {
    const sortedKeys = Object.keys(cells).map(k => Number(k)).sort((a, b) => a - b)
    const numKeys = sortedKeys.length
    const columnStart = sortedKeys[0]
    let mapRowMax = 0
    let mapRowMin = Math.min(...cells[sortedKeys[0]])

    for (let key of sortedKeys) {
      const rowMax = Math.max(...cells[key])
      const rowMin = Math.min(...cells[key])

      if (rowMax > mapRowMax) mapRowMax = rowMax
      if (rowMin < mapRowMin) mapRowMin = rowMin
    }

    const rowLength = Math.abs(mapRowMax - mapRowMin + 1)
    const columnHeight = Math.abs(sortedKeys[numKeys - 1] - sortedKeys[0])

    let currentKeyIndex = 0

    console.log(Array(rowLength + 2).fill("-").join(""))

    for (let i=columnStart;i<=columnStart + columnHeight;i++) {
      let line = Array(rowLength).fill(0)

      if (currentKeyIndex < numKeys && i === sortedKeys[currentKeyIndex]) {
        line = line.map((_, j) => cells[sortedKeys[currentKeyIndex]].has(mapRowMin + j) ? 1 : 0)

        currentKeyIndex += 1
      }

      line.unshift("|")
      line.push("|")

      console.log(line.join(''))
    }

    console.log(Array(rowLength + 2).fill("-").join(""))
  },

  normalizeCells: function(cells) {
    const sortedKeys = Object.keys(cells).map(k => Number(k)).sort((a, b) => a - b)
    const normalizedMap = {}
    let mapRowMax = 0
    let mapRowMin = Math.min(...cells[sortedKeys[0]])
    
    for (let key of sortedKeys) {
      const rowMax = Math.max(...cells[key])
      const rowMin = Math.min(...cells[key])

      if (rowMax > mapRowMax) mapRowMax = rowMax
      if (rowMin < mapRowMin) mapRowMin = rowMin
    }

    const xOffset = mapRowMin
    const yOffset = sortedKeys[0]

    for (let key of sortedKeys) {
      normalizedMap[key - yOffset] = new Set(Array.from(cells[key]).map(k => k - xOffset))
    }

    return [xOffset, yOffset, normalizedMap]
  },

  centerCells: function(cells) {
    return cells
  },

  getNextGeneration: function(cells) {
    const cellCandidates = this.getCellCandidates(cells)                 // {n: {}}
    const newCells = this.getCellsFromCandidates(cellCandidates)         // {n: Set()}
    const survivingCells = this.getSurvivingCells(cells)                 // {n: Set()}
    const mergedCells = this.mergeCells(newCells, survivingCells)        // {n: Set()}
    const centeredCells = this.centerCells(mergedCells)                  // {n: Set()}

    return mergedCells
  },
}