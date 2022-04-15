import { Gameoflife } from './Gameoflife'
import { useEffect, useRef, useState } from 'react'
import { useWindowDimensions, useInterval } from './hooks.js'
import styled from 'styled-components'
import Slider from './components/Slider'
import Draw from './Draw'
import Camera from './Camera'

const StyledApp = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  justify-content: space-between;
  position: absolute;
  z-index: 2000;

  > div:first-of-type {
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0px;
    left: 0px;
    z-index: 2100;
    background-color: orange;
    opacity: 0.2;
    display: ${props => props.block ? "block" : "none"};   
  }

  > canvas {
    width: 100vw;
    height: calc(100vh);
    cursor: pointer;
  }

  > div:not(:last-of-type) {
    filter: blur(${props => props.block ? "3px" : "0px"});
  }
`;

const StyledRulesButton = styled.span`
  background-color: #b3cec8;
  border: 2px solid #679d91;
  padding: 15px;
  border-radius: 2px;
  cursor: pointer;

  &:hover {
    background-color: #679d91;
  }
`;

const StyledToolbarButton = styled.span`
  background-color: #5c8d82;
  border: 2px solid #5c8d82;
  padding: 10px 10px;
  border-radius: 2px;
  cursor: pointer;
  color: #d1e1de;

  &:hover {
    background-color: #5c8d82;
    border-color: #527d74;
  }
`;

const StyledToolbar = styled.div`
  height: 75px;
  width:350px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: #679d91;
  position: fixed;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 2px;

  > div, > span {
    margin: 0px 8px;
  }
`;

const StyledRules = styled.div`
  position: fixed;
  z-index: 2200;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  max-width: 600px;
  min-height: 250px;
  background-color: #b3cec8;
  border: 4px solid #679d91;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  padding: 20px;

  > div {
    > span {
      font-size: 16px;
      line-height: 20px;
      margin-bottom: 16px;
    }

    > div {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      position: relative;
      margin: 10px 0px 20px 0px;
    }
  }
`;

const StyledPreview = styled.div`
  width: 79px;
  height: 79px;
  background-color: #f5f5f5;
  position: relative;
  z-index: 2300;

  > div:not(.cell) {
    position: absolute;
    background-color: #b3cec8;
  }

  > div:nth-child(1), > div:nth-child(2) {
    width: 2px;
    height: 79px;
  }

  > div:nth-child(3), > div:nth-child(4) {
    width: 79px;
    height: 2px;
  }

  > div:nth-child(1) {
    left: 25px;
  }

  > div:nth-child(2) {
    left: 52px;
  }

  > div:nth-child(3) {
    top: 25px;
  }

  > div:nth-child(4) {
    top: 52px;
  }
`;

const StyledPreviewCell = styled.div`
  width: 21px;
  height: 21px;
  background-color: ${props => props.fill ? "#76b4a6" : "#f5f5f5"};
  border: 2px solid ${props => props.active ? "#b47684" : "#76b4a6"};
  position: absolute;
  z-index: 2400;
  top: ${props => props.row * 27}px;
  left: ${props => props.column * 27}px;
