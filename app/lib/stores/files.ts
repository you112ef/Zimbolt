// app/lib/stores/files.ts

import type { PathWatcherEvent, WebContainer } from '@webcontainer/api';
import { getEncoding } from 'istextorbinary';
import { map, type MapStore } from 'nanostores';
import { Buffer } from 'node:buffer';
import * as nodePath from 'node:path';
import { bufferWatchEvents } from '~/utils/buffer';
import { WORK_DIR } from '~/utils/constants';
import { computeFileModifications } from '~/utils/diff';
import { createScopedLogger } from '~/utils/logger';
import { unreachable } from '~/utils/unreachable';

const logger = createScopedLogger('FilesStore');

const utf8TextDecoder = new TextDecoder('utf8', { fatal: true });

/**
 * Represents a file with its content and binary status.
 */
export interface File {
  type: 'file';
  content: string;
  isBinary: boolean;
}

/**
 * Represents a directory.
 */
export interface Directory {
  type: 'directory';
}

/**
 * Union type representing either a File or a Directory.
 */
export type Dirent = File | Directory;

/**
 * Mapping of file paths to their corresponding Dirent (File or Directory).
 */
export type FileMap = {
  [filePath: string]: Dirent | undefined;
};

/**
 * FilesStore manages the state of files and directories within the WebContainer environment.
 * It handles file additions, deletions, modifications, and synchronizes with the WebContainer's filesystem.
 */
export class FilesStore {
  #webcontainer: Promise<WebContainer>;

  /**
   * Tracks the number of files (excluding directories).
   */
  #size = 0;

  /**
   * Keeps track of all modified files with their original content since the last user message.
   * Needs to be reset when the user sends another message, and all changes have to be submitted
   * for the model to be aware of the changes.
   */
  #modifiedFiles: Map<string, string> = import.meta.hot?.data.modifiedFiles ?? new Map();

  /**
   * Map of files and directories that reflects the state of the WebContainer.
   */
  files: MapStore<FileMap> = import.meta.hot?.data.files ?? map({});

  /**
   * Retrieves the total number of files managed by the store.
   */
  get filesCount() {
    return this.#size;
  }

  /**
   * Initializes the FilesStore with a WebContainer instance.
   *
   * @param webcontainerPromise - A promise that resolves to a WebContainer instance.
   */
  constructor(webcontainerPromise: Promise<WebContainer>) {
    this.#webcontainer = webcontainerPromise;

    if (import.meta.hot) {
      import.meta.hot.data.files = this.files;
      import.meta.hot.data.modifiedFiles = this.#modifiedFiles;
    }

    this.#init();
  }

  /**
   * Retrieves a File Dirent by its file path.
   *
   * @param filePath - The path of the file to retrieve.
   * @returns The File Dirent if found and is a file; otherwise, undefined.
   */
  getFile(filePath: string): File | undefined {
    const dirent = this.files.get()[filePath];

    if (dirent?.type !== 'file') {
      return undefined;
    }

    return dirent;
  }

