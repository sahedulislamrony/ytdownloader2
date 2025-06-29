import Image from 'next/image';
import { type ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { type VideoInfo } from '@/lib/types';

interface VideoPreviewProps {
  videoInfo: VideoInfo;
  children?: ReactNode;
}

export default function VideoPreview({ videoInfo, children }: VideoPreviewProps) {
  const formatDuration = (seconds: number) => {
    return new Date(seconds * 1000).toISOString().substr(11, 8);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 flex flex-col md:flex-row gap-6">
        <div className="relative w-full md:w-64 h-40 flex-shrink-0">
          <Image
            src={videoInfo.thumbnailUrl}
            alt={`Thumbnail for ${videoInfo.title}`}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
            data-ai-hint="video thumbnail"
          />
        </div>
        <div className="flex-grow">
          <h2 className="text-2xl font-bold font-headline mb-2">{videoInfo.title}</h2>
          <p className="text-muted-foreground mb-1">by <span className="font-semibold text-foreground">{videoInfo.uploader}</span></p>
          <p className="text-muted-foreground">Duration: {formatDuration(videoInfo.duration)}</p>
          <p className="text-sm text-muted-foreground mt-4 line-clamp-3">{videoInfo.description}</p>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
