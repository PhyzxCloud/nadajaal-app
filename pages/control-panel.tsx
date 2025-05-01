"use client";

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

const ControlPanel = () => {
  const [leftFreq, setLeftFreq] = React.useState(174);
  const [rightFreq, setRightFreq] = React.useState(174);
  const [baseFreq, setBaseFreq] = React.useState(174);
  const [toneType, setToneType] = React.useState('Sine');
  const [bgMusic, setBgMusic] = React.useState('None');
  const [volume, setVolume] = React.useState(50);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [p5Loaded, setP5Loaded] = React.useState(false);
  const leftSketchRef = React.useRef<HTMLDivElement>(null);
  const rightSketchRef = React.useRef<HTMLDivElement>(null);
  const overlapSketchRef = React.useRef<HTMLDivElement>(null);
  const mandalaSketchRef = React.useRef<HTMLDivElement>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const leftOscillatorRef = React.useRef<OscillatorNode | null>(null);
  const rightOscillatorRef = React.useRef<OscillatorNode | null>(null);
  const leftPannerRef = React.useRef<StereoPannerNode | null>(null);
  const rightPannerRef = React.useRef<StereoPannerNode | null>(null);
  const gainNodeRef = React.useRef<GainNode | null>(null);
  const leftSketchRefInstance = React.useRef<any>(null);
  const rightSketchRefInstance = React.useRef<any>(null);
  const overlapSketchRefInstance = React.useRef<any>(null);
  const mandalaSketchRefInstance = React.useRef<any>(null);
  const freqRef = React.useRef({ leftFreq: 174, rightFreq: 174, toneType: 'Sine' });

  // Load p5.js script dynamically on the client side
  React.useEffect(() => {
    const loadP5Script = () => {
      if (typeof window !== 'undefined' && !window.p5) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.2/p5.min.js';
        script.async = true;
        script.onload = () => {
          console.log('p5.js loaded successfully');
          setP5Loaded(true);
        };
        script.onerror = () => {
          console.error('Failed to load p5.js');
        };
        document.head.appendChild(script);
      } else if (window.p5) {
        setP5Loaded(true);
      }
    };

    loadP5Script();

    return () => {
      const scripts = document.querySelectorAll('script[src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.2/p5.min.js"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  // Sync base frequency with left and right frequencies
  React.useEffect(() => {
    const diff = rightFreq - leftFreq;
    setLeftFreq(baseFreq);
    setRightFreq(baseFreq + diff);
  }, [baseFreq]);

  // Update freqRef when frequencies, volume, or toneType change
  React.useEffect(() => {
    freqRef.current = { leftFreq, rightFreq, toneType };
  }, [leftFreq, rightFreq, volume, toneType]);

  // Initialize AudioContext and Oscillators
  const setupAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.setValueAtTime(volume / 100, audioContextRef.current.currentTime);
      gainNodeRef.current.connect(audioContextRef.current.destination);

      leftPannerRef.current = audioContextRef.current.createStereoPanner();
      leftPannerRef.current.pan.setValueAtTime(-1, audioContextRef.current.currentTime);
      leftPannerRef.current.connect(gainNodeRef.current);

      rightPannerRef.current = audioContextRef.current.createStereoPanner();
      rightPannerRef.current.pan.setValueAtTime(1, audioContextRef.current.currentTime);
      rightPannerRef.current.connect(gainNodeRef.current);
    }
  };

  const startAudio = () => {
    setupAudio();
    if (audioContextRef.current && !leftOscillatorRef.current && !rightOscillatorRef.current && !isPlaying) {
      leftOscillatorRef.current = audioContextRef.current.createOscillator();
      leftOscillatorRef.current.type = toneType.toLowerCase() as OscillatorType;
      leftOscillatorRef.current.frequency.setValueAtTime(leftFreq, audioContextRef.current.currentTime);
      leftOscillatorRef.current.connect(leftPannerRef.current!);
      leftOscillatorRef.current.start();

      rightOscillatorRef.current = audioContextRef.current.createOscillator();
      rightOscillatorRef.current.type = toneType.toLowerCase() as OscillatorType;
      rightOscillatorRef.current.frequency.setValueAtTime(rightFreq, audioContextRef.current.currentTime);
      rightOscillatorRef.current.connect(rightPannerRef.current!);
      rightOscillatorRef.current.start();
    }
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    if (audioContextRef.current) {
      audioContextRef.current.suspend();
      setIsPlaying(false);
    }
  };

  const resumeAudio = () => {
    if (audioContextRef.current) {
      audioContextRef.current.resume();
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    if (leftOscillatorRef.current && rightOscillatorRef.current) {
      leftOscillatorRef.current.stop();
      rightOscillatorRef.current.stop();
      leftOscillatorRef.current = null;
      rightOscillatorRef.current = null;
      leftSketchRefInstance.current?.remove();
      rightSketchRefInstance.current?.remove();
      overlapSketchRefInstance.current?.remove();
      mandalaSketchRefInstance.current?.remove();
      leftSketchRefInstance.current = null;
      rightSketchRefInstance.current = null;
      overlapSketchRefInstance.current = null;
      mandalaSketchRefInstance.current = null;
    }
    setIsPlaying(false);
  };

  // Update frequency and volume in real-time
  React.useEffect(() => {
    if (leftOscillatorRef.current) {
      leftOscillatorRef.current.frequency.setValueAtTime(leftFreq, audioContextRef.current!.currentTime);
    }
    if (rightOscillatorRef.current) {
      rightOscillatorRef.current.frequency.setValueAtTime(rightFreq, audioContextRef.current!.currentTime);
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume / 100, audioContextRef.current!.currentTime);
    }
  }, [leftFreq, rightFreq, volume]);

  React.useEffect(() => {
    if (leftOscillatorRef.current && rightOscillatorRef.current) {
      leftOscillatorRef.current.type = toneType.toLowerCase() as OscillatorType;
      rightOscillatorRef.current.type = toneType.toLowerCase() as OscillatorType;
    }
  }, [toneType]);

  // Initialize p5.js sketches after p5 is loaded and DOM is ready
  React.useEffect(() => {
    if (!p5Loaded || !window.p5) {
      console.log('p5.js not loaded yet');
      return;
    }

    if (!leftSketchRef.current || !rightSketchRef.current || !overlapSketchRef.current || !mandalaSketchRef.current) {
      console.error('One or more refs not ready');
      return;
    }

    const initializeSketches = () => {
      console.log('Initializing sketches');

      // Function to calculate waveform value based on toneType
      const getWaveformValue = (p: any, x: number, freq: number, toneType: string, phase: number, amplitude: number) => {
        const t = x * 0.1 + phase;
        const scaledFreq = freq / 174;
        switch (toneType.toLowerCase()) {
          case 'sine':
            return p.sin(t * scaledFreq) * amplitude;
          case 'square':
            return p.sin(t * scaledFreq) > 0 ? amplitude : -amplitude;
          case 'sawtooth':
            return ((t * scaledFreq) % p.TWO_PI) / p.PI * amplitude - amplitude;
          case 'triangle':
            return (2 / p.PI) * p.asin(p.sin(t * scaledFreq)) * amplitude;
          default:
            return p.sin(t * scaledFreq) * amplitude;
        }
      };

      // Left Frequency Waveform
      if (!leftSketchRefInstance.current) {
        const sketch = (p: any) => {
          let canvasWidth = leftSketchRef.current!.offsetWidth;
          p.setup = () => {
            p.createCanvas(canvasWidth, 150).parent(leftSketchRef.current!);
            p.background(255);
            console.log('Left sketch setup, width:', canvasWidth);
          };

          p.draw = () => {
            if (isPlaying) {
              p.background(255);
              p.stroke(255, 99, 71); // Tomato red
              p.strokeWeight(2);
              const amplitude = (volume / 100) * 50;
              for (let x = 0; x < p.width; x++) {
                let y = p.height / 2 + getWaveformValue(p, x, freqRef.current.leftFreq, freqRef.current.toneType, p.frameCount * 0.05, amplitude);
                p.point(x, y);
              }
              console.log('Left sketch drawing, leftFreq:', freqRef.current.leftFreq, 'volume:', volume, 'toneType:', freqRef.current.toneType);
            } else {
              p.background(255);
            }
          };

          // Handle resize
          p.windowResized = () => {
            canvasWidth = leftSketchRef.current!.offsetWidth;
            p.resizeCanvas(canvasWidth, 150);
            console.log('Left sketch resized, new width:', canvasWidth);
          };
        };
        leftSketchRefInstance.current = new window.p5(sketch);
      }

      // Right Frequency Waveform
      if (!rightSketchRefInstance.current) {
        const sketch = (p: any) => {
          let canvasWidth = rightSketchRef.current!.offsetWidth;
          p.setup = () => {
            p.createCanvas(canvasWidth, 150).parent(rightSketchRef.current!);
            p.background(255);
            console.log('Right sketch setup, width:', canvasWidth);
          };

          p.draw = () => {
            if (isPlaying) {
              p.background(255);
              p.stroke(135, 206, 250); // Sky blue
              p.strokeWeight(2);
              const amplitude = (volume / 100) * 50;
              for (let x = 0; x < p.width; x++) {
                let y = p.height / 2 + getWaveformValue(p, x, freqRef.current.rightFreq, freqRef.current.toneType, p.frameCount * 0.05, amplitude);
                p.point(x, y);
              }
              console.log('Right sketch drawing, rightFreq:', freqRef.current.rightFreq, 'volume:', volume, 'toneType:', freqRef.current.toneType);
            } else {
              p.background(255);
            }
          };

          p.windowResized = () => {
            canvasWidth = rightSketchRef.current!.offsetWidth;
            p.resizeCanvas(canvasWidth, 150);
            console.log('Right sketch resized, new width:', canvasWidth);
          };
        };
        rightSketchRefInstance.current = new window.p5(sketch);
      }

      // Overlap (Beat Frequency) Waveform
      if (!overlapSketchRefInstance.current) {
        const sketch = (p: any) => {
          let canvasWidth = overlapSketchRef.current!.offsetWidth;
          p.setup = () => {
            p.createCanvas(canvasWidth, 150).parent(overlapSketchRef.current!);
            p.background(255);
            console.log('Overlap sketch setup, width:', canvasWidth);
          };

          p.draw = () => {
            if (isPlaying) {
              p.background(255);
              p.stroke(255, 215, 0); // Gold
              p.strokeWeight(3);
              const beatFreq = Math.abs(freqRef.current.rightFreq - freqRef.current.leftFreq);
              const amplitude = (volume / 100) * 50;
              for (let x = 0; x < p.width; x++) {
                let y = p.height / 2 + getWaveformValue(p, x, beatFreq, freqRef.current.toneType, p.frameCount * 0.05 * (beatFreq / 10), amplitude);
                p.point(x, y);
              }
              console.log('Overlap sketch drawing, beatFreq:', beatFreq, 'volume:', volume, 'toneType:', freqRef.current.toneType);
            } else {
              p.background(255);
            }
          };

          p.windowResized = () => {
            canvasWidth = overlapSketchRef.current!.offsetWidth;
            p.resizeCanvas(canvasWidth, 150);
            console.log('Overlap sketch resized, new width:', canvasWidth);
          };
        };
        overlapSketchRefInstance.current = new window.p5(sketch);
      }

      // Sacred Geometry Mandala
      if (!mandalaSketchRefInstance.current) {
        const sketch = (p: any) => {
          let canvasWidth = mandalaSketchRef.current!.offsetWidth;
          p.setup = () => {
            p.createCanvas(canvasWidth, 300).parent(mandalaSketchRef.current!);
            p.background(255);
            console.log('Mandala sketch setup, width:', canvasWidth);
          };

          p.draw = () => {
            if (isPlaying) {
              p.background(255);
              p.stroke(0);
              p.strokeWeight(1);
              const beatFreq = Math.abs(freqRef.current.rightFreq - freqRef.current.leftFreq);
              const baseRadius = 50 + (beatFreq / 10);
              const amplitude = (volume / 100) * 50;
              const rotation = p.frameCount * (freqRef.current.leftFreq / 1000);

              const numCircles = Math.floor(beatFreq / 10) + 3;
              const innerScale = freqRef.current.toneType === 'Sine' ? 0.5 : 
                               freqRef.current.toneType === 'Square' ? 0.4 : 
                               freqRef.current.toneType === 'Sawtooth' ? 0.6 : 0.45;

              p.push();
              p.translate(p.width / 2, p.height / 2);
              p.rotate(rotation);

              for (let i = 0; i < numCircles; i++) {
                let angle = p.TWO_PI / numCircles * i;
                let x = p.cos(angle) * baseRadius;
                let y = p.sin(angle) * baseRadius;
                p.ellipse(x, y, baseRadius * 0.5, baseRadius * 0.5);
                for (let j = 0; j < 6; j++) {
                  let innerAngle = p.TWO_PI / 6 * j;
                  let innerX = x + p.cos(innerAngle) * (baseRadius * innerScale);
                  let innerY = y + p.sin(innerAngle) * (baseRadius * innerScale);
                  p.ellipse(innerX, innerY, baseRadius * innerScale * 0.6, baseRadius * innerScale * 0.6);
                }
              }
              p.pop();

              console.log('Mandala sketch drawing, beatFreq:', beatFreq, 'volume:', volume, 'toneType:', freqRef.current.toneType);
            } else {
              p.background(255);
            }
          };

          p.windowResized = () => {
            canvasWidth = mandalaSketchRef.current!.offsetWidth;
            p.resizeCanvas(canvasWidth, 300);
            console.log('Mandala sketch resized, new width:', canvasWidth);
          };
        };
        mandalaSketchRefInstance.current = new window.p5(sketch);
      }
    };

    initializeSketches();

    return () => {
      leftSketchRefInstance.current?.remove();
      rightSketchRefInstance.current?.remove();
      overlapSketchRefInstance.current?.remove();
      mandalaSketchRefInstance.current?.remove();
      leftSketchRefInstance.current = null;
      rightSketchRefInstance.current = null;
      overlapSketchRefInstance.current = null;
      mandalaSketchRefInstance.current = null;
    };
  }, [p5Loaded, isPlaying]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-lg ring-2 ring-gray-200">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">Geometry & Waveform Visualizations</h1>

        {/* Selections */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-gray-700 text-sm sm:text-base">Base Frequency: {baseFreq} Hz</label>
            <SliderPrimitive.Root
              value={[baseFreq]}
              onValueChange={(value) => setBaseFreq(value[0])}
              min={0}
              max={1000}
              step={1}
              className="relative flex items-center w-full mt-2"
            >
              <SliderPrimitive.Track className="bg-gray-300 h-2 w-full rounded-full">
                <SliderPrimitive.Range className="absolute bg-blue-500 h-full rounded-full" />
              </SliderPrimitive.Track>
              <SliderPrimitive.Thumb className="block w-5 h-5 bg-blue-500 rounded-full focus:outline-none shadow" />
            </SliderPrimitive.Root>
          </div>

          <div>
            <label className="block text-gray-700 text-sm sm:text-base">Left Frequency: {leftFreq} Hz</label>
            <SliderPrimitive.Root
              value={[leftFreq]}
              onValueChange={(value) => setLeftFreq(value[0])}
              max={1000}
              step={1}
              className="relative flex items-center w-full mt-2"
            >
              <SliderPrimitive.Track className="bg-gray-300 h-2 w-full rounded-full">
                <SliderPrimitive.Range className="absolute bg-blue-500 h-full rounded-full" />
              </SliderPrimitive.Track>
              <SliderPrimitive.Thumb className="block w-5 h-5 bg-blue-500 rounded-full focus:outline-none shadow" />
            </SliderPrimitive.Root>
          </div>

          <div>
            <label className="block text-gray-700 text-sm sm:text-base">Right Frequency: {rightFreq} Hz</label>
            <SliderPrimitive.Root
              value={[rightFreq]}
              onValueChange={(value) => setRightFreq(value[0])}
              max={1000}
              step={1}
              className="relative flex items-center w-full mt-2"
            >
              <SliderPrimitive.Track className="bg-gray-300 h-2 w-full rounded-full">
                <SliderPrimitive.Range className="absolute bg-blue-500 h-full rounded-full" />
              </SliderPrimitive.Track>
              <SliderPrimitive.Thumb className="block w-5 h-5 bg-blue-500 rounded-full focus:outline-none shadow" />
            </SliderPrimitive.Root>
          </div>

          <div>
            <label className="block text-gray-700 text-sm sm:text-base">Tone Type</label>
            <select
              value={toneType}
              onChange={(e) => setToneType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-800 shadow-inner text-sm sm:text-base"
            >
              <option>Sine</option>
              <option>Square</option>
              <option>Sawtooth</option>
              <option>Triangle</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm sm:text-base">Background Music</label>
            <select
              value={bgMusic}
              onChange={(e) => setBgMusic(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-800 shadow-inner text-sm sm:text-base"
            >
              <option>None</option>
              <option>Sample</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm sm:text-base">Volume: {volume}%</label>
            <SliderPrimitive.Root
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              max={100}
              step={1}
              className="relative flex items-center w-full mt-2"
            >
              <SliderPrimitive.Track className="bg-gray-300 h-2 w-full rounded-full">
                <SliderPrimitive.Range className="absolute bg-blue-500 h-full rounded-full" />
              </SliderPrimitive.Track>
              <SliderPrimitive.Thumb className="block w-5 h-5 bg-blue-500 rounded-full focus:outline-none shadow" />
            </SliderPrimitive.Root>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={isPlaying ? resumeAudio : startAudio}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 shadow-md text-sm sm:text-base"
          >
            {isPlaying ? 'Resume' : 'Play'}
          </button>
          <button
            onClick={pauseAudio}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-200 shadow-md text-sm sm:text-base"
          >
            Pause
          </button>
          <button
            onClick={stopAudio}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 shadow-md text-sm sm:text-base"
          >
            Stop
          </button>
        </div>

        {/* Left and Right Waveforms Side by Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <label className="block font-semibold text-sm text-gray-700">Left Ear Waveform</label>
            <div
              ref={leftSketchRef}
              className="border-2 border-gray-200 rounded-lg overflow-hidden w-full"
              style={{ position: 'relative', height: '150px' }}
            ></div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <label className="block font-semibold text-sm text-gray-700">Right Ear Waveform</label>
            <div
              ref={rightSketchRef}
              className="border-2 border-gray-200 rounded-lg overflow-hidden w-full"
              style={{ position: 'relative', height: '150px' }}
            ></div>
          </div>
        </div>

        {/* Overlap Waveform */}
        <div className="p-4 bg-gray-50 rounded-lg shadow-inner mb-6">
          <label className="block font-semibold text-sm text-gray-700">Overlap (Beat Frequency)</label>
          <div
            ref={overlapSketchRef}
            className="border-2 border-gray-200 rounded-lg overflow-hidden w-full"
            style={{ position: 'relative', height: '150px' }}
          ></div>
        </div>

        {/* Sacred Geometry Mandala */}
        <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
          <label className="block font-semibold text-sm text-gray-700">Sacred Geometry Mandala</label>
          <div
            ref={mandalaSketchRef}
            className="border-2 border-gray-200 rounded-lg overflow-hidden w-full"
            style={{ position: 'relative', height: '300px' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
