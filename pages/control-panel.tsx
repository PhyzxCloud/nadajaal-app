import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Head from 'next/head';

export default function ControlPanel() {
  const [leftFreq, setLeftFreq] = useState<number>(200);
  const [rightFreq, setRightFreq] = useState<number>(210);
  const [toneType, setToneType] = useState<string>('flute');
  const [backgroundMusic, setBackgroundMusic] = useState<string>('none');
  const [volume, setVolume] = useState<number>(0.5);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscLeft = useRef<OscillatorNode | null>(null);
  const oscRight = useRef<OscillatorNode | null>(null);
  const gainNode = useRef<
    | GainNode
    | { gainL: GainNode; gainR: GainNode }
    | null
  >(null);
  const bgAudio = useRef<
    | { audio: HTMLAudioElement; gain: GainNode }
    | null
  >(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const backgroundTracks: { [key: string]: string | null } = {
    none: null,
    nature: 'https://assets.mixkit.co/music/preview/mixkit-forest-dawn-1217.mp3',
    piano: 'https://assets.mixkit.co/music/preview/mixkit-calm-piano-1215.mp3',
    lofi: 'https://assets.mixkit.co/music/preview/mixkit-lofi-hip-hop-1216.mp3',
  };

  const createInstrumentWave = (
    type: string,
    context: AudioContext,
    isMonaural: boolean,
    binauralBeatFreq: number,
    freq: number
  ): PeriodicWave => {
    if (!isMonaural && binauralBeatFreq <= 4) {
      const real = new Float32Array(2);
      const imag = new Float32Array(2);
      real[0] = 0; imag[0] = 0;
      real[1] = 1; imag[1] = 0;
      return context.createPeriodicWave(real, imag);
    }
    if (isMonaural && freq > 300) {
      const real = new Float32Array(2);
      const imag = new Float32Array(2);
      real[0] = 0; imag[0] = 0;
      real[1] = 1; imag[1] = 0;
      return context.createPeriodicWave(real, imag);
    }
    if (type === 'flute') {
      const real = new Float32Array(2);
      const imag = new Float32Array(2);
      real[0] = 0; imag[0] = 0;
      real[1] = 1; imag[1] = 0;
      return context.createPeriodicWave(real, imag);
    } else if (type === 'violin') {
      const real = new Float32Array(5);
      const imag = new Float32Array(5);
      real[0] = 0; imag[0] = 0;
      real[1] = 1; imag[1] = 0;
      real[2] = 0.5; imag[2] = 0;
      real[3] = 0.3; imag[3] = 0;
      real[4] = 0.1; imag[4] = 0;
      return context.createPeriodicWave(real, imag);
    } else if (type === 'cello') {
      const real = new Float32Array(4);
      const imag = new Float32Array(4);
      real[0] = 0; imag[0] = 0;
      real[1] = 1; imag[1] = 0;
      real[2] = 0.4; imag[2] = 0;
      real[3] = 0.2; imag[3] = 0;
      return context.createPeriodicWave(real, imag);
    }
    const real = new Float32Array(2);
    const imag = new Float32Array(2);
    real[0] = 0; imag[0] = 0;
    real[1] = 1; imag[1] = 0;
    return context.createPeriodicWave(real, imag);
  };

  const startAudio = async () => {
    if (!audioCtxRef.current) return;

    const audioCtx = audioCtxRef.current;
    await audioCtx.resume();
    const isMonaural = leftFreq === rightFreq;
    const binauralBeatFreq = Math.abs(leftFreq - rightFreq);

    if (isMonaural) {
      const osc = audioCtx.createOscillator();
      const wave = createInstrumentWave(toneType, audioCtx, isMonaural, binauralBeatFreq, leftFreq);
      osc.setPeriodicWave(wave);
      osc.frequency.setValueAtTime(leftFreq, audioCtx.currentTime);
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.5);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 60 - 0.5);
      osc.stop(audioCtx.currentTime + 60);
      oscLeft.current = osc;
      gainNode.current = gain;
    } else {
      const oscL = audioCtx.createOscillator();
      const oscR = audioCtx.createOscillator();
      const wave = createInstrumentWave(toneType, audioCtx, isMonaural, binauralBeatFreq, leftFreq);
      oscL.setPeriodicWave(wave);
      oscR.setPeriodicWave(wave);
      oscL.frequency.setValueAtTime(leftFreq, audioCtx.currentTime);
      oscR.frequency.setValueAtTime(rightFreq, audioCtx.currentTime);
      const gainL = audioCtx.createGain();
      const gainR = audioCtx.createGain();
      gainL.gain.setValueAtTime(0, audioCtx.currentTime);
      gainR.gain.setValueAtTime(0, audioCtx.currentTime);
      const gainValue = binauralBeatFreq <= 4 ? 0.4 : 0.5;
      gainL.gain.linearRampToValueAtTime(volume * gainValue, audioCtx.currentTime + 0.5);
      gainR.gain.linearRampToValueAtTime(volume * gainValue, audioCtx.currentTime + 0.5);
      const panL = audioCtx.createStereoPanner();
      const panR = audioCtx.createStereoPanner();
      panL.pan.value = -1;
      panR.pan.value = 1;
      oscL.connect(gainL).connect(panL).connect(audioCtx.destination);
      oscR.connect(gainR).connect(panR).connect(audioCtx.destination);
      oscL.start();
      oscR.start(audioCtx.currentTime + 0.01);
      gainL.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 60 - 0.5);
      gainR.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 60 - 0.5);
      oscL.stop(audioCtx.currentTime + 60);
      oscR.stop(audioCtx.currentTime + 60);
      oscLeft.current = oscL;
      oscRight.current = oscR;
      gainNode.current = { gainL, gainR };
    }

    const bgUrl = backgroundTracks[backgroundMusic];
    if (bgUrl && !bgAudio.current) {
      const audio = new Audio(bgUrl);
      audio.loop = true;
      const source = audioCtx.createMediaElementSource(audio);
      const gain = audioCtx.createGain();
      gain.gain.value = volume * 0.3;
      source.connect(gain).connect(audioCtx.destination);
      await audio.play();
      bgAudio.current = { audio, gain };
    }

    setIsPlaying(true);
  };

  const pauseAudio = () => {
    if (oscLeft.current) oscLeft.current.disconnect();
    if (oscRight.current) oscRight.current.disconnect();
    if (bgAudio.current) bgAudio.current.audio.pause();
    setIsPlaying(false);
  };

  const stopAudio = () => {
    if (oscLeft.current) oscLeft.current.stop();
    if (oscRight.current) oscRight.current.stop();
    if (bgAudio.current) {
      bgAudio.current.audio.pause();
      bgAudio.current.audio.currentTime = 0;
      bgAudio.current = null;
    }
    setIsPlaying(false);
  };

  const updateAudio = () => {
    if (!audioCtxRef.current || !isPlaying) return;

    const audioCtx = audioCtxRef.current;
    if (oscLeft.current) oscLeft.current.frequency.setValueAtTime(leftFreq, audioCtx.currentTime);
    if (oscRight.current) oscRight.current.frequency.setValueAtTime(rightFreq, audioCtx.currentTime);
    if (gainNode.current) {
      if ('gain' in gainNode.current) {
        (gainNode.current as GainNode).gain.setValueAtTime(volume, audioCtx.currentTime);
      } else {
        const gainValue = Math.abs(leftFreq - rightFreq) <= 4 ? 0.4 : 0.5;
        (gainNode.current as { gainL: GainNode; gainR: GainNode }).gainL.gain.setValueAtTime(volume * gainValue, audioCtx.currentTime);
        (gainNode.current as { gainL: GainNode; gainR: GainNode }).gainR.gain.setValueAtTime(volume * gainValue, audioCtx.currentTime);
      }
    }
    if (bgAudio.current) bgAudio.current.gain.gain.setValueAtTime(volume * 0.3, audioCtx.currentTime);

    if (backgroundMusic !== 'none') {
      if (!bgAudio.current) {
        const bgUrl = backgroundTracks[backgroundMusic];
        if (bgUrl) {
          const audio = new Audio(bgUrl);
          audio.loop = true;
          const source = audioCtx.createMediaElementSource(audio);
          const gain = audioCtx.createGain();
          gain.gain.setValueAtTime(volume * 0.3, audioCtx.currentTime);
          source.connect(gain).connect(audioCtx.destination);
          audio.play();
          bgAudio.current = { audio, gain };
        }
      }
    } else {
      if (bgAudio.current) {
        bgAudio.current.audio.pause();
        bgAudio.current.audio.currentTime = 0;
        bgAudio.current = null;
      }
    }

    const isMonaural = leftFreq === rightFreq;
    const binauralBeatFreq = Math.abs(leftFreq - rightFreq);
    const newWave = createInstrumentWave(toneType, audioCtx, isMonaural, binauralBeatFreq, leftFreq);
    if (isMonaural) {
      if (oscLeft.current) {
        oscLeft.current.setPeriodicWave(newWave);
      }
    } else {
      if (oscLeft.current) oscLeft.current.setPeriodicWave(newWave);
      if (oscRight.current) oscRight.current.setPeriodicWave(newWave);
    }
  };

  useEffect(() => {
    updateAudio();
  }, [leftFreq, rightFreq, toneType, volume, backgroundMusic]);

  return (
    <>
      <Head>
        <title>Nādajaal Control Panel</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 text-gray-900 p-6 font-serif" style={{ fontFamily: "'EB Garamond', serif" }}>
        <div className="mb-8">
          <div className="h-64 bg-white rounded-lg shadow-lg flex items-center justify-center text-gray-600 border border-gray-200">
            Geometry & Waveform Visualizations
          </div>
        </div>
        <Button onClick={startAudio} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md mb-6 transition-colors" disabled={isPlaying}>
          Play
        </Button>
        <div className="space-y-8">
          <div>
            <label className="block text-lg font-medium text-gray-700">Left Frequency: {leftFreq} Hz</label>
            <Slider value={[leftFreq]} onValueChange={([v]) => setLeftFreq(v)} min={1} max={2000} className="mt-2" />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700">Right Frequency: {rightFreq} Hz</label>
            <Slider value={[rightFreq]} onValueChange={([v]) => setRightFreq(v)} min={1} max={2000} className="mt-2" />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700">Tone Type</label>
            <select value={toneType} onChange={(e) => setToneType(e.target.value)} className="w-full p-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="flute">Flute</option>
              <option value="violin">Violin</option>
              <option value="cello">Cello</option>
            </select>
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700">Background Music</label>
            <select value={backgroundMusic} onChange={(e) => setBackgroundMusic(e.target.value)} className="w-full p-2 mt-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="none">None</option>
              <option value="nature">Nature</option>
              <option value="piano">Piano</option>
              <option value="lofi">Lofi</option>
            </select>
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700">Volume: {(volume * 100).toFixed(0)}%</label>
            <Slider value={[volume]} onValueChange={([v]) => setVolume(v)} min={0} max={1} step={0.1} className="mt-2" />
          </div>
          <div className="flex space-x-6">
            <Button onClick={pauseAudio} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors" disabled={!isPlaying}>
              Pause
            </Button>
            <Button onClick={stopAudio} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors" disabled={!isPlaying}>
              Stop
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