  /**
   * Computes the modifications made to the files since the last reset.
   *
   * @returns An object representing the modifications.
   */
  getFileModifications() {
    return computeFileModifications(this.files.get(), this.#modifiedFiles);
  }

  /**
   * Resets the tracking of file modifications.
   */
  resetFileModifications() {
    this.#modifiedFiles.clear();
  }

  /**
   * Saves the content of a file, updating both the WebContainer and the local store.
   *
   * @param filePath - The path of the file to save.
   * @param content - The new content to write to the file.
   */
  async saveFile(filePath: string, content: string) {
    const webcontainer = await this.#webcontainer;

    try {
      const relativePath = nodePath.relative(webcontainer.workdir, filePath);

      if (!relativePath) {
        throw new Error(`EINVAL: invalid file path, write '${relativePath}'`);
      }

      const oldContent = this.getFile(filePath)?.content;

      if (!oldContent) {
        unreachable('Expected content to be defined');
      }

      await webcontainer.fs.writeFile(relativePath, content);

      if (!this.#modifiedFiles.has(filePath)) {
        this.#modifiedFiles.set(filePath, oldContent);
      }

      // Immediately update the file in the local store without waiting for the watcher event
      this.files.setKey(filePath, { type: 'file', content, isBinary: false });

      logger.info(`File updated: ${filePath}`);
    } catch (error) {
      logger.error('Failed to update file content\n\n', error);

      throw error;
    }
  }

  /**
   * Initializes the FilesStore by setting up path watchers in the WebContainer.
   */
  async #init() {
    const webcontainer = await this.#webcontainer;

    webcontainer.internal.watchPaths(
      { include: [`${WORK_DIR}/**`], exclude: ['**/node_modules', '.git'], includeContent: true },
      bufferWatchEvents(100, this.#processEventBuffer.bind(this))
    );
  }

  /**
   * Processes a buffer of path watcher events, updating the local file map accordingly.
   *
   * @param events - An array of path watcher events.
   */
  #processEventBuffer(events: Array<[events: PathWatcherEvent[]]>) {
    const watchEvents = events.flat(2);

    for (const { type, path, buffer } of watchEvents) {
      // Remove any trailing slashes for consistency
      const sanitizedPath = path.replace(/\/+$/g, '');

      switch (type) {
        case 'add_dir': {
          // Intentionally adding a trailing slash to distinguish directories
          this.files.setKey(sanitizedPath, { type: 'directory' });
          break;
        }
        case 'remove_dir': {
          this.files.setKey(sanitizedPath, undefined);

          // Recursively remove all nested files and directories within the removed directory
          for (const direntPath of Object.keys(this.files.get())) {
            if (direntPath.startsWith(`${sanitizedPath}/`)) {
              this.files.setKey(direntPath, undefined);
            }
          }

          break;
        }
        case 'add_file':
        case 'change': {
          if (type === 'add_file') {
            this.#size++;
          }

          let content = '';

          /**
           * @note This check is purely for the editor. The detection method is not
           * bullet-proof and may result in false positives.
           * The goal is to avoid displaying or editing binary files.
           */
          const isBinary = isBinaryFile(buffer);

          if (!isBinary) {
            content = this.#decodeFileContent(buffer);
          }

          this.files.setKey(sanitizedPath, { type: 'file', content, isBinary });

          break;
        }
        case 'remove_file': {
          this.#size--;
          this.files.setKey(sanitizedPath, undefined);
          break;
        }
        case 'update_directory': {
          // These events are not handled as directory metadata isn't tracked
          break;
        }
        default: {
          // Handle unexpected event types gracefully
          logger.warn(`Unhandled event type: ${type} for path: ${path}`);
          break;
        }
      }
    }
  }

  /**
   * Decodes the content of a file from a Uint8Array buffer to a UTF-8 string.
   *
   * @param buffer - The buffer containing the file's content.
   * @returns The decoded string content of the file.
   */
  #decodeFileContent(buffer?: Uint8Array): string {
    if (!buffer || buffer.byteLength === 0) {
      return '';
    }

    try {
      return utf8TextDecoder.decode(buffer);
    } catch (error) {
      logger.error('Failed to decode file content', error);
      return '';
    }
  }
}

/**
 * Determines whether a file is binary based on its buffer content.
 *
 * @param buffer - The buffer to analyze.
 * @returns True if the file is binary; otherwise, false.
 */
function isBinaryFile(buffer: Uint8Array | undefined): boolean {
  if (buffer === undefined) {
    return false;
  }

  return getEncoding(convertToBuffer(buffer), { chunkLength: 100 }) === 'binary';
}

/**
 * Converts a `Uint8Array` into a Node.js `Buffer` by referencing the same underlying ArrayBuffer.
 * This avoids expensive copies and ensures efficient memory usage.
 *
 * @param view - The Uint8Array to convert.
 * @returns A Buffer representing the same data as the input Uint8Array.
 */
function convertToBuffer(view: Uint8Array): Buffer {
  return Buffer.from(view.buffer, view.byteOffset, view.byteLength);
}
