import { Gameoflife } from './Gameoflife'
import { useEffect, useRef, useState } from 'react'
import { useWindowDimensions, useInterval } from './hooks.js'
import styled from 'styled-components'
import './cssReset.css'
import Slider from './components/Slider'
import Draw from './Draw'

const StyledApp = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  justify-content: space-between;
  position: absolute;
  z-index: 2000;

  > canvas {
    width: 100vw;
    height: calc(100vh - 60px);
  }

  > div {
    position: absolute; // makes it easier to import into homepage project
    bottom: 0;          // same
  }
`;

const StyledToolbar = styled.div`
  height: 59px;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: #679d91;
  border-top: 1px solid #76b4a6;

  > button {
    width: 100px;
    padding: 10px;
    outline: none;
    border: none;
    background-color: #58877c;
    color: #f5f5f5;
    cursor: pointer;

    &:hover {
      background-color: #4a7068;
    }

    &:active {
      background-color: #3b5a53;
    }
  }

  & > * {
    margin: 0px 10px;
  }
`;

const Toolbar = ({onChangeUpdateFrequency, onChangeZoom, isPlaying, onTogglePlay, onReset, didReset}) => (
  <StyledToolbar>
    <Slider onSlide={onChangeUpdateFrequency} name="Update freq." />
    <button onClick={onTogglePlay}>{isPlaying ? "PAUSE" : "START"}</button>
    <button onClick={onReset}>{didReset ? "CLEAR" : "RESET"}</button>
    <Slider onSlide={onChangeZoom} vals={[0.5, 1, 5]} name="Zoom" />
  </StyledToolbar>
)

const useActiveCells = (inititalCells={}) => {
  const [activeCells, setActiveCells] = useState(inititalCells)

  const toggleCell = (x,y) => {
    const copiedCells = Object.assign({}, activeCells)

    if (!copiedCells.hasOwnProperty(y)) {
      copiedCells[y] = new Set()
    }

    if (copiedCells[y].has(x)) {
      copiedCells[y].delete(x)
    } else {
      copiedCells[y].add(x)
    }

    setActiveCells(copiedCells)
  }

  return {activeCells, toggleCell, setActiveCells}
}

function App(props) {
  const { height, width }                         = useWindowDimensions();
  const [cellSide, setCellSide]                   = useState(20)
  const [cellSpacing, setCellSpacing]             = useState(2)
  const [zoom, setZoom]                           = useState(1)
  //const [xOffset, setXOffset]                   = useState(0)
  //const [yOffset, setYOffset]                   = useState(0)
  const [updateFrequency, setUpdateFrequency]     = useState(1)
  const [isPlaying, setIsPlaying]                 = useState(false)
  const [didReset, setDidReset]                   = useState(true)
  const canvasRef                                 = useRef(null)
  const {activeCells, toggleCell, setActiveCells} = useActiveCells({})

  const onCanvasClick = event => {
    const xCoor = event.clientX
    const yCoor = event.clientY

    const row = Math.floor(yCoor/(cellSide + cellSpacing))
    const column = Math.floor(xCoor/(cellSide + cellSpacing))

    toggleCell(column, row)
  }

  const setInitialConfiguration = () => {
    const cells = {
      "0": new Set([1]),
      "1": new Set([0, 2]),
      "2": new Set([0, 1, 2]),
      "3": new Set([1]),
    }

    const xOffset = Math.floor((width/(cellSide+cellSpacing))/2)-1
    const yOffset = Math.floor((height/(cellSide+cellSpacing))/2)-3

    const shiftedCells = {}

    for (let row in cells) {
      const y = String(Number(row) + yOffset)

      shiftedCells[y] = new Set()

      for (let column of cells[row]) {
        shiftedCells[y].add(column + xOffset)
      }
    }

    setActiveCells(shiftedCells)
  }

  useEffect(() => {
    setInitialConfiguration()

    // only used if project runs on homepage
    if (props.onLoaded) {
      props.onLoaded()
    }
  }, [])

  useEffect(() => {
    setCellSide(zoom * 20)
    setCellSpacing(zoom * 2)
  }, [zoom])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    canvas.onclick = (event) => onCanvasClick(event)

    Draw.draw(context, activeCells, width, height, cellSide, cellSpacing)
  }, [activeCells, onCanvasClick, Draw.draw])

  useInterval(() => {
    if (isPlaying) {
      const nextGeneration = Gameoflife.getNextGeneration(activeCells)
      setActiveCells(nextGeneration)
    }
  }, (1000/updateFrequency))

  return (
    <StyledApp>
      <canvas ref={canvasRef} width={width} height={height-60} />
      <Toolbar
        onChangeUpdateFrequency={setUpdateFrequency}
        onChangeZoom={setZoom} 
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
    </StyledApp>
  );
}

export default App;
