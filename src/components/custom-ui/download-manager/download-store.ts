import {
  getNativeItem,
  removeNativeItem,
  updateNativeItem,
} from "@/lib/indexeddb/dbUtils";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Status =
  | "queued"
  | "in-progress"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export interface DownloadItem {
  id: string;
  filename: string;
  url: string;
  progress: number;
  status: Status;
  received: number;
  total: number;
  controller?: AbortController;
  chunks?: BlobPart[];
}

interface State {
  downloads: DownloadItem[];
  startDownload: (
    item: Omit<
      DownloadItem,
      "progress" | "status" | "received" | "total" | "chunks"
    >
  ) => void;
  pauseDownload: (id: string) => void;
  resumeDownload: (id: string) => void;
  cancelDownload: (id: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
  processQueue: () => void;
}

export const useDownloadStore = create<State>()(
  persist(
    (set, get) => ({
      downloads: [],

      startDownload: (item) => {
        const newItem: DownloadItem = {
          ...item,
          progress: 0,
          status: "queued",
          received: 0,
          total: 0,
        };
        set((s) => ({
          downloads: [...s.downloads, newItem],
        }));
        get().processQueue();
      },

      pauseDownload: (id) => {
        const item = get().downloads.find((d) => d.id === id);
        if (item?.controller?.abort) item.controller.abort();
        set((state) => ({
          downloads: state.downloads.map((d) =>
            d.id === id ? { ...d, status: "paused", controller: undefined } : d
          ),
        }));
      },

      resumeDownload: async (id) => {
        const storedChunks = await getNativeItem(
          "download_chunks_db",
          "chunks",
          id
        );

        set((state) => ({
          downloads: state.downloads.map((d) =>
            d.id === id
              ? {
                  ...d,
                  status: "queued",
                  chunks: storedChunks || [],
                }
              : d
          ),
        }));
        get().processQueue();
      },

      cancelDownload: async (id) => {
        const item = get().downloads.find((d) => d.id === id);
        if (item?.controller?.abort) item.controller.abort();
        await removeNativeItem("download_chunks_db", "chunks", id);
        set((state) => ({
          downloads: state.downloads.filter((d) => d.id !== id),
        }));
      },

      clearCompleted: () => {
        set((state) => ({
          downloads: state.downloads.filter((d) => d.status !== "completed"),
        }));
      },

      clearAll: () => {
        get().downloads.forEach(async (d) => {
          if (d.controller?.abort) d.controller.abort();
          await removeNativeItem("download_chunks_db", "chunks", d.id);
        });
        set({ downloads: [] });
      },

      processQueue: async () => {
        const { downloads } = get();
        if (downloads.some((d) => d.status === "in-progress")) return;

        const next = downloads.find((d) => d.status === "queued");
        if (!next) return;

        const controller = new AbortController();
        next.controller = controller;
        next.status = "in-progress";

        // Ensure chunks is initialized
        const storedChunks = await getNativeItem(
          "download_chunks_db",
          "chunks",
          next.id
        );
        const chunks: BlobPart[] = next.chunks ?? storedChunks ?? [];
        next.chunks = chunks;
        let received = next.received;

        set({ downloads: [...downloads] });

        try {
          const token =
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbmFibGVfaWQiOjEsInR5cGUiOiJVc2VyIiwiZXhwaXJlc19hdCI6IjIwMjUtMDctMDZUMTU6NDA6NTguOTQ3OTgzWiJ9.8n5WPQsNOePe-dauBUREZncRhMQincBvze-u6XUu7_s";

          // Build headers, including Range and Authorization
          const headers: Record<string, string> =
            received > 0 ? { Range: `bytes=${received}-` } : {};
          if (token) headers["Authorization"] = `Bearer ${token}`;

          const response = await fetch(next.url, {
            signal: controller.signal,
            headers,
            credentials: "include", // include cookies if needed
          });
          // const response = await fetch(next.url, {
          //   signal: controller.signal,
          //   headers: received > 0 ? { Range: `bytes=${received}-` } : {},
          // });

          const contentRange = response.headers.get("Content-Range");
          if (contentRange) {
            const match = contentRange.match(/\/(\d+)$/);
            if (match) next.total = parseInt(match[1]);
          } else {
            const contentLength = +response.headers.get("Content-Length")!;
            next.total = next.total || contentLength;
          }

          const reader = response.body?.getReader();

          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;
            if (value) {
              chunks.push(value);
              received += value.length;

              await updateNativeItem("download_chunks_db", "chunks", {
                key: next.id,
                value: chunks,
              });
              set((state) => ({
                downloads: state.downloads.map((d) =>
                  d.id === next.id
                    ? {
                        ...d,
                        received,
                        chunks,
                        progress: next.total
                          ? Math.round((received / next.total) * 100)
                          : 0,
                      }
                    : d
                ),
              }));
            }
          }

          const blob = new Blob(chunks);
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = next.filename;
          a.style.display = "none";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);

          await removeNativeItem("download_chunks_db", "chunks", next.id);

          set((state) => ({
            downloads: state.downloads.map((d) =>
              d.id === next.id
                ? {
                    ...d,
                    status: "completed",
                    progress: 100,
                    controller: undefined,
                    chunks: undefined,
                  }
                : d
            ),
          }));
        } catch (err) {
          const aborted = controller.signal.aborted;
          set((state) => ({
            downloads: state.downloads.map((d) =>
              d.id === next.id
                ? {
                    ...d,
                    status: aborted ? "paused" : "failed",
                    controller: undefined,
                  }
                : d
            ),
          }));
        }

        setTimeout(() => get().processQueue(), 200);
      },
    }),
    {
      name: "downloader-store",
      partialize: (state) => ({
        downloads: state.downloads.map(({ chunks, ...rest }) => rest),
      }),
    }
  )
);
