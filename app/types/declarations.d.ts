// app/types/declarations.d.ts

declare module 'ai' {
    export interface Message {
      id: string;
      content: string;
      sender: 'user' | 'bot';
      timestamp: number;
    }
  
    // Add other exports from 'ai' as needed
  }
  
  declare module 'remix-utils/client-only' {
    import { ComponentType } from 'react';
    export const ClientOnly: ComponentType<{ children: () => React.ReactNode }>;
  }
  
  declare module 'js-cookie' {
    interface CookiesStatic {
      get(name: string): string | undefined;
      set(name: string, value: string, options?: any): void;
      remove(name: string, options?: any): void;
    }
  
    const Cookies: CookiesStatic;
    export default Cookies;
  }
  
  declare module '@radix-ui/react-tooltip' {
    import * as React from 'react';
  
    export interface TooltipProps {
      // Define necessary props here
    }
  
    export const Tooltip: React.FC<TooltipProps>;
  
    // Add other exports as needed
  }
  
  declare module 'react-toastify' {
    import * as React from 'react';
  
    export interface ToastContainerProps {
      // Define necessary props here
    }
  
    export const ToastContainer: React.FC<ToastContainerProps>;
  
    export function toast(message: string): void;
    export function toast.success(message: string): void;
    // Add other toast functions as needed
  }
  
  declare module 'ai' {
    // Add additional declarations if needed
  }
  
  // Add any other modules that TypeScript complains about
  