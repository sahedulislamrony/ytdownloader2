export interface FormatInfo {
  format_id: string;
  ext: string;
  resolution?: string;
  vcodec?: string;
  acodec?: string;
  filesize?: number;
}

export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  uploader: string;
  duration: number; // in seconds
  thumbnailUrl: string;
  availableFormats: FormatInfo[];
  webpageUrl: string;
  retrievedAt: Date;
}

export type DownloadStatus = 'Pending' | 'InProgress' | 'Completed' | 'Failed' | 'Paused';

export interface DownloadItem {
  id: string;
  videoId: string;
  title: string;
  thumbnailUrl: string;
  status: DownloadStatus;
  progress: number; // 0-100
  fileSize: number; // in bytes
  downloadedSize: number; // in bytes
  startedAt: Date;
  completedAt: Date | null;
  speed: string; // e.g., "1.2 MB/s"
  eta: string; // e.g., "2m 15s"
  errorMessage?: string;
}

export interface AppSettings {
  defaultDownloadPath: string;
  theme: 'light' | 'dark' | 'system';
  maxConcurrentDownloads: number;
  showNotifications: boolean;
  ytDlpPath: string;
}
