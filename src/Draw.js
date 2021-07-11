const Draw = {
  clearCanvas: function(context, width, height) {
    context.clearRect(0, 0, width, height)
  },

  drawGrid: function(context, width, height, cellSide, cellSpacing) {
    const numRows = Math.ceil(height/cellSide)
    const numColumns = Math.ceil(width/cellSide)

    context.fillStyle = "#f5f5f5"
    context.fillRect(0, 0, width, height)
    
    context.fillStyle = "#76b4a6"
    for (let r=0;r<numRows-1;r++) context.fillRect(0, (((r+1) * cellSide) + (r * cellSpacing)), width, cellSpacing)
    for (let c=0;c<numColumns-1;c++) context.fillRect((((c+1) * cellSide) + (c * cellSpacing)), 0, cellSpacing, height)
  },

  drawActiveCells: function(context, cells, cellSide, cellSpacing) {
    context.fillStyle = "#94E1D0"

    for (let row in cells) {
      for (let column of cells[row]) {
        context.fillRect((cellSide + cellSpacing) * column, (cellSide + cellSpacing) * Number(row), cellSide, cellSide)
      }
    }
  },

  draw: function(context, cells, canvasWidth, canvasHeight, cellSide, cellSpacing) {
    this.clearCanvas(context, canvasWidth, canvasHeight)
    this.drawGrid(context, canvasWidth, canvasHeight, cellSide, cellSpacing)
    this.drawActiveCells(context, cells, cellSide, cellSpacing)
  }
}

export default Draw