import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

const StyledSlider = styled.div`
  width: ${props => props.sliderWidth + props.diameter}px;
  height: 50px;
  position: relative;
  -webkit-user-select:none;
  -moz-user-select:none;
  user-select:none;

  > div:first-child {
    display: flex;
    position: relative;
    flex-direction: column;
    justify-content: space-between;
    height: 50px;

    > * {
      height: 20px;
      width: inherit;
    }

    > p {
      text-align: center;
      position: relative;
      top: -3px;
      color: #eff5f4;
    }

    > div {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      position: relative;
    }

    > div p {
      position: relative;
      top: 3px;
      color: #141f1d;
    }

    > div p:nth-child(2) {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  > div:last-child {
    position: absolute;
    top: 8px;
    height: 30px;
    width: ${props => props.sliderWidth}px;
  
    > div {
      position: absolute;
      width: ${props => props.sliderWidth}px;
      height: 2px;
      top: 14px;
      left: ${props => props.diameter/2}px;
      background-color: #f5f5f5;
    }

    > span {
      position: absolute;
      height: ${props => props.diameter}px;
      width: ${props => props.diameter}px;
      top: ${props => ((30 - props.diameter)/2)}px;
      background-color: #f5f5f5;
      border: 1px solid #aaa;
      border-radius: 50%;
      left: ${props => props.xOffset}px;
      cursor: pointer;
    }
  }
`;

const Slider = ({onSlide, name, vals = [0.1, 1, 10], sliderWidth = 130, diameter = 12}) => {
  const [isDragging, setIsDragging] =         useState(false)
  const [xOffset, setXOffset] =               useState(0)
  const [initialXOffset, setInitialXOffset] = useState(0)

  const draggableRef =                        useRef(null)
  const distanceToMiddle =                    sliderWidth/2

  const onMouseMove = event => {
    if (isDragging) {
      const relativeOffset = draggableRef.current.getBoundingClientRect().x - initialXOffset
      let amplitude = relativeOffset - distanceToMiddle
      const newXOffset = event.clientX - initialXOffset

      if (newXOffset >= 0 && newXOffset <= sliderWidth && newXOffset !== xOffset) {
        let cv
        const multiplier = (Math.abs(amplitude)/(sliderWidth/2))
        
        if (amplitude > 0) {
          cv = (vals[1] + ((vals[2] - vals[1]) * multiplier))
        } else {
          cv = (vals[1] - ((vals[1] - vals[0]) * multiplier))
        }

        cv = cv.toFixed(2)
        
        setXOffset(newXOffset)
        onSlide(cv)
      }
    }
  }

  useEffect(() => {
    setInitialXOffset(draggableRef.current.getBoundingClientRect().x)
    setXOffset(distanceToMiddle)
  }, [])

  return (
    <StyledSlider onMouseMove={event => onMouseMove(event)} onMouseUp={() => setIsDragging(false)} onMouseLeave={() => setIsDragging(false)} xOffset={xOffset} sliderWidth={sliderWidth} diameter={diameter}>
      <div key="info">
        <p>{name}</p>
        <div>
          {
            vals.map(k => <p key={String(k)}>{k}</p>)
          }
        </div>
      </div>
      <div key="slider" onMouseDown={() => setIsDragging(true)} >
        <div></div>
        <span ref={draggableRef} />
      </div>
    </StyledSlider>
  )
}

export default Slider