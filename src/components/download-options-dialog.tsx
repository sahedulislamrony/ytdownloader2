"use client";

import { Music, Video } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { type VideoInfo, type FormatInfo } from '@/lib/types';
import { useDownloadQueue } from '@/context/download-queue-context';
import { useToast } from '@/hooks/use-toast';

interface DownloadOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  videoInfo: VideoInfo;
}

export default function DownloadOptionsDialog({
  isOpen,
  onClose,
  videoInfo,
}: DownloadOptionsDialogProps) {
  const { addDownload } = useDownloadQueue();
  const { toast } = useToast();

  const handleDownload = (format: FormatInfo) => {
    addDownload({
      id: crypto.randomUUID(),
      videoInfo,
      format,
    });
    toast({
      title: 'Download Queued',
      description: `${videoInfo.title} has been added to the download queue.`,
    });
    onClose();
  };

  const videoFormats = videoInfo.availableFormats.filter(f => f.vcodec !== 'none');
  const audioFormats = videoInfo.availableFormats.filter(f => f.acodec !== 'none' && f.vcodec === 'none');

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const FormatItem = ({ format }: { format: FormatInfo }) => {
    return (
      <Card
        className="mb-2 cursor-pointer transition-all hover:shadow-md hover:border-primary"
        onClick={() => handleDownload(format)}
      >
        <CardContent className="p-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">
                {format.resolution || 'Audio'} - {format.ext.toUpperCase()}
              </p>
              <p className="text-sm text-muted-foreground">
                {format.vcodec !== 'none' && `Video: ${format.vcodec}`}
                {format.vcodec !== 'none' && format.acodec !== 'none' && ', '}
                {format.acodec !== 'none' && `Audio: ${format.acodec}`}
                {format.filesize ? ` - ${formatBytes(format.filesize)}` : ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Download Options for "{videoInfo.title}"</DialogTitle>
          <DialogDescription>
            Select a format to begin the download.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="video" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="video"><Video className="mr-2 h-4 w-4" />Video</TabsTrigger>
            <TabsTrigger value="audio"><Music className="mr-2 h-4 w-4" />Audio Only</TabsTrigger>
          </TabsList>
          <TabsContent value="video">
            <ScrollArea className="h-72 mt-2">
              {videoFormats.map((format) => (
                <FormatItem key={format.format_id} format={format} />
              ))}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="audio">
            <ScrollArea className="h-72 mt-2">
              {audioFormats.map((format) => (
                <FormatItem key={format.format_id} format={format} />
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