`;

///////////////////////////////////////////////////////

const PreviewCell = ({index, fill, active}) => (
  <StyledPreviewCell className="cell" row={Math.floor(index / 3)} column={index % 3} fill={fill} active={active} />
)

const Preview = ({activeCell, cells}) => (
  <StyledPreview>
    <div />
    <div />
    <div />
    <div />

    {
      cells.map(cell => <PreviewCell key={cell} index={cell} fill={true} active={false} />)
    }

    <PreviewCell key={activeCell} index={activeCell} fill={cells.includes(activeCell) && activeCell} active={true} />
  </StyledPreview>
)

const Rules = ({setDisplay}) => {
  const rules = [
    ["Any live cell with fewer than two live neighbours dies, as if by underpopulation.", 4, [1,4], []],
    ["Any live cell with two or three live neighbours lives on to the next generation.", 4, [1,3,4,5], [1,3,4,5]],
    ["Any live cell with more than three live neighbours dies, as if by overpopulation.", 4, [0,1,2,3,4,5], [0,1,2,3,5]],
    ["Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.", 4, [0,1,2], [0,1,2,4]]
  ]

  return ( 
    <StyledRules>
      {
        rules.map(([rule, activeCell, liveCells, futureLiveCells], index) => (
          <div>
            <span>{`${index + 1}. ${rule}`}</span>
            <div>
              <Preview activeCell={activeCell} cells={liveCells} />
              <div>
                <div />
                <div />
                <div />
              </div>
              <Preview activeCell={activeCell} cells={futureLiveCells} />
            </div>
          </div>
        ))
      }

      <StyledRulesButton onClick={() => setDisplay()}>I solemnly swear to have fun!</StyledRulesButton>
    </StyledRules>
  )
}

const Toolbar = ({onChangeUpdateFrequency, isPlaying, onTogglePlay, onReset, didReset, logger}) => (
  <StyledToolbar>
    <StyledToolbarButton onClick={onTogglePlay}>{isPlaying ? "PAUSE" : "START"}</StyledToolbarButton>
    <Slider onSlide={onChangeUpdateFrequency} name="Update frequency" />
    <StyledToolbarButton onClick={onReset}>{didReset ? "CLEAR" : "RESET"}</StyledToolbarButton>
  </StyledToolbar>
)

const StyledLocation = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  width: 50px;
  height: 50px;
  border-radius: 5px;
  background-color: #f5f5f5;
  border: 2px solid #b47684;
  cursor: pointer;

  > div:first-of-type {
    width: 26px;
    height: 26px;
    position: absolute;
    left: 8px;
    top: 8px;
    border: 4px solid #76b4a6;
    border-radius: 50%;

    > div {
      width: 10px;
      height: 10px;
      background-color: #76b4a6;
      border: 4px solid #76b4a6;
      border-radius: 50%;
      position: relative;
      left: 4px;
      top: 4px;
    }
  }

  > div:not(:first-of-type) {
    width: 4px;
    height: 4px;
    border: 2px;
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
    background-color: #76b4a6;
    position: absolute;

    &:hover {
      background-color: #679d91;
    }
  }

  > div:nth-child(2) {
    left: 23px;
    top: 4px;
  }

  > div:nth-child(3) {
    left: 23px;
    top: 42px;
    transform: rotate(180deg);
  }

  > div:nth-child(4) {
    left: 42px;
    top: 23px;
    transform: rotate(90deg);
  }

  > div:nth-child(5) {
    left: 4px;
    top: 23px;
    transform: rotate(-90deg);
  }

  &:hover {
    > div:first-of-type {
      border-color: #679d91;

      > div {
        background-color:  #679d91;
        border-color: #679d91;
      }
    }

    > div:not(:first-of-type) {
      background-color: #679d91;
    }
  }
`;

const Location = ({onClick}) => (
  <StyledLocation onClick={() => onClick()}>
    <div>
      <div />
    </div>

    <div />
    <div />
    <div />
    <div />
  </StyledLocation>
)

const useActiveCells = (inititalCells={}) => {
  const [activeCells, setActiveCells] = useState(inititalCells)

  const toggleCell = (y,x) => {
    const copiedCells = Object.assign({}, activeCells)

    if (!copiedCells.hasOwnProperty(y)) {
      copiedCells[y] = new Set()
    }

    if (copiedCells[y].has(x)) {
      copiedCells[y].delete(x)

      if (copiedCells[y].size === 0) {
        delete copiedCells[y]
      }
    } else {
      copiedCells[y].add(x)
    }

    setActiveCells(copiedCells)
  }

  return [activeCells, toggleCell, setActiveCells]
}

///////////////////////////////////////////////////////

