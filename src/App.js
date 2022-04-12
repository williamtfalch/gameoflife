import { Gameoflife } from './Gameoflife'
import { useEffect, useRef, useState } from 'react'
import { useWindowDimensions, useInterval } from './hooks.js'
import styled from 'styled-components'
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
    height: calc(100vh - 60px);
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
  height: 60px;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: #679d91;
  position: absolute;
  bottom: 0;

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

      <StyledRulesButton onClick={() => setDisplay()}>I understand</StyledRulesButton>
    </StyledRules>
  )
}

const Toolbar = ({onChangeUpdateFrequency, onChangeZoom, isPlaying, onTogglePlay, onReset, didReset}) => (
  <StyledToolbar>
    <Slider onSlide={onChangeUpdateFrequency} name="Update freq." />
    <StyledToolbarButton onClick={onTogglePlay}>{isPlaying ? "PAUSE" : "START"}</StyledToolbarButton>
    <StyledToolbarButton onClick={onReset}>{didReset ? "CLEAR" : "RESET"}</StyledToolbarButton>
    <Slider onSlide={onChangeZoom} vals={[0.75, 1, 5]} name="Zoom" />
  </StyledToolbar>
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
    } else {
      copiedCells[y].add(x)
    }

    setActiveCells(copiedCells)
  }

  return {activeCells, toggleCell, setActiveCells}
}


///////////////////////////////////////////////////////

function App(props) {
  const { height, width }                         = useWindowDimensions();
  const [cellSide, setCellSide]                   = useState(20)
  const [cellSpacing, setCellSpacing]             = useState(2)
  const [numRows, setNumRows]                     = useState(0)
  const [numColumns, setNumColumns]               = useState(0)
  const [SyntheticAddition, setSyntheticAddition] = useState(5000)
  const [zoom, setZoom]                           = useState(1)
  const [updateFrequency, setUpdateFrequency]     = useState(1)
  const [isPlaying, setIsPlaying]                 = useState(false)
  const [didReset, setDidReset]                   = useState(true)
  const canvasRef                                 = useRef(null)
  const {activeCells, toggleCell, setActiveCells} = useActiveCells({})
  const [displayRules, setDisplayRules]           = useState(true)

  const onCanvasClick = event => {
    const xCoor = event.clientX
    const yCoor = event.clientY

    const row = Math.floor(yCoor/(cellSide + cellSpacing))
    const column = Math.floor(xCoor/(cellSide + cellSpacing))

    toggleCell(row, column)
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
    setNumRows(Math.ceil(height/(cellSide+cellSpacing)))
    setNumColumns(Math.ceil(width/(cellSide+cellSpacing))) 
  }, [width, height])

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
    <StyledApp block={displayRules}>
      <canvas ref={canvasRef} width={width} height={height-60} />
      <div />
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
      {
        displayRules &&
          <Rules setDisplay={() => setDisplayRules(false)} />
      }
    </StyledApp>
  );
}

export default App;
