import './performance.css'

import type { System } from '../types.d'
import { createSignal, onCleanup, createEffect } from 'solid-js'

type Props = {
  system: System
}

/**
 * 
 */
function getMemoryUsage () {
  const perf = performance as Performance & { memory: { usedJSHeapSize: number }}

  return perf.memory
    ? Math.floor(perf.memory.usedJSHeapSize / 1024 / 1024 / 2)
    : 0
}

/**
 * 
 */
export const Performance = ({ system }: Props ) => {
  // Performance metrics
  const [fps, setFps] = createSignal(0)
  const [memory, setMemory] = createSignal(0)
  const [cpu, setCpu] = createSignal(0)

  // Update performance metrics every second
  createEffect(() => {
    const updateMetrics = () => {
      const fps = Math.floor(system.game.loop.actualFps)
      const delta = system.performance.getLastDelta()
      setFps(fps)
      setMemory(getMemoryUsage())
      setCpu(Math.floor(delta / fps * 100))
    };

    const interval = setInterval(updateMetrics, 100);
    onCleanup(() => clearInterval(interval));
  });

  return (
    <div class="performance-metrics">
      <div class="metric" style={{
        'background-color': '#e57373'
      }}>
        FPS: {fps()}
      </div>
      <div class="metric" style={{
        'background-color': '#64b5f6'
      }}>
        Memory: {memory()} MB
      </div>
      <div class="metric" style={{
        'background-color': '#81c784'
      }}>
        Chug: {cpu()}%
      </div>
    </div>
  );
};