function App(props) {
  const { height, width }                             = useWindowDimensions();
  const [cellSide, setCellSide]                       = useState(20)
  const [cellSpacing, setCellSpacing]                 = useState(2)
  const [updateFrequency, setUpdateFrequency]         = useState(1)
  const [isPlaying, setIsPlaying]                     = useState(false)
  const [didReset, setDidReset]                       = useState(true)
  const canvasRef                                     = useRef(null)
  const [activeCells, toggleCell, setActiveCells]     = useActiveCells({})
  const [displayRules, setDisplayRules]               = useState(false)
  const [isClicking, setIsClicking]                   = useState(false)
  const [isDragging, setIsDragging]                   = useState(false)
  const baseCellSide                                  = 20
  const baseCellSpacing                               = 2
  const [draggingCoordinates, setDraggingCoordinates] = useState({x: 0,y: 0})
  const [camera, setCamera]                           = useState({x:0, y:0})
  const [zoom, setZoom]                               = useState(1)

  const onCanvasMouseDown = event => {
    const x = event.clientX
    const y = event.clientY

    setIsClicking(true)
    setDraggingCoordinates({x,y})
  }

  const onCanvasMouseMove = event => {
    if (isClicking) {
      if (!isDragging) {
        setIsDragging(true)
      }

      const x     = event.clientX
      const y     = event.clientY

      setDraggingCoordinates({x,y})

      const xDiff = x - draggingCoordinates.x
      const yDiff = y - draggingCoordinates.y

      const offset   = Camera.pixelOffset2cellOffset(xDiff, yDiff, cellSide, cellSpacing)

      const newCam   = {
        x: camera.x - (offset.x),
        y: camera.y - (offset.y)
      }

      setCamera(newCam)
    }
  }

  const onCanvasMouseUp = event => {
    const x     = event.clientX
    const y     = event.clientY

    const xDiff = x - draggingCoordinates.x
    const yDiff = y - draggingCoordinates.y

    if (xDiff === 0 && yDiff === 0 && !isDragging) {
      const offset = Camera.pixelOffset2cellOffset(x, y, cellSide, cellSpacing)
      const xToggle = Math.floor(offset.x + camera.x)
      const yToggle = Math.floor(offset.y + camera.y)

      toggleCell(yToggle, xToggle) // TODO not working
    } else {
      setIsDragging(false)
    }

    setIsClicking(false)
  }

  const getDimensions = magnification => ({
    x: width  / (magnification * (cellSide + cellSpacing)),
    y: height / (magnification * (cellSide + cellSpacing)),
  })

  const onCanvasScroll = event => {
    const zoomChangeConstant = 0.2
    const INCREASE           = true
    const minZoom            = 0.2
    const maxZoom            = 3
    const direction          = event.deltaY < 0
    const directionFactor    = direction === INCREASE ? 1 : -1

    const addition           = zoomChangeConstant * directionFactor
    const newZoom            = zoom + addition

    if ((direction === INCREASE && newZoom <= maxZoom) || (direction !== INCREASE && newZoom >= minZoom)) {
      const newCellSide      = newZoom * baseCellSide
      const newCellSpacing   = newZoom * baseCellSpacing
      const zoomMoveConstant = 0.3

      const relativeOffset   = {
        x: ((event.clientX - (width/2))/(width/2)) * directionFactor,
        y: ((event.clientY - (height/2))/(height/2)) * directionFactor
      }

      const currentDimensions = getDimensions(zoom)
      const newDimensions     = getDimensions(newZoom)
      const dimensionDiff     = {
        x: (newDimensions.x - currentDimensions.x),
        y: (newDimensions.y - currentDimensions.y)
      }
      
      const newCamera         = {
        x: camera.x - (dimensionDiff.x/2) - (relativeOffset.x * (dimensionDiff.x/2)),
        y: camera.y - (dimensionDiff.y/2) - (relativeOffset.y * (dimensionDiff.y/2)),
      }

      setCellSide(newCellSide)
      setCellSpacing(newCellSpacing)
      setZoom(newZoom)
      setCamera(newCamera)
    }
  }

  const onLocationClick = _ => {
    const center     = Gameoflife.getCenter(activeCells, true)
    const dimensions = getDimensions(zoom)

    const newCamera  = {
      x: center.x - (dimensions.x/2),
      y: center.y - (dimensions.y/2)
    }

    setCamera(newCamera)
  }

  const setInitialConfiguration = () => {
    const cells = {
      "0": new Set([1]),
      "1": new Set([0, 2]),
      "2": new Set([0, 1, 2]),
      "3": new Set([1]),
    }

    // "1": new Set([0, 2]) TODO
    const padding    = 10000 // if you move the camera more than 10k squares left of the middle, then the weird camera borders are on you ;)
    const movedCells = Gameoflife.moveCells(cells, padding, padding)
    const center     = Gameoflife.getCenter(movedCells, false)
    const dimensions = getDimensions(zoom)
    const initialCam = {
      x: center.x - (dimensions.x/2),
      y: center.y - (dimensions.y/2)
    }

    setCamera(initialCam)
    setActiveCells(movedCells)
  }

  useEffect(() => {
    setInitialConfiguration()

    // only used if project runs on homepage
    if (props.onLoaded) {
      props.onLoaded()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    Draw.draw(context, activeCells, width, height, cellSide, cellSpacing, camera)
  }, [activeCells, onCanvasMouseDown, onCanvasMouseUp, Draw.draw, camera])

  useInterval(() => {
    if (isPlaying) {
      const nextGeneration = Gameoflife.getNextGeneration(activeCells)
      console.log(nextGeneration)
      setActiveCells(nextGeneration)
    }
  }, (1000/updateFrequency))

  return (
    <StyledApp block={displayRules}>
      <canvas ref={canvasRef} width={width} height={height} onWheel={onCanvasScroll} onMouseDown={onCanvasMouseDown} onMouseMove={onCanvasMouseMove} onMouseUp={onCanvasMouseUp} />
      <div />
      <Toolbar
        onChangeUpdateFrequency={setUpdateFrequency}
        isPlaying={isPlaying} didReset={didReset} 
        onTogglePlay={() => {
          setIsPlaying(!isPlaying);
          setDidReset(false)
        }}
        onReset={() => {
          setIsPlaying(false);

          if (didReset) {
            setActiveCells({});
            setDidReset(false)
          } else {
            setDidReset(true);
            setInitialConfiguration()
          }
        }}
      />
      <Location onClick={() => onLocationClick()} />
      {
        displayRules &&
          <Rules setDisplay={() => setDisplayRules(false)} />
      }
    </StyledApp>
  );
}

export default App;
