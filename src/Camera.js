const Camera = {
  getDimensions: function(width, height, cellSide, cellSpacing) {  
    return {
      x: width/(cellSide+cellSpacing),
      y: height/(cellSide+cellSpacing)
    }
  },

  pixelOffset2cellOffset: function(x, y, cellSide, cellSpacing) {
    return {
      x: x/(cellSide+cellSpacing),
      y: y/(cellSide+cellSpacing)
    }
  }
}

export default Camera