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
  retryDownload: (id: string) => void;
  history: DownloadItem[];
  clearHistory: () => void;
  clearCompleted: () => void;
}

const DownloadQueueContext = createContext<DownloadQueueContextType | undefined>(undefined);

const defaultSettings: Omit<AppSettings, 'defaultDownloadPath'> = {
  theme: 'dark',
  maxConcurrentDownloads: 3,
  showNotifications: true,
  ytDlpPath: '',
}

export function DownloadQueueProvider({ children }: { children: ReactNode }) {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [history, setHistory] = useLocalStorage<DownloadItem[]>('downloadHistory', []);
  const [settings] = useLocalStorage<AppSettings>('app-settings', defaultSettings as AppSettings);
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
        ytDlpPath: settings.ytDlpPath,
      }).then(result => {
        if (result.success) {
            const completedItem = { 
                ...itemToDownload, 
                status: 'Completed' as const, 
                progress: 100, 
                completedAt: new Date(), 
                fileName: result.fileName,
                downloadedSize: itemToDownload.fileSize
            };
            setDownloads(prev => prev.map(d => d.id === itemToDownload.id ? completedItem : d));
            setHistory(prev => [completedItem, ...prev]);

            if(settings.showNotifications) {
                toast({
                  title: "Download Complete",
                  description: `${itemToDownload.title} has been downloaded.`,
                });
            }
        } else {
            const failedItem = {
                 ...itemToDownload, 
                 status: 'Failed' as const, 
                 errorMessage: result.error, 
                 progress: 0,
                 completedAt: new Date(), 
            };
            setDownloads(prev => prev.map(d => d.id === itemToDownload.id ? failedItem : d));
            setHistory(prev => [failedItem, ...prev]);
            
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
  }, [downloads, settings.maxConcurrentDownloads, settings.ytDlpPath, setHistory, toast, settings.showNotifications]);

  // Simulate progress for InProgress items
  useEffect(() => {
    const interval = setInterval(() => {
      setDownloads(prevDownloads =>
        prevDownloads.map(item => {
          if (item.status === 'InProgress') {
            // Slower progress for larger files to make it feel more real
            const increment = item.fileSize > 50 * 1024 * 1024 ? Math.random() * 2 : Math.random() * 5;
            const newProgress = Math.min(item.progress + increment, 99);
            const downloadedSize = (item.fileSize * newProgress) / 100;
            const speed = (Math.random() * 2.5 + 0.5).toFixed(2);
            const etaSeconds = (100 - newProgress) / (increment * 1.5);
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
    setDownloads(prev =>
      prev.map(item => {
          if (item.id === id && (item.status === 'InProgress' || item.status === 'Paused')) {
              return { ...item, status };
          }
          return item;
      })
    );
  };
  
  const removeDownload = (id: string) => {
    setDownloads(prev => prev.filter(item => item.id !== id));
  };

  const retryDownload = (id: string) => {
    setDownloads(prev =>
      prev.map(item => {
          if (item.id === id && item.status === 'Failed') {
              return { 
                ...item,
                status: 'Pending',
                progress: 0,
                downloadedSize: 0,
                startedAt: new Date(),
                completedAt: null,
                errorMessage: undefined,
              };
          }
          return item;
      })
    );
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const clearCompleted = () => {
    setDownloads(prev => prev.filter(d => d.status !== 'Completed' && d.status !== 'Failed'));
  };

  const value = { downloads, addDownload, updateDownloadStatus, removeDownload, retryDownload, history, clearHistory, clearCompleted };

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
