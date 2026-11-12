import './styles/index.css';
import { BridgeBlitzGame } from './core/BridgeBlitzGame';
import { initMobilePlatform } from './core/MobilePlatform';
import type { TelemetrySnapshot } from './core/types';

declare global {
  interface Window {
    __BRIDGE_BLITZ__?: {
      getSnapshot: () => TelemetrySnapshot;
      step: (seconds: number, targetX?: number) => TelemetrySnapshot;
    };
  }
}

void initMobilePlatform();
const game = new BridgeBlitzGame();

window.__BRIDGE_BLITZ__ = {
  getSnapshot: () => game.getTelemetrySnapshot(),
  step: (seconds: number, targetX?: number) => game.advanceSimulation(seconds, targetX),
};
