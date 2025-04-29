"use client";

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

const ControlPanel = () => {
  const [leftFreq, setLeftFreq] = React.useState(174); // Initialized to 174 Hz
  const [rightFreq, setRightFreq] = React.useState(174); // Initialized to 174 Hz
  const [baseFreq, setBaseFreq] = React.useState(174); // Initialized to 174 Hz
  const [toneType, setToneType] = React.useState('Sine');
  const [bgMusic, setBgMusic] = React.useState('None');
  const [volume, setVolume] = React.useState(50);
  const [isPlaying, setIsPlaying] = React.useState(false);
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

  // Sync base frequency with left and right frequencies
  React.useEffect(() => {
    const diff = rightFreq - leftFreq;
    setLeftFreq(baseFreq);
    setRightFreq(baseFreq + diff);
  }, [baseFreq]);

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

      // Initialize sketches if not already initialized
      if (!leftSketchRefInstance.current) initializeSketches();
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
      // Clean up sketches
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
  }, [leftFreq, rightFreq]);

  React.useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume / 100, audioContextRef.current!.currentTime);
    }
  }, [volume]);

  React.useEffect(() => {
    if (leftOscillatorRef.current && rightOscillatorRef.current) {
      leftOscillatorRef.current.type = toneType.toLowerCase() as OscillatorType;
      rightOscillatorRef.current.type = toneType.toLowerCase() as OscillatorType;
    }
  }, [toneType]);

  // Initialize p5.js sketches
  const initializeSketches = () => {
    import('p5').then((p5Module) => {
      const p5 = p5Module.default;
      console.log('p5.js loaded successfully'); // Debug log

      // Left Frequency Waveform
      if (!leftSketchRefInstance.current) {
        const newLeftSketch = new p5((p: any) => {
          p.setup = () => {
            if (leftSketchRef.current) {
              p.createCanvas(600, 150).parent(leftSketchRef.current);
              p.background(255);
              console.log('Left sketch setup'); // Debug log
            } else {
              console.error('Left sketch ref not found');
            }
          };

          p.draw = () => {
            if (isPlaying) {
              p.background(255);
              p.stroke(255, 99, 71); // Tomato red
              p.strokeWeight(2);
              p.noFill();
              p.beginShape();
              for (let x = 0; x < p.width; x++) {
                let y = p.height / 2 + p.sin(p.frameCount * 0.05 + (x / 50) * (leftFreq / 100)) * (p.height / 4) * (volume / 100);
                p.vertex(x, y);
              }
              p.endShape();
              console.log('Left sketch drawing, leftFreq:', leftFreq); // Debug log
            } else {
              p.background(255); // Clear canvas when not playing
            }
          };
        });
        leftSketchRefInstance.current = newLeftSketch;
      }

      // Right Frequency Waveform
      if (!rightSketchRefInstance.current) {
        const newRightSketch = new p5((p: any) => {
          p.setup = () => {
            if (rightSketchRef.current) {
              p.createCanvas(600, 150).parent(rightSketchRef.current);
              p.background(255);
              console.log('Right sketch setup'); // Debug log
            } else {
              console.error('Right sketch ref not found');
            }
          };

          p.draw = () => {
            if (isPlaying) {
              p.background(255);
              p.stroke(135, 206, 250); // Sky blue
              p.strokeWeight(2);
              p.noFill();
              p.beginShape();
              for (let x = 0; x < p.width; x++) {
                let y = p.height / 2 + p.sin(p.frameCount * 0.05 + (x / 50) * (rightFreq / 100)) * (p.height / 4) * (volume / 100);
                p.vertex(x, y);
              }
              p.endShape();
              console.log('Right sketch drawing, rightFreq:', rightFreq); // Debug log
            } else {
              p.background(255); // Clear canvas when not playing
            }
          };
        });
        rightSketchRefInstance.current = newRightSketch;
      }

      // Overlap Waveform (Beat Frequency)
      if (!overlapSketchRefInstance.current) {
        const newOverlapSketch = new p5((p: any) => {
          p.setup = () => {
            if (overlapSketchRef.current) {
              p.createCanvas(600, 150).parent(overlapSketchRef.current);
              p.background(255);
              console.log('Overlap sketch setup'); // Debug log
            } else {
              console.error('Overlap sketch ref not found');
            }
          };

          p.draw = () => {
            if (isPlaying) {
              p.background(255);
              const beatFreq = Math.abs(leftFreq - rightFreq);
              p.stroke(255, 215, 0); // Gold
              p.strokeWeight(3);
              p.noFill();
              p.beginShape();
              for (let x = 0; x < p.width; x++) {
                let y = p.height / 2 + p.sin(p.frameCount * 0.05 + (x / 50) * (beatFreq / 100)) * (p.height / 4) * (volume / 100);
                p.vertex(x, y);
              }
              p.endShape();
              console.log('Overlap sketch drawing, beatFreq:', beatFreq); // Debug log
            } else {
              p.background(255); // Clear canvas when not playing
            }
          };
        });
        overlapSketchRefInstance.current = newOverlapSketch;
      }

      // Sacred Geometry Mandala
      if (!mandalaSketchRefInstance.current) {
        const newMandalaSketch = new p5((p: any) => {
          p.setup = () => {
            if (mandalaSketchRef.current) {
              p.createCanvas(600, 300).parent(mandalaSketchRef.current);
              p.angleMode(p.DEGREES);
              p.colorMode(p.HSB);
              console.log('Mandala sketch setup'); // Debug log
            } else {
              console.error('Mandala sketch ref not found');
            }
          };

          p.draw = () => {
            if (isPlaying) {
              p.background(255);
              p.translate(p.width / 2, p.height / 2);
              const beatFreq = Math.abs(leftFreq - rightFreq);
              const layers = p.map(volume, 0, 100, 5, 20);
              const radius = p.map(beatFreq, 0, 100, 50, 150);
              for (let i = 0; i < layers; i++) {
                p.beginShape();
                const angleStep = 360 / (i + 3);
                for (let angle = 0; angle < 360; angle += angleStep) {
                  let r = radius * (1 + p.sin(p.frameCount * 0.1 + i * 10) * 0.2);
                  let x = r * p.cos(angle);
                  let y = r * p.sin(angle);
                  p.vertex(x, y);
                  const hue = (p.frameCount + i * 36 + beatFreq * 0.5) % 360;
                  p.stroke(hue, 70, 80);
                  p.strokeWeight(1 + i * 0.2);
                }
                p.endShape(p.CLOSE);
              }
              console.log('Mandala sketch drawing, beatFreq:', beatFreq, 'volume:', volume); // Debug log
            } else {
              p.background(255); // Clear canvas when not playing
            }
          };
        });
        mandalaSketchRefInstance.current = newMandalaSketch;
      }
    }).catch((err) => console.error('Failed to load p5:', err));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg ring-2 ring-gray-200">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Geometry & Waveform Visualizations</h1>
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <label className="block font-semibold text-sm text-gray-700">Left Ear Waveform</label>
            <div ref={leftSketchRef} className="border-2 border-gray-200 rounded-lg overflow-hidden"></div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <label className="block font-semibold text-sm text-gray-700">Right Ear Waveform</label>
            <div ref={rightSketchRef} className="border-2 border-gray-200 rounded-lg overflow-hidden"></div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <label className="block font-semibold text-sm text-gray-700">Overlap (Beat Frequency)</label>
            <div ref={overlapSketchRef} className="border-2 border-gray-200 rounded-lg overflow-hidden"></div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <label className="block font-semibold text-sm text-gray-700">Sacred Geometry Mandala</label>
            <div ref={mandalaSketchRef} className="border-2 border-gray-200 rounded-lg overflow-hidden"></div>
          </div>
        </div>
        <button
          onClick={isPlaying ? resumeAudio : startAudio}
          className="mt-6 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 shadow-md"
        >
          {isPlaying ? 'Resume' : 'Play'}
        </button>
        <div className="mt-4">
          <label className="block text-gray-700">Base Frequency: {baseFreq} Hz</label>
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
        <div className="mt-4">
          <label className="block text-gray-700">Left Frequency: {leftFreq} Hz</label>
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
        <div className="mt-4">
          <label className="block text-gray-700">Right Frequency: {rightFreq} Hz</label>
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
        <div className="mt-4"> {/* Fixed syntax error: added = after className */}
          <label className="block text-gray-700">Tone Type</label>
          <select
            value={toneType}
            onChange={(e) => setToneType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-800 shadow-inner"
          >
            <option>Sine</option>
            <option>Square</option>
            <option>Sawtooth</option>
            <option>Triangle</option>
          </select>
        </div>
        <div className="mt-4">
          <label className="block text-gray-700">Background Music</label>
          <select
            value={bgMusic}
            onChange={(e) => setBgMusic(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-800 shadow-inner"
          >
            <option>None</option>
            <option>Sample</option>
          </select>
        </div>
        <div className="mt-4">
          <label className="block text-gray-700">Volume: {volume}%</label>
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
        <div className="mt-4 flex space-x-4">
          <button
            onClick={pauseAudio}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-200 shadow-md"
          >
            Pause
          </button>
          <button
            onClick={stopAudio}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 shadow-md"
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
