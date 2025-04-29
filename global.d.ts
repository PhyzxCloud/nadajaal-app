// global.d.ts
import 'p5';

declare global {
  interface Window {
    p5: typeof p5;
  }
}
