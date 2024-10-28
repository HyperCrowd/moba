import type { System } from '../types.d'
import { createSignal, onCleanup, createEffect } from 'solid-js';
import './performance.css'; // Import CSS for styling

type Props = {
  system: System
}

export const Performance = ({ system }: Props ) => {
  // Performance metrics
  const [fps, setFps] = createSignal(0);
  const [memory, setMemory] = createSignal(0);
  const [cpu, setCpu] = createSignal(0);
  const [latency, setLatency] = createSignal(0);

  // Update performance metrics every second
  createEffect(() => {
    const updateMetrics = () => {
      setFps(system.game.loop.actualFps)
      setMemory(0)
      setCpu(0)
      setLatency(0)
    };

    const interval = setInterval(updateMetrics, 1000);
    onCleanup(() => clearInterval(interval));
  });

  return (
    <div class="performance-metrics" style={{
      display: 'flex',
      'list-style': 'none',
      padding: '0'
    }}>
      <div style={{
        'background-color': '#e57373',
        padding: '10px',
        color: 'white',
        'border-radius': '5px',
        margin: '5px'
      }}>
        FPS: {fps()}
      </div>
      <div style={{
        'background-color': '#64b5f6',
        padding: '10px',
        color: 'white',
        'border-radius': '5px',
        margin: '5px'
      }}>
        Memory: {memory()} MB
      </div>
      <div style={{
        'background-color': '#81c784',
        padding: '10px',
        color: 'white',
        'border-radius': '5px',
        margin: '5px'
      }}>
        CPU Load: {cpu()}%
      </div>
      <div style={{
        'background-color': '#ffb74d',
        padding: '10px',
        color: 'white',
        'border-radius': '5px',
        margin: '5px'
      }}>
        Network Latency: {latency()} ms
      </div>
    </div>
  );
};
