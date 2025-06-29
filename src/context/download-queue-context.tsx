"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type DownloadItem, type VideoInfo, type FormatInfo } from '@/lib/types';
import useLocalStorage from '@/hooks/use-local-storage';

interface DownloadQueueContextType {
  downloads: DownloadItem[];
  addDownload: (newDownload: { videoInfo: VideoInfo, format: FormatInfo }) => void;
  updateDownloadStatus: (id: string, status: 'Paused' | 'InProgress') => void;
  removeDownload: (id:string) => void;
  history: DownloadItem[];
  clearHistory: () => void;
}

const DownloadQueueContext = createContext<DownloadQueueContextType | undefined>(undefined);

export function DownloadQueueProvider({ children }: { children: ReactNode }) {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [history, setHistory] = useLocalStorage<DownloadItem[]>('downloadHistory', []);

  // Simulates download progress
  useEffect(() => {
    const interval = setInterval(() => {
      setDownloads(prevDownloads =>
        prevDownloads.map(item => {
          if (item.status === 'InProgress' && item.progress < 100) {
            const progressIncrement = (Math.random() * 5) + 5; // Simulate variable speed
            const newProgress = Math.min(item.progress + progressIncrement, 100);
            const downloadedSize = (item.fileSize * newProgress) / 100;
            const speed = (progressIncrement * item.fileSize / 100 / 1024 / 1024).toFixed(2);
            const etaSeconds = (100 - newProgress) / progressIncrement;
            const eta = new Date(etaSeconds * 1000).toISOString().substr(14, 5);

            if (newProgress >= 100) {
              // Move to history
              setHistory(prev => [...prev, { ...item, status: 'Completed', progress: 100, completedAt: new Date() }]);
              return null; // Will be filtered out
            }

            return { ...item, progress: newProgress, downloadedSize, speed, eta };
          }
          return item;
        }).filter(Boolean) as DownloadItem[]
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [setHistory]);

  const addDownload = (newDownload: { videoInfo: VideoInfo, format: FormatInfo }) => {
    const { videoInfo, format } = newDownload;
    const item: DownloadItem = {
      id: crypto.randomUUID(),
      videoId: videoInfo.id,
      title: videoInfo.title,
      thumbnailUrl: videoInfo.thumbnailUrl,
      status: 'Pending',
      progress: 0,
      fileSize: format.filesize || 50 * 1024 * 1024, // Mock size if not available
      downloadedSize: 0,
      startedAt: new Date(),
      completedAt: null,
      speed: '0',
      eta: 'N/A'
    };
    
    // For this simulation, we'll move it to InProgress right away if queue is not full
    const activeDownloads = downloads.filter(d => d.status === 'InProgress').length;
    if (activeDownloads < 3) { // Max 3 concurrent downloads
      item.status = 'InProgress';
    }

    setDownloads(prev => [...prev, item]);
  };

  const updateDownloadStatus = (id: string, status: 'Paused' | 'InProgress') => {
    setDownloads(prev =>
      prev.map(item => (item.id === id ? { ...item, status } : item))
    );
  };
  
  const removeDownload = (id: string) => {
    setDownloads(prev => prev.filter(item => item.id !== id));
  };
  
  const clearHistory = () => {
    setHistory([]);
  };

  const value = { downloads, addDownload, updateDownloadStatus, removeDownload, history, clearHistory };

  return (
    <DownloadQueueContext.Provider value={value}>
      {children}
    </DownloadQueueContext.Provider>
  );
}

export function useDownloadQueue() {
  const context = useContext(DownloadQueueContext);
  if (context === undefined) {
    throw new Error('useDownloadQueue must be used within a DownloadQueueProvider');
  }
  return context;
}
