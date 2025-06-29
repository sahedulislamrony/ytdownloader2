"use client";

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { type DownloadItem, type VideoInfo, type FormatInfo, type AppSettings } from '@/lib/types';
import useLocalStorage from '@/hooks/use-local-storage';
import { downloadVideo } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

interface DownloadQueueContextType {
  downloads: DownloadItem[];
  addDownload: (newDownload: { videoInfo: VideoInfo; format: FormatInfo }) => void;
  updateDownloadStatus: (id: string, status: 'Paused' | 'InProgress') => void;
  removeDownload: (id: string) => void;
  history: DownloadItem[];
  clearHistory: () => void;
}

const DownloadQueueContext = createContext<DownloadQueueContextType | undefined>(undefined);

const defaultSettings: AppSettings = {
  theme: 'dark',
  defaultDownloadPath: '/home/user/downloads',
  maxConcurrentDownloads: 3,
  showNotifications: true,
  ytDlpPath: '',
}

export function DownloadQueueProvider({ children }: { children: ReactNode }) {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [history, setHistory] = useLocalStorage<DownloadItem[]>('downloadHistory', []);
  const [settings] = useLocalStorage<AppSettings>('app-settings', defaultSettings);
  const { toast } = useToast();

  // Manage queue and trigger downloads
  useEffect(() => {
    const activeDownloads = downloads.filter(d => d.status === 'InProgress').length;
    const pendingDownloads = downloads.filter(d => d.status === 'Pending');

    if (pendingDownloads.length > 0 && activeDownloads < settings.maxConcurrentDownloads) {
      const itemToDownload = pendingDownloads[0];
      
      setDownloads(prev =>
        prev.map(d =>
          d.id === itemToDownload.id ? { ...d, status: 'InProgress', startedAt: new Date() } : d
        )
      );

      downloadVideo({
        url: itemToDownload.webpageUrl,
        formatId: itemToDownload.formatId,
        downloadPath: settings.defaultDownloadPath,
        ytDlpPath: settings.ytDlpPath,
      }).then(result => {
        if (result.success) {
            const completedItem = { 
                ...itemToDownload, 
                status: 'Completed' as const, 
                progress: 100, 
                completedAt: new Date(), 
                filePath: result.filePath,
                downloadedSize: itemToDownload.fileSize // Set to full size on completion
            };
            setHistory(prev => [...prev, completedItem]);
            setDownloads(prev => prev.filter(d => d.id !== itemToDownload.id));
            if(settings.showNotifications) {
                toast({
                  title: "Download Complete",
                  description: `${itemToDownload.title} has been downloaded.`,
                });
            }
        } else {
            setDownloads(prev =>
                prev.map(d =>
                d.id === itemToDownload.id
                    ? { ...d, status: 'Failed', errorMessage: result.error, progress: 0 }
                    : d
                )
            );
            if(settings.showNotifications) {
                toast({
                    variant: 'destructive',
                    title: "Download Failed",
                    description: result.error,
                });
            }
        }
      });
    }
  }, [downloads, settings.maxConcurrentDownloads, settings.defaultDownloadPath, settings.ytDlpPath, setHistory, toast, settings.showNotifications]);

  // Simulate progress for InProgress items
  useEffect(() => {
    const interval = setInterval(() => {
      setDownloads(prevDownloads =>
        prevDownloads.map(item => {
          if (item.status === 'InProgress') {
            const newProgress = Math.min(item.progress + (Math.random() * 5), 99);
            const downloadedSize = (item.fileSize * newProgress) / 100;
            const speed = (Math.random() * 2.5 + 0.5).toFixed(2);
            const etaSeconds = (100 - newProgress) / 5;
            const eta = new Date(etaSeconds * 1000).toISOString().substr(14, 5);
            return { ...item, progress: newProgress, downloadedSize: Math.round(downloadedSize), speed, eta };
          }
          return item;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addDownload = useCallback((newDownload: { videoInfo: VideoInfo, format: FormatInfo }) => {
    const { videoInfo, format } = newDownload;
    const item: DownloadItem = {
      id: crypto.randomUUID(),
      videoId: videoInfo.id,
      title: videoInfo.title,
      thumbnailUrl: videoInfo.thumbnailUrl,
      status: 'Pending',
      progress: 0,
      fileSize: format.filesize || 50 * 1024 * 1024,
      downloadedSize: 0,
      startedAt: new Date(),
      completedAt: null,
      speed: '0',
      eta: 'N/A',
      webpageUrl: videoInfo.webpageUrl,
      formatId: format.format_id,
    };
    setDownloads(prev => [...prev, item]);
  }, []);

  const updateDownloadStatus = (id: string, status: 'Paused' | 'InProgress') => {
    // Note: This pause is cosmetic and only stops the progress bar simulation.
    // The actual download process with yt-dlp continues in the background on the server.
    setDownloads(prev =>
      prev.map(item => {
          if (item.id === id && item.status !== 'Pending') {
              return { ...item, status };
          }
          return item;
      })
    );
  };
  
  const removeDownload = (id: string) => {
    // Note: This does not cancel the actual download process on the server if it has started.
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
