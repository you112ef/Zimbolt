// app/entry.server.tsx

import type { AppLoadContext, EntryContext } from '@remix-run/cloudflare';
import { RemixServer } from '@remix-run/react';
import { isbot } from 'isbot';
import { renderToReadableStream } from 'react-dom/server';
import { renderHeadToString } from 'remix-island';
import { Head } from './root';
import { themeStore } from '~/lib/stores/theme';
import ErrorBoundary from './components/ui/ErrorBoundary'; // Import the ErrorBoundary

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  _loadContext: AppLoadContext,
) {
  // Optional: Initialize model list or other server-side tasks
  // await initializeModelList({});

  let readable: ReadableStream<Uint8Array>;

  try {
    readable = await renderToReadableStream(<RemixServer context={remixContext} url={request.url} />, {
      signal: request.signal,
      onError(error: unknown) {
        console.error('Render error:', error);
        responseStatusCode = 500;
      },
    });
  } catch (error) {
    console.error('Failed to render:', error);
    // Render a simple error page if server-side rendering fails
    const errorPage = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Error</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f8d7da; color: #721c24; }
            .container { text-align: center; }
            button { padding: 10px 20px; background-color: #721c24; color: white; border: none; border-radius: 5px; cursor: pointer; }
            button:hover { background-color: #501217; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Something Went Wrong</h1>
            <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
            <button onclick="window.location.reload()">Reload Page</button>
          </div>
        </body>
      </html>
    `;
    return new Response(errorPage, {
      status: 500,
      headers: {
        'Content-Type': 'text/html',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
    });
  }

  const body = new ReadableStream({
    start(controller) {
      const head = renderHeadToString({ request, remixContext, Head });

      controller.enqueue(
        new Uint8Array(
          new TextEncoder().encode(
            `<!DOCTYPE html><html lang="en" data-theme="${themeStore.value}"><head>${head}</head><body><div id="root" class="w-full h-full">`,
          ),
        ),
      );

      const reader = readable.getReader();

      function read() {
        reader
          .read()
          .then(({ done, value }) => {
            if (done) {
              controller.enqueue(new Uint8Array(new TextEncoder().encode('</div></body></html>')));
              controller.close();

              return;
            }

            controller.enqueue(value);
            read();
          })
          .catch((error) => {
            controller.error(error);
            readable.cancel();
          });
      }
      read();
    },

    cancel() {
      readable.cancel();
    },
  });

  if (isbot(request.headers.get('user-agent') || '')) {
    await readable.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');

  responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
  responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
