"use client"

import Image from "next/image"
import { Pause, Play, X, RefreshCw } from "lucide-react"

import { type DownloadItem as DownloadItemType } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useDownloadQueue } from "@/context/download-queue-context"

interface DownloadItemProps {
  item: DownloadItemType
}

const statusColors: { [key: string]: string } = {
  InProgress: "bg-blue-500",
  Paused: "bg-yellow-500",
  Completed: "bg-green-500",
  Failed: "bg-red-500",
  Pending: "bg-gray-500",
}

export default function DownloadItem({ item }: DownloadItemProps) {
  const { updateDownloadStatus, removeDownload } = useDownloadQueue()

  const handlePause = () => {
    updateDownloadStatus(item.id, 'Paused');
  };

  const handleResume = () => {
    updateDownloadStatus(item.id, 'InProgress');
  };

  const handleCancel = () => {
    removeDownload(item.id);
  };

  const handleRetry = () => {
    // This would reset progress and set status to Pending/InProgress
    console.log("Retrying download:", item.id);
    updateDownloadStatus(item.id, 'InProgress');
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-4 flex flex-col md:flex-row gap-4">
        <div className="relative h-24 w-full md:w-40 md:h-24 flex-shrink-0">
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            layout="fill"
            objectFit="cover"
            className="rounded-md"
            data-ai-hint="video thumbnail"
          />
        </div>
        <div className="flex-grow space-y-2">
          <h3 className="font-semibold line-clamp-2">{item.title}</h3>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={statusColors[item.status]}>{item.status}</Badge>
            <p className="text-sm text-muted-foreground">{formatBytes(item.downloadedSize)} / {formatBytes(item.fileSize)}</p>
          </div>

          {(item.status === 'InProgress' || item.status === 'Paused') && (
            <div className="space-y-1">
              <Progress value={item.progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{item.progress.toFixed(0)}%</span>
                {item.status === 'InProgress' && <span>{item.speed} MB/s - ETA: {item.eta}</span>}
              </div>
            </div>
          )}

          {item.status === 'Failed' && (
            <p className="text-sm text-destructive">{item.errorMessage}</p>
          )}

        </div>
        <div className="flex flex-row md:flex-col items-center justify-end md:justify-center gap-2">
          {item.status === 'InProgress' && (
            <Button variant="ghost" size="icon" onClick={handlePause} aria-label="Pause">
              <Pause className="h-4 w-4" />
            </Button>
          )}
          {item.status === 'Paused' && (
            <Button variant="ghost" size="icon" onClick={handleResume} aria-label="Resume">
              <Play className="h-4 w-4" />
            </Button>
          )}
          {(item.status === 'InProgress' || item.status === 'Paused' || item.status === 'Pending') && (
            <Button variant="ghost" size="icon" onClick={handleCancel} aria-label="Cancel">
              <X className="h-4 w-4" />
            </Button>
          )}
          {item.status === 'Failed' && (
            <Button variant="ghost" size="icon" onClick={handleRetry} aria-label="Retry">
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
