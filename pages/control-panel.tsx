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
  const freqRef = React.useRef({ leftFreq: 174, rightFreq: 174 });

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

  // Update freqRef when frequencies or volume change
  React.useEffect(() => {
    freqRef.current = { leftFreq, rightFreq };
  }, [leftFreq, rightFreq, volume]);

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

      // Left Frequency Waveform
      if (!leftSketchRefInstance.current) {
        const sketch = (p: any) => {
          p.setup = () => {
            p.createCanvas(600, 150).parent(leftSketchRef.current!);
            p.background(255);
            console.log('Left sketch setup');
          };

          p.draw = () => {
            if (isPlaying) {
              p.background(255);
              p.stroke(255, 99, 71); // Tomato red
              p.strokeWeight(2);
              const amplitude = (volume / 100) * 50; // Scale amplitude with volume
              for (let x = 0; x < p.width; x++) {
                let y = p.height / 2 + p.sin(x * 0.1 + p.frameCount * 0.05) * amplitude * (freqRef.current.leftFreq / 174);
                p.point(x, y);
              }
              console.log('Left sketch drawing, leftFreq:', freqRef.current.leftFreq, 'volume:', volume);
            } else {
              p.background(255);
            }
          };
        };
        leftSketchRefInstance.current = new window.p5(sketch);
      }

      // Right Frequency Waveform
      if (!rightSketchRefInstance.current) {
        const sketch = (p: any) => {
          p.setup = () => {
            p.createCanvas(600, 150).parent(rightSketchRef.current!);
            p.background(255);
            console.log('Right sketch setup');
          };

          p.draw = () => {
            if (isPlaying) {
              p.background(255);
              p.stroke(135, 206, 250); // Sky blue
              p.strokeWeight(2);
              const amplitude = (volume / 100) * 50; // Scale amplitude with volume
              for (let x = 0; x < p.width; x++) {
                let y = p.height / 2 + p.sin(x * 0.1 + p.frameCount * 0.05) * amplitude * (freqRef.current.rightFreq / 174);
                p.point(x, y);
              }
              console.log('Right sketch drawing, rightFreq:', freqRef.current.rightFreq, 'volume:', volume);
            } else {
              p.background(255);
            }
          };
        };
        rightSketchRefInstance.current = new window.p5(sketch);
      }

      // Overlap (Beat Frequency) Waveform
      if (!overlapSketchRefInstance.current) {
        const sketch = (p: any) => {
          p.setup = () => {
            p.createCanvas(600, 150).parent(overlapSketchRef.current!);
            p.background(255);
            console.log('Overlap sketch setup');
          };

          p.draw = () => {
            if (isPlaying) {
              p.background(255);
              p.stroke(255, 215, 0); // Gold
              p.strokeWeight(3);
              const beatFreq = Math.abs(freqRef.current.rightFreq - freqRef.current.leftFreq);
              const amplitude = (volume / 100) * 50; // Scale amplitude with volume
              for (let x = 0; x < p.width; x++) {
                let y = p.height / 2 + p.sin(x * 0.1 + p.frameCount * 0.05 * (beatFreq / 10)) * amplitude;
                p.point(x, y);
              }
              console.log('Overlap sketch drawing, beatFreq:', beatFreq, 'volume:', volume);
            } else {
              p.background(255);
            }
          };
        };
        overlapSketchRefInstance.current = new window.p5(sketch);
      }

      // Sacred Geometry Mandala
      if (!mandalaSketchRefInstance.current) {
        const sketch = (p: any) => {
          p.setup = () => {
            p.createCanvas(600, 300).parent(mandalaSketchRef.current!);
            p.background(255);
            console.log('Mandala sketch setup');
          };

          p.draw = () => {
            if (isPlaying) {
              p.background(255);
              p.stroke(0);
              p.strokeWeight(1);
              const beatFreq = Math.abs(freqRef.current.rightFreq - freqRef.current.leftFreq);
              const baseRadius = 50 + (beatFreq / 10); // Base radius influenced by beat frequency
              const amplitude = (volume / 100) * 50; // Scale size with volume
              const radius = baseRadius + p.sin(p.frameCount * 0.05) * amplitude;

              // Draw Flower of Life pattern
              for (let i = 0; i < 6; i++) {
                let angle = p.TWO_PI / 6 * i;
                let x = p.width / 2 + p.cos(angle) * radius;
                let y = p.height / 2 + p.sin(angle) * radius;
                p.ellipse(x, y, radius * 0.5, radius * 0.5);
                for (let j = 0; j < 6; j++) {
                  let innerAngle = p.TWO_PI / 6 * j;
                  let innerX = x + p.cos(innerAngle) * (radius * 0.5);
                  let innerY = y + p.sin(innerAngle) * (radius * 0.5);
                  p.ellipse(innerX, innerY, radius * 0.3, radius * 0.3);
                }
              }
              console.log('Mandala sketch drawing, beatFreq:', beatFreq, 'volume:', volume);
            } else {
              p.background(255);
            }
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg ring-2 ring-gray-200">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Geometry & Waveform Visualizations</h1>
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <label className="block font-semibold text-sm text-gray-700">Left Ear Waveform</label>
            <div ref={leftSketchRef} className="border-2 border-gray-200 rounded-lg overflow-hidden" style={{ position: 'relative', width: '600px', height: '150px' }}></div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <label className="block font-semibold text-sm text-gray-700">Right Ear Waveform</label>
            <div ref={rightSketchRef} className="border-2 border-gray-200 rounded-lg overflow-hidden" style={{ position: 'relative', width: '600px', height: '150px' }}></div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <label className="block font-semibold text-sm text-gray-700">Overlap (Beat Frequency)</label>
            <div ref={overlapSketchRef} className="border-2 border-gray-200 rounded-lg overflow-hidden" style={{ position: 'relative', width: '600px', height: '150px' }}></div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <label className="block font-semibold text-sm text-gray-700">Sacred Geometry Mandala</label>
            <div ref={mandalaSketchRef} className="border-2 border-gray-200 rounded-lg overflow-hidden" style={{ position: 'relative', width: '600px', height: '300px' }}></div>
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
        <div className="mt-4">
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
