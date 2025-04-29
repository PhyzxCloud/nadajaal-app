"use client";

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

const ControlPanel = () => {
  const [leftFreq, setLeftFreq] = React.useState(200);
  const [rightFreq, setRightFreq] = React.useState(210);
  const [toneType, setToneType] = React.useState('Flute');
  const [bgMusic, setBgMusic] = React.useState('None');
  const [volume, setVolume] = React.useState(50);
  const leftSketchRef = React.useRef<HTMLDivElement>(null);
  const rightSketchRef = React.useRef<HTMLDivElement>(null);
  const overlapSketchRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    import('p5').then((p5Module) => {
      const p5 = p5Module.default;

      // Left Frequency Waveform
      const leftSketch = new p5((p: any) => {
        let t = 0;

        p.setup = () => {
          p.createCanvas(600, 150).parent(leftSketchRef.current!);
          p.background(255);
        };

        p.draw = () => {
          p.background(255);
          p.stroke(255, 99, 71); // Tomato color for left waveform
          p.strokeWeight(2);
          p.noFill();
          p.beginShape();
          for (let x = 0; x < p.width; x++) {
            let y = p.height / 2 + p.sin(t + (x / 50) * (leftFreq / 100)) * (p.height / 4);
            p.vertex(x, y); // Fixed typo: p.vertex instead of p(vertex
          }
          p.endShape();
          t += 0.05;
        };
      });

      // Right Frequency Waveform
      const rightSketch = new p5((p: any) => {
        let t = 0;

        p.setup = () => {
          p.createCanvas(600, 150).parent(rightSketchRef.current!);
          p.background(255);
        };

        p.draw = () => {
          p.background(255);
          p.stroke(135, 206, 250); // SkyBlue color for right waveform
          p.strokeWeight(2);
          p.noFill();
          p.beginShape();
          for (let x = 0; x < p.width; x++) {
            let y = p.height / 2 + p.sin(t + (x / 50) * (rightFreq / 100)) * (p.height / 4);
            p.vertex(x, y); // Fixed typo: p.vertex instead of p(vertex
          }
          p.endShape();
          t += 0.05;
        };
      });

      // Overlap Waveform with Tone Type and Particle Effects
      const overlapSketch = new p5((p: any) => {
        let t = 0;
        let particles: { x: number; y: number; speed: number }[] = [];

        p.setup = () => {
          p.createCanvas(600, 150).parent(overlapSketchRef.current!);
          p.background(255);
          // Initialize particles
          for (let i = 0; i < 50; i++) {
            particles.push({
              x: p.random(p.width),
              y: p.height / 2,
              speed: p.random(-1, 1),
            });
          }
        };

        p.draw = () => {
          p.background(255);
          // Calculate beat frequency for color gradient
          const beatFreq = Math.abs(leftFreq - rightFreq);
          const r = p.map(beatFreq, 0, 100, 255, 0);
          const g = p.map(beatFreq, 0, 100, 0, 255);
          p.stroke(r, g, 147); // Dynamic color based on beat frequency
          p.strokeWeight(2);
          p.noFill();
          p.beginShape();
          for (let x = 0; x < p.width; x++) {
            let y1 = p.sin(t + (x / 50) * (leftFreq / 100));
            let y2 = p.sin(t + (x / 50) * (rightFreq / 100));
            let y = p.height / 2 + (y1 + y2) * (p.height / 4) * (toneType === 'Flute' ? 0.8 : 1);
            p.vertex(x, y); // Fixed typo: p.vertex instead of p(vertex
          }
          p.endShape();

          // Particle effects influenced by tone type and volume
          p.noStroke();
          p.fill(255, 215, 0, 150); // Gold particles with transparency
          particles.forEach((particle) => {
            particle.x += particle.speed * (volume / 50);
            let y1 = p.sin(t + (particle.x / 50) * (leftFreq / 100));
            let y2 = p.sin(t + (particle.x / 50) * (rightFreq / 100));
            particle.y = p.height / 2 + (y1 + y2) * (p.height / 4) * (toneType === 'Flute' ? 0.8 : 1);
            if (particle.x < 0 || particle.x > p.width) particle.speed *= -1;
            p.ellipse(particle.x, particle.y, 5, 5);
          });

          t += 0.05;
        };
      });

      return () => {
        leftSketch.remove();
        rightSketch.remove();
        overlapSketch.remove();
      };
    }).catch((err) => console.error('Failed to load p5:', err));
  }, [leftFreq, rightFreq, toneType, volume]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Geometry & Waveform Visualizations</h1>
        <div className="space-y-4">
          <div>
            <label className="block font-semibold text-sm">Left Ear Waveform</label>
            <div ref={leftSketchRef} className="border rounded"></div>
          </div>
          <div>
            <label className="block font-semibold text-sm">Right Ear Waveform</label>
            <div ref={rightSketchRef} className="border rounded"></div>
          </div>
          <div>
            <label className="block font-semibold text-sm">Overlap Waveform</label>
            <div ref={overlapSketchRef} className="border rounded"></div>
          </div>
        </div>
        <button
          onClick={() => console.log('Play')}
          className="mt-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
        >
          Play
        </button>
        <div className="mt-4">
          <label className="block">Left Frequency: {leftFreq} Hz</label>
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
            <SliderPrimitive.Thumb className="block w-5 h-5 bg-blue-500 rounded-full focus:outline-none" />
          </SliderPrimitive.Root>
        </div>
        <div className="mt-4">
          <label className="block">Right Frequency: {rightFreq} Hz</label>
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
            <SliderPrimitive.Thumb className="block w-5 h-5 bg-blue-500 rounded-full focus:outline-none" />
          </SliderPrimitive.Root>
        </div>
        <div className="mt-4">
          <label className="block">Tone Type</label>
          <select
            value={toneType}
            onChange={(e) => setToneType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option>Flute</option>
            <option>Other</option>
          </select>
        </div>
        <div className="mt-4">
          <label className="block">Background Music</label>
          <select
            value={bgMusic}
            onChange={(e) => setBgMusic(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option>None</option>
            <option>Sample</option>
          </select>
        </div>
        <div className="mt-4">
          <label className="block">Volume: {volume}%</label>
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
            <SliderPrimitive.Thumb className="block w-5 h-5 bg-blue-500 rounded-full focus:outline-none" />
          </SliderPrimitive.Root>
        </div>
        <div className="mt-4 flex space-x-4">
          <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-700">
            Pause
          </button>
          <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700">
            Stop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
