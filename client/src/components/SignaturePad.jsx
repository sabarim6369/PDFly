import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react'

const SignaturePad = forwardRef(({ onBegin, onEnd, penColor = 'black' }, ref) => {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const ctxRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    // Make canvas sharp on high DPI displays
    const rect = canvas.parentElement.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext('2d')
    ctx.scale(2, 2)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 3
    ctx.strokeStyle = penColor
    ctxRef.current = ctx
  }, [penColor])

  useImperativeHandle(ref, () => ({
    clear: () => {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    },
    isEmpty: () => {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const pixelBuffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer)
      return !pixelBuffer.some(color => color !== 0)
    },
    toDataURL: (type = 'image/png') => {
      return canvasRef.current.toDataURL(type)
    }
  }))

  const startDrawing = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    
    ctxRef.current.beginPath()
    ctxRef.current.moveTo(clientX - rect.left, clientY - rect.top)
    setIsDrawing(true)
    if (onBegin) onBegin()
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault() // prevent scrolling on touch
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    
    ctxRef.current.lineTo(clientX - rect.left, clientY - rect.top)
    ctxRef.current.stroke()
  }

  const stopDrawing = () => {
    ctxRef.current.closePath()
    setIsDrawing(false)
    if (onEnd) onEnd()
  }

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
      className="w-full h-full rounded-lg cursor-crosshair touch-none"
    />
  )
})

SignaturePad.displayName = 'SignaturePad'
export default SignaturePad
