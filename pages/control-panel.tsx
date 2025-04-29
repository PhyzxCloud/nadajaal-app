import * as React from 'react';
  import * as SliderPrimitive from '@radix-ui/react-slider';
  import p5 from 'p5';

  const ControlPanel = () => {
    const [leftFreq, setLeftFreq] = React.useState(200);
    const [rightFreq, setRightFreq] = React.useState(210);
    const [toneType, setToneType] = React.useState('Flute');
    const [bgMusic, setBgMusic] = React.useState('None');
    const [volume, setVolume] = React.useState(50);
    const sketchRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const sketch = new p5((p: p5) => {
        let angle = 0;

        p.setup = () => {
          p.createCanvas(400, 200).parent(sketchRef.current!);
          p.background(255);
        };

        p.draw = () => {
          p.background(255);
          p.translate(p.width / 2, p.height / 2);
          p.stroke(0);
          p.noFill();
          p.beginShape();
          for (let i = 0; i < 360; i++) {
            let rad = p.radians(i);
            let r = p.map(p.sin(angle + rad * (leftFreq / 100)), -1, 1, 50, 150);
            let x = r * p.cos(rad);
            let y = r * p.sin(rad);
            p.vertex(x, y);
          }
          p.endShape();
          angle += 0.05;
        };
      });

      return () => sketch.remove();
    }, [leftFreq]);

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Geometry & Waveform Visualizations</h1>
          <button
            onClick={() => console.log('Play')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
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
          <div ref={sketchRef} className="mt-6"></div>
        </div>
      </div>
    );
  };

  export default ControlPanel;
