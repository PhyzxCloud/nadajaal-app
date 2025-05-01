"use client";

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

// Define Nada types
type NadaName = 'Bhumi' | 'Pravaha' | 'Shanta' | 'Arogya' | 'Chapala' | 'Matri' | 'Samatva' | 'Gupta' | 'Jyoti' | 'Tejas' | 'Sthira' | 'Ananta';
type NadaPreset = {
  baseFreq: number;
  leftFreq: number;
  rightFreq: number;
  description: string;
  toneType: Tone.ToneOscillatorType;
  solfeggioBase: number;
};
type FreqRef = {
  leftFreq: number;
  rightFreq: number;
  toneType: Tone.ToneOscillatorType;
};
type Mood = 'Calm' | 'Energetic' | 'Meditative';

// Dynamically import Tone.js
const Tone = typeof window !== 'undefined' ? require('tone') : null;

const Basics = () => {
  const [selectedNada, setSelectedNada] = React.useState<NadaName>('Bhumi');
  const [volume, setVolume] = React.useState(50);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [p5Loaded, setP5Loaded] = React.useState(false);
  const [selectedMood, setSelectedMood] = React.useState<Mood>('Calm');
  const leftSketchRef = React.useRef<HTMLDivElement>(null);
  const rightSketchRef = React.useRef<HTMLDivElement>(null);
  const thirdEyeSketchRef = React.useRef<HTMLDivElement>(null);
  const mandalaSketchRef = React.useRef<HTMLDivElement>(null);
  const audioContextRef = React.useRef<any>(null); // Type adjusted for dynamic import
  const leftOscillatorRef = React.useRef<any>(null);
  const rightOscillatorRef = React.useRef<any>(null);
  const leftPannerRef = React.useRef<any>(null);
  const rightPannerRef = React.useRef<any>(null);
  const gainNodeRef = React.useRef<any>(null);
  const bgSynthRef = React.useRef<any>(null);
  const leftSketchRefInstance = React.useRef<any>(null);
  const rightSketchRefInstance = React.useRef<any>(null);
  const thirdEyeSketchRefInstance = React.useRef<any>(null);
  const mandalaSketchRefInstance = React.useRef<any>(null);
  const freqRef = React.useRef<FreqRef>({ leftFreq: 7.83, rightFreq: 11.83, toneType: 'sine' });

  // Nada frequency presets
  const nadaPresets: Record<NadaName, NadaPreset> = {
    'Bhumi': { baseFreq: 7.83, leftFreq: 7.83, rightFreq: 11.83, description: "Earth's vibration - Grounding and stability", toneType: 'sine', solfeggioBase: 174 },
    'Pravaha': { baseFreq: 174, leftFreq: 174, rightFreq: 178, description: "Relieves Pain & Stress - Calming and soothing", toneType: 'sine', solfeggioBase: 174 },
    'Shanta': { baseFreq: 285, leftFreq: 285, rightFreq: 291, description: "Heals Tissues & Organs - Restorative energy", toneType: 'sine', solfeggioBase: 285 },
    'Arogya': { baseFreq: 396, leftFreq: 396, rightFreq: 402, description: "Eliminates Fear - Courage and confidence", toneType: 'square', solfeggioBase: 396 },
    'Chapala': { baseFreq: 417, leftFreq: 417, rightFreq: 423, description: "Wipes out Negativity - Cleansing and renewal", toneType: 'sawtooth', solfeggioBase: 417 },
    'Matri': { baseFreq: 528, leftFreq: 528, rightFreq: 534, description: "Repairs DNA, Brings Positive Transformation - Healing and growth", toneType: 'sine', solfeggioBase: 528 },
    'Samatva': { baseFreq: 639, leftFreq: 639, rightFreq: 645, description: "Brings Love & Compassion in Life - Emotional balance", toneType: 'sine', solfeggioBase: 639 },
    'Gupta': { baseFreq: 741, leftFreq: 741, rightFreq: 747, description: "Detoxifies Cells & Organs - Purification", toneType: 'triangle', solfeggioBase: 741 },
    'Jyoti': { baseFreq: 852, leftFreq: 852, rightFreq: 858, description: "Awakens Intuition, Raises Energy - Insight and vitality", toneType: 'square', solfeggioBase: 852 },
    'Tejas': { baseFreq: 963, leftFreq: 963, rightFreq: 969, description: "Connects to Higher Self - Spiritual connection", toneType: 'sine', solfeggioBase: 963 },
    'Sthira': { baseFreq: 1074, leftFreq: 1074, rightFreq: 1080, description: "Consciousness Expansion - Awareness and clarity", toneType: 'sawtooth', solfeggioBase: 1074 },
    'Ananta': { baseFreq: 1179, leftFreq: 1179, rightFreq: 1185, description: "Cosmic Connection - Universal harmony", toneType: 'triangle', solfeggioBase: 1179 },
  };

  // Sync frequencies and tone with selected Nada
  React.useEffect(() => {
    const preset = nadaPresets[selectedNada as NadaName];
    freqRef.current = { leftFreq: preset.leftFreq, rightFreq: preset.rightFreq, toneType: preset.toneType };
  }, [selectedNada]);

  // Load p5.js script dynamically
  React.useEffect(() => {
    const loadP5Script = () => {
      if (typeof window !== 'undefined' && !window.p5) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.2/p5.min.js';
        script.async = true;
        script.onload = () => setP5Loaded(true);
        script.onerror = () => console.error('Failed to load p5.js');
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

  // Initialize AudioContext and Oscillators
  const setupAudio = () => {
    if (Tone && !audioContextRef.current) {
      audioContextRef.current = new Tone.Context();
      gainNodeRef.current = new Tone.Gain(volume / 100).toDestination();
      leftPannerRef.current = new Tone.Panner(-1).connect(gainNodeRef.current);
      rightPannerRef.current = new Tone.Panner(1).connect(gainNodeRef.current);
    }
  };

  const startAudio = () => {
    if (!Tone || !audioContextRef.current || !gainNodeRef.current) return;

    setupAudio();
    if (!leftOscillatorRef.current && !rightOscillatorRef.current && !isPlaying) {
      leftOscillatorRef.current = new Tone.Oscillator(freqRef.current.leftFreq, freqRef.current.toneType).connect(leftPannerRef.current!).start();
      rightOscillatorRef.current = new Tone.Oscillator(freqRef.current.rightFreq, freqRef.current.toneType).connect(rightPannerRef.current!).start();

      // Background music with tone.js
      const tempo = selectedMood === 'Calm' ? 60 : selectedMood === 'Energetic' ? 80 : 70;
      Tone.Transport.bpm.value = tempo;
      bgSynthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
      const solfeggioBase = nadaPresets[selectedNada].solfeggioBase;
      const harmonics = [solfeggioBase, solfeggioBase * 2, solfeggioBase * 3];
      const sequence = new Tone.Part(((time, note) => {
        bgSynthRef.current!.triggerAttackRelease(note, '2n', time, 0.5);
      }), harmonics.map(freq => [0, freq])).start(0);
      sequence.loop = true;
      sequence.loopEnd = '1m';
      Tone.Transport.start();
    }
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    if (Tone && audioContextRef.current) {
      Tone.Transport.pause();
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (Tone && leftOscillatorRef.current && rightOscillatorRef.current) {
      leftOscillatorRef.current.stop();
      rightOscillatorRef.current.stop();
      leftOscillatorRef.current = null;
      rightOscillatorRef.current = null;
      if (bgSynthRef.current) bgSynthRef.current.releaseAll();
      Tone.Transport.stop();
      leftSketchRefInstance.current?.remove();
      rightSketchRefInstance.current?.remove();
      thirdEyeSketchRefInstance.current?.remove();
      mandalaSketchRefInstance.current?.remove();
      leftSketchRefInstance.current = null;
      rightSketchRefInstance.current = null;
      thirdEyeSketchRefInstance.current = null;
      mandalaSketchRefInstance.current = null;
    }
    setIsPlaying(false);
  };

  // Update volume in real-time
  React.useEffect(() => {
    if (Tone && gainNodeRef.current) gainNodeRef.current.gain.value = volume / 100;
  }, [volume]);

  React.useEffect(() => {
    if (Tone && leftOscillatorRef.current && rightOscillatorRef.current) {
      leftOscillatorRef.current.type = freqRef.current.toneType;
      rightOscillatorRef.current.type = freqRef.current.toneType;
    }
  }, [freqRef.current.toneType]);

  // Initialize p5.js sketches
  React.useEffect(() => {
    if (!p5Loaded || !window.p5) return;

    if (!leftSketchRef.current || !rightSketchRef.current || !thirdEyeSketchRef.current || !mandalaSketchRef.current) return;

    const initializeSketches = () => {
      const getWaveformValue = (p: any, x: number, freq: number, toneType: string, phase: number, amplitude: number) => {
        const t = x * 0.1 + phase;
        const scaledFreq = freq / 174;
        switch (toneType.toLowerCase()) {
          case 'sine': return p.sin(t * scaledFreq) * amplitude;
          case 'square': return p.sin(t * scaledFreq) > 0 ? amplitude : -amplitude;
          case 'sawtooth': return ((t * scaledFreq) % p.TWO_PI) / p.PI * amplitude - amplitude;
          case 'triangle': return (2 / p.PI) * p.asin(p.sin(t * scaledFreq)) * amplitude;
          default: return p.sin(t * scaledFreq) * amplitude;
        }
      };

      // Left Frequency Waveform
      if (!leftSketchRefInstance.current) {
        const sketch = (p: any) => {
          let canvasWidth = leftSketchRef.current!.offsetWidth;
          p.setup = () => p.createCanvas(canvasWidth, 150).parent(leftSketchRef.current!);
          p.draw = () => { if (isPlaying) { p.background(255); p.stroke(255, 99, 71); p.strokeWeight(2); const amplitude = (volume / 100) * 50; for (let x = 0; x < p.width; x++) p.point(x, p.height / 2 + getWaveformValue(p, x, freqRef.current.leftFreq, freqRef.current.toneType, p.frameCount * 0.05, amplitude)); } else p.background(255); };
          p.windowResized = () => { canvasWidth = leftSketchRef.current!.offsetWidth; p.resizeCanvas(canvasWidth, 150); };
        };
        leftSketchRefInstance.current = new window.p5(sketch);
      }

      // Right Frequency Waveform
      if (!rightSketchRefInstance.current) {
        const sketch = (p: any) => {
          let canvasWidth = rightSketchRef.current!.offsetWidth;
          p.setup = () => p.createCanvas(canvasWidth, 150).parent(rightSketchRef.current!);
          p.draw = () => { if (isPlaying) { p.background(255); p.stroke(135, 206, 250); p.strokeWeight(2); const amplitude = (volume / 100) * 50; for (let x = 0; x < p.width; x++) p.point(x, p.height / 2 + getWaveformValue(p, x, freqRef.current.rightFreq, freqRef.current.toneType, p.frameCount * 0.05, amplitude)); } else p.background(255); };
          p.windowResized = () => { canvasWidth = rightSketchRef.current!.offsetWidth; p.resizeCanvas(canvasWidth, 150); };
        };
        rightSketchRefInstance.current = new window.p5(sketch);
      }

      // Third Eye Visualization
      if (!thirdEyeSketchRefInstance.current) {
        const sketch = (p: any) => {
          let canvasWidth = thirdEyeSketchRef.current!.offsetWidth;
          p.setup = () => p.createCanvas(canvasWidth, 150).parent(thirdEyeSketchRef.current!);
          p.draw = () => {
            if (isPlaying) {
              p.background(0);
              const centerX = p.width / 2;
              const centerY = p.height / 2;
              const baseRadius = p.min(p.width, p.height) * 0.3;
              const speed = (freqRef.current.leftFreq / 100) * 0.01;
              p.translate(centerX, centerY);
              p.rotate(p.frameCount * speed);

              const scaleFactor = p.sin(p.frameCount * 0.05) * 0.2 + 1;
              for (let i = 0; i < 5; i++) {
                p.stroke(p.lerpColor(p.color(0, 255, 255), p.color(255, 0, 255), i / 5));
                p.noFill();
                const radius = baseRadius * (i + 1) * scaleFactor;
                p.ellipse(0, 0, radius, radius);
              }
              p.fill(255);
              p.noStroke();
              p.ellipse(0, 0, 10, 10);
            } else p.background(0);
          };
          p.windowResized = () => { canvasWidth = thirdEyeSketchRef.current!.offsetWidth; p.resizeCanvas(canvasWidth, 150); };
        };
        thirdEyeSketchRefInstance.current = new window.p5(sketch);
      }

      // Sacred Geometry Mandala
      if (!mandalaSketchRefInstance.current) {
        const sketch = (p: any) => {
          let canvasWidth = mandalaSketchRef.current!.offsetWidth;
          p.setup = () => p.createCanvas(canvasWidth, 300).parent(mandalaSketchRef.current!);
          p.draw = () => { if (isPlaying) { p.background(255); p.stroke(0); p.strokeWeight(1); const beatFreq = Math.abs(freqRef.current.rightFreq - freqRef.current.leftFreq); const baseRadius = 50 + (beatFreq / 10); const rotation = p.frameCount * (freqRef.current.leftFreq / 1000); const numCircles = Math.floor(beatFreq / 10) + 3; const innerScale = ['sine', 'square', 'sawtooth', 'triangle'].indexOf(freqRef.current.toneType) / 3 * 0.2 + 0.4; p.push(); p.translate(p.width / 2, p.height / 2); p.rotate(rotation); for (let i = 0; i < numCircles; i++) { let angle = p.TWO_PI / numCircles * i; let x = p.cos(angle) * baseRadius; let y = p.sin(angle) * baseRadius; p.ellipse(x, y, baseRadius * 0.5, baseRadius * 0.5); for (let j = 0; j < 6; j++) { let innerAngle = p.TWO_PI / 6 * j; let innerX = x + p.cos(innerAngle) * (baseRadius * innerScale); let innerY = y + p.sin(innerAngle) * (baseRadius * innerScale); p.ellipse(innerX, innerY, baseRadius * innerScale * 0.6, baseRadius * innerScale * 0.6); } } p.pop(); } else p.background(255); };
          p.windowResized = () => { canvasWidth = mandalaSketchRef.current!.offsetWidth; p.resizeCanvas(canvasWidth, 300); };
        };
        mandalaSketchRefInstance.current = new window.p5(sketch);
      }
    };

    initializeSketches();

    return () => {
      leftSketchRefInstance.current?.remove();
      rightSketchRefInstance.current?.remove();
      thirdEyeSketchRefInstance.current?.remove();
      mandalaSketchRefInstance.current?.remove();
      leftSketchRefInstance.current = null;
      rightSketchRefInstance.current = null;
      thirdEyeSketchRefInstance.current = null;
      mandalaSketchRefInstance.current = null;
    };
  }, [p5Loaded, isPlaying]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-lg ring-2 ring-gray-200">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">{selectedNada}</h1>
        <p className="text-sm text-gray-600 mb-4">{nadaPresets[selectedNada].description}</p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-gray-700 text-sm sm:text-base">Select Nada</label>
            <select value={selectedNada} onChange={(e) => setSelectedNada(e.target.value as NadaName)} className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-800 shadow-inner text-sm sm:text-base">
              {(Object.keys(nadaPresets) as NadaName[]).map((nada) => <option key={nada} value={nada}>{nada}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm sm:text-base">Select Mood for Background Music</label>
            <select value={selectedMood} onChange={(e) => setSelectedMood(e.target.value as Mood)} className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-800 shadow-inner text-sm sm:text-base">
              <option>Calm</option>
              <option>Energetic</option>
              <option>Meditative</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm sm:text-base">Volume: {volume}%</label>
            <SliderPrimitive.Root value={[volume]} onValueChange={(value) => setVolume(value[0])} max={100} step={1} className="relative flex items-center w-full mt-2">
              <SliderPrimitive.Track className="bg-gray-300 h-2 w-full rounded-full"><SliderPrimitive.Range className="absolute bg-blue-500 h-full rounded-full" /></SliderPrimitive.Track>
              <SliderPrimitive.Thumb className="block w-5 h-5 bg-blue-500 rounded-full focus:outline-none shadow" />
            </SliderPrimitive.Root>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button onClick={isPlaying ? pauseAudio : startAudio} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 shadow-md text-sm sm:text-base">{isPlaying ? 'Pause' : 'Play'}</button>
          <button onClick={stopAudio} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 shadow-md text-sm sm:text-base">Stop</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <label className="block font-semibold text-sm text-gray-700">Left Ear Waveform</label>
            <div ref={leftSketchRef} className="border-2 border-gray-200 rounded-lg overflow-hidden w-full" style={{ position: 'relative', height: '150px' }}></div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <label className="block font-semibold text-sm text-gray-700">Right Ear Waveform</label>
            <div ref={rightSketchRef} className="border-2 border-gray-200 rounded-lg overflow-hidden w-full" style={{ position: 'relative', height: '150px' }}></div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg shadow-inner mb-6">
          <label className="block font-semibold text-sm text-gray-700">Third Eye</label>
          <div ref={thirdEyeSketchRef} className="border-2 border-gray-200 rounded-lg overflow-hidden w-full" style={{ position: 'relative', height: '150px' }}></div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
          <label className="block font-semibold text-sm text-gray-700">Sacred Geometry Mandala</label>
          <div ref={mandalaSketchRef} className="border-2 border-gray-200 rounded-lg overflow-hidden w-full" style={{ position: 'relative', height: '300px' }}></div>
        </div>
      </div>
    </div>
  );
};

export default Basics;
