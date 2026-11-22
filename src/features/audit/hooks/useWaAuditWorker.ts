"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AuditConfig,
  LocalAuditResult,
  WaWorkerResponse,
} from "../types";

const MAX_FILE_BYTES = 25 * 1024 * 1024;

interface UseWaAuditWorkerOptions {
  onSuccess?: (result: LocalAuditResult, mode: "load" | "reanalyze") => void;
  onError?: (message: string) => void;
}

export function useWaAuditWorker(options: UseWaAuditWorkerOptions = {}) {
  const workerRef = useRef<Worker | null>(null);
  const modeRef = useRef<"load" | "reanalyze">("load");
  const callbacksRef = useRef<UseWaAuditWorkerOptions>(options);

  const [result, setResult] = useState<LocalAuditResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedSource, setHasLoadedSource] = useState(false);

  useEffect(() => {
    callbacksRef.current = options;
  });

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const ensureWorker = useCallback((): Worker => {
    if (workerRef.current) {
      return workerRef.current;
    }

    const worker = new Worker(
      new URL("../../../workers/wa-parser.worker.ts", import.meta.url),
      { type: "module" }
    );

    worker.addEventListener(
      "message",
      (event: MessageEvent<WaWorkerResponse>) => {
        const msg = event.data;
        setIsProcessing(false);

        if (msg.type === "ERROR") {
          setError(msg.message);
          callbacksRef.current.onError?.(msg.message);
          return;
        }

        setError(null);
        setHasLoadedSource(true);
        setResult(msg.result);
        callbacksRef.current.onSuccess?.(msg.result, modeRef.current);
      }
    );

    worker.addEventListener("error", () => {
      const msg = "Web Worker gagal memproses file WhatsApp secara lokal.";
      setIsProcessing(false);
      setError(msg);
      callbacksRef.current.onError?.(msg);
    });

    workerRef.current = worker;
    return worker;
  }, []);

  const processBuffer = useCallback(
    (fileName: string, buffer: ArrayBuffer, config: AuditConfig) => {
      const worker = ensureWorker();
      modeRef.current = "load";
      setIsProcessing(true);
      setError(null);
      worker.postMessage(
        { type: "PARSE_FILE", fileName, buffer, config },
        [buffer]
      );
    },
    [ensureWorker]
  );

  const processFile = useCallback(
    async (file: File, config: AuditConfig) => {
      const lowerName = file.name.toLowerCase();
      if (!lowerName.endsWith(".txt") && !lowerName.endsWith(".zip")) {
        const msg =
          "Format file tidak didukung. Pilih file .txt (Android) atau .zip (iOS).";
        setError(msg);
        callbacksRef.current.onError?.(msg);
        return;
      }

      if (file.size > MAX_FILE_BYTES) {
        const msg = "Ukuran file melebihi batas 25 MB.";
        setError(msg);
        callbacksRef.current.onError?.(msg);
        return;
      }

      try {
        const buffer = await file.arrayBuffer();
        processBuffer(file.name, buffer, config);
      } catch {
        const msg = "Gagal membaca file dari perangkat Anda.";
        setError(msg);
        callbacksRef.current.onError?.(msg);
      }
    },
    [processBuffer]
  );

  const loadDemoDataset = useCallback(
    async (config: AuditConfig) => {
      setIsProcessing(true);
      setError(null);
      try {
        const response = await fetch("/demo/agency-90d-wa.txt", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Dataset simulasi 90 hari tidak ditemukan.");
        }
        const buffer = await response.arrayBuffer();
        processBuffer("Dataset Simulasi 90 Hari", buffer, config);
      } catch {
        const msg = "Gagal memuat dataset simulasi 90 hari.";
        setIsProcessing(false);
        setError(msg);
        callbacksRef.current.onError?.(msg);
      }
    },
    [processBuffer]
  );

  const reanalyze = useCallback(
    (config: AuditConfig) => {
      if (!hasLoadedSource || !workerRef.current) return;
      modeRef.current = "reanalyze";
      setIsProcessing(true);
      setError(null);
      workerRef.current.postMessage({ type: "REANALYZE", config });
    },
    [hasLoadedSource]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    result,
    isProcessing,
    error,
    hasLoadedSource,
    processFile,
    loadDemoDataset,
    reanalyze,
    clearError,
  };
}
