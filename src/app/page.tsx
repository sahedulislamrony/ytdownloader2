"use client";

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Clipboard, Download, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { type VideoInfo, type AppSettings } from '@/lib/types';
import { suggestBestDownloadOption } from '@/ai/flows/suggest-best-download-option';
import VideoPreview from '@/components/video-preview';
import DownloadOptionsDialog from '@/components/download-options-dialog';
import { fetchVideoInfo } from '@/app/actions';
import useLocalStorage from '@/hooks/use-local-storage';

const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
  type: z.enum(['video', 'playlist', 'channel'], {
    required_error: 'You need to select a type.',
  }),
});

const defaultSettings: AppSettings = {
  theme: 'dark',
  defaultDownloadPath: '/home/user/downloads',
  maxConcurrentDownloads: 3,
  showNotifications: true,
  ytDlpPath: '',
}

export default function Home() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [suggestedFormat, setSuggestedFormat] = useState<string | null>(null);
  const [suggestionReason, setSuggestionReason] = useState<string | null>(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [settings] = useLocalStorage<AppSettings>('app-settings', defaultSettings);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
      type: 'video',
    },
  });

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      form.setValue('url', text, { shouldValidate: true });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Paste Failed',
        description: 'Could not read from clipboard. Please paste manually.',
      });
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setVideoInfo(null);
    setSuggestedFormat(null);
    setSuggestionReason(null);

    try {
      const info = await fetchVideoInfo(values.url, settings.ytDlpPath);
      setVideoInfo(info);
      
      if (info.availableFormats && info.availableFormats.length > 0) {
        const formatsString = info.availableFormats
          .map(f => {
            const parts = [`ID: ${f.format_id}`];
            if (f.resolution) parts.push(`Res: ${f.resolution}`);
            else parts.push('Audio Only');
            if (f.ext) parts.push(`Ext: ${f.ext}`);
            if (f.filesize) parts.push(`Size: ${(f.filesize / 1024 / 1024).toFixed(2)}MB`);
            const codecs = [f.vcodec, f.acodec].filter(c => c && c !== 'none').join(', ');
            if (codecs) parts.push(`Codecs: ${codecs}`);
            return parts.join('; ');
          })
          .join('\n');

        try {
          const suggestion = await suggestBestDownloadOption({
            formats: formatsString,
            videoTitle: info.title,
          });

          setSuggestedFormat(suggestion.suggestedFormat);
          setSuggestionReason(suggestion.reason);
        } catch (aiError) {
            console.warn("AI suggestion failed:", aiError);
            // This is not a critical error, so we don't show a toast to the user.
        }
      }
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Fetching Video',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-headline">YouTube URL</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="Paste YouTube URL here..."
                          {...field}
                          className="text-base"
                        />
                      </FormControl>
                      <Button type="button" variant="outline" size="icon" onClick={handlePaste} aria-label="Paste URL">
                        <Clipboard className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Content Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="video" />
                          </FormControl>
                          <FormLabel className="font-normal">Single Video</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="playlist" disabled />
                          </FormControl>
                          <FormLabel className="font-normal opacity-50">Playlist (soon)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="channel" disabled />
                          </FormControl>
                          <FormLabel className="font-normal opacity-50">Channel (soon)</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching Info...
                  </>
                ) : (
                  'Fetch Video Info'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <AnimatePresence>
        {videoInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mt-8"
          >
            <VideoPreview videoInfo={videoInfo}>
              <Button onClick={() => setIsOptionsOpen(true)} size="lg" className="mt-4">
                <Download className="mr-2 h-5 w-5" />
                Download
              </Button>
            </VideoPreview>
          </motion.div>
        )}
      </AnimatePresence>
      
      {videoInfo && (
        <DownloadOptionsDialog
          isOpen={isOptionsOpen}
          onClose={() => setIsOptionsOpen(false)}
          videoInfo={videoInfo}
          suggestedFormat={suggestedFormat}
          suggestionReason={suggestionReason}
        />
      )}
    </div>
  );
}
