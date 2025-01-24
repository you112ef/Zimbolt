// app/types/remix-island.d.ts

declare module 'remix-island' {
  import React from 'react';
  import type { EntryContext } from '@remix-run/server-runtime';

  interface RemixIslandProps {
    children: React.ReactNode;
  }

  const RemixIsland: React.FC<RemixIslandProps>;
  export default RemixIsland;

  // Named exports with correct signatures
  export function renderHeadToString(args: {
    request: Request;
    remixContext: EntryContext;
    Head: React.FC<any>; // Changed from React.FC to React.FC<any>
  }): string;

  export function createHead(headFunction: () => React.ReactNode): JSX.Element;
}
