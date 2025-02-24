import React, { useRef, useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { Eye, EyeOff, Camera } from 'lucide-react';

function App() {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);

  const drawDetections = (detections: any[], ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    detections.forEach((detection) => {
      const { x, y, width, height } = detection.bbox;
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      ctx.fillStyle = '#00FF00';
      ctx.font = '12px Arial';
      ctx.fillText(
        `${detection.class} (${Math.round(detection.confidence * 100)}%)`,
        x,
        y > 10 ? y - 5 : 10
      );
    });
  };

  const sendFrameToBackend = useCallback(async () => {
    if (!isDetecting || !webcamRef.current || !canvasRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      const response = await fetch('http://127.0.0.1:5000/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageSrc }),
      });
      const result = await response.json();
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        drawDetections(result.detections, ctx);
      }
    } catch (error) {
      console.error('Error detecting eyes:', error);
    }
    
    // Schedule the next frame
    const reqId = requestAnimationFrame(sendFrameToBackend);
    setAnimationFrameId(reqId);
  }, [isDetecting]);

  useEffect(() => {
    if (isDetecting) {
      // Start sending frames continuously
      const reqId = requestAnimationFrame(sendFrameToBackend);
      setAnimationFrameId(reqId);
    } else {
      // Stop detection: cancel the next animation frame if exists
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    }
    // Cleanup function to cancel any pending frame on unmount or when isDetecting changes
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isDetecting, sendFrameToBackend, animationFrameId]);

  const toggleDetection = () => {
    setIsDetecting((prev) => !prev);
  };

  const toggleCamera = () => {
    setIsCameraOn((prev) => !prev);
    // If turning off the camera, also stop detection
    if (isCameraOn) setIsDetecting(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Real-time Eye Detection</h1>
         
        </div>

        <div className="relative w-full max-w-2xl mx-auto rounded-lg overflow-hidden">
          {isCameraOn && (
            <>
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full rounded-lg"
                style={{ transform: 'scaleX(-1)' }}
                videoConstraints={{ width: 640, height: 480 }}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
                width={640}
                height={480}
              />
            </>
          )}
          
          {!isCameraOn && (
            <div className="bg-gray-800 w-full h-[480px] flex items-center justify-center rounded-lg">
              <p className="text-gray-400">Camera is turned off</p>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={toggleCamera}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Camera size={20} />
            {isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
          </button>
          
          {isCameraOn && (
            <button
              onClick={toggleDetection}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                isDetecting
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isDetecting ? (
                <>
                  <EyeOff size={20} />
                  Stop Detection
                </>
              ) : (
                <>
                  <Eye size={20} />
                  Start Detection
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
