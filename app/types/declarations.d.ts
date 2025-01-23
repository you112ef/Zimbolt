// app/types/declarations.d.ts

// Declare module 'ai' with all necessary exports
declare module 'ai' {
  export interface Message {
    id: string;
    content: string;
    sender: 'user' | 'bot';
    timestamp: number;
    role?: 'system' | 'user' | 'assistant' | 'data'; // Added 'role' to match usage
    // Add other properties as needed
  }

  export type JSONValue = string | number | boolean | JSONObject | JSONArray;
  export interface JSONObject {
    [key: string]: JSONValue;
  }
  export interface JSONArray extends Array<JSONValue> {}

  export function generateId(): string;
  export function createDataStream(): any; // Replace 'any' with actual type if known
  export function streamText(): any; // Replace 'any' with actual type if known
  export function convertToCoreMessages(messages: Message[]): Message[];
  export function generateText(): any; // Replace 'any' with actual type if known
  // Add other exports as needed
}

// Declare module 'remix-utils/client-only'
declare module 'remix-utils/client-only' {
  import { ComponentType } from 'react';
  export const ClientOnly: ComponentType<{ children: () => React.ReactNode; fallback: React.ReactNode }>;
}

// Declare module 'js-cookie'
declare module 'js-cookie' {
  interface CookiesStatic {
    get(name: string): string | undefined;
    set(name: string, value: string, options?: any): void;
    remove(name: string, options?: any): void;
  }

  const Cookies: CookiesStatic;
  export default Cookies;
}

// Declare module '@radix-ui/react-tooltip'
declare module '@radix-ui/react-tooltip' {
  import * as React from 'react';

  export interface TooltipProps {
    // Define necessary props here
  }

  export const Tooltip: React.FC<TooltipProps>;

  export const Root: React.FC<{ delayDuration?: number }>;
  export const Trigger: React.FC<{ asChild?: boolean }>;
  export const Portal: React.FC;
  export const Content: React.FC<{ side?: string; sideOffset?: number }>;
  export const Arrow: React.FC;
  // Add other exports as needed
}

// Correctly declare module 'react-toastify' with 'toast' as a function and namespace
declare module 'react-toastify' {
  import * as React from 'react';

  export interface ToastContainerProps {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    autoClose?: number | false;
    hideProgressBar?: boolean;
    newestOnTop?: boolean;
    closeOnClick?: boolean;
    rtl?: boolean;
    pauseOnFocusLoss?: boolean;
    draggable?: boolean;
    pauseOnHover?: boolean;
    theme?: 'light' | 'dark' | 'colored';
    // Define other necessary props here
  }

  export const ToastContainer: React.FC<ToastContainerProps>;

  // Declare 'toast' as a function
  function toast(message: string): void;

  // Extend 'toast' with additional methods using a namespace
  namespace toast {
    function success(message: string): void;
    function error(message: string): void;
    function info(message: string): void;
    function warning(message: string): void;
    function loading(message: string): number; // Assuming 'loading' returns a toast ID
    function dismiss(toastId?: number): void;
    // Add other toast methods as needed
  }

  export { toast };
}

// Add any other modules that TypeScript complains about
// Example:
// declare module 'some-unknown-module';
