const Draw = {
  clearCanvas: function(context, width, height) {
    context.clearRect(0, 0, width, height)
  },

  drawGrid: function(context, width, height, cellSide, cellSpacing, camera) {
    const numRows = Math.ceil(height/cellSide)
    const numColumns = Math.ceil(width/cellSide)

    context.fillStyle = "#f5f5f5"
    context.fillRect(0, 0, width, height)

    const xSubtraction = camera.x % 1
    const ySubtraction = camera.y % 1

    context.fillStyle = "#76b4a6"

    for (let r=0;r<numRows;r++) {
      const x = 0
      const y = (((r+1) * cellSide) + (r * cellSpacing)) - (ySubtraction * (cellSide + cellSpacing))
      
      context.fillRect(x, y, width, cellSpacing)
    }

    for (let c=0;c<numColumns;c++) {
      const x = (((c+1) * cellSide) + (c * cellSpacing)) - (xSubtraction * (cellSide + cellSpacing))
      const y = 0
      context.fillRect(x, y, cellSpacing, height)
    }
  },

  drawActiveCells: function(context, cells, cellSide, cellSpacing, camera) {
    context.fillStyle = "#b3cec8"
  
    const xPadding     = 1 - (camera.x % 1)
    const yPadding     = 1 - (camera.y % 1)

    for (let row in cells) {
      for (let column of cells[row]) {
        const x = (cellSide + cellSpacing) * (column + xPadding - Math.ceil(camera.x)) 
        const y = (cellSide + cellSpacing) * (Number(row) + yPadding - Math.ceil(camera.y))

        context.fillRect(x, y, cellSide, cellSide)
      }
    }
  },

  draw: function(context, cells, canvasWidth, canvasHeight, cellSide, cellSpacing, camera) {
    this.clearCanvas(context, canvasWidth, canvasHeight)
    this.drawGrid(context, canvasWidth, canvasHeight, cellSide, cellSpacing, camera)
    this.drawActiveCells(context, cells, cellSide, cellSpacing, camera)
  }
}

export default Draw