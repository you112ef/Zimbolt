// app/types/xterm.d.ts

declare module '@xterm/xterm/css/xterm.css?url' {
    const value: string;
    export default value;
  }
  
  declare module '@xterm/xterm' {
    import { EventEmitter } from 'events';
  
    export class Terminal extends EventEmitter {
      constructor(options?: any);
      open(container: HTMLElement): void;
      write(data: string): void;
      // Add other necessary methods and properties based on your usage
    }
  
    // If there are other exports, declare them here
  }
  