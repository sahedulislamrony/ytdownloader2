'use server';

import { execFile } from 'child_process';
import { promisify } from 'util';
import { z } from 'zod';
import type { VideoInfo } from '@/lib/types';

const execFileAsync = promisify(execFile);

const YTDLP_PATH = process.env.YTDLP_PATH || 'yt-dlp';

// This schema is a subset of the yt-dlp JSON output
const YtDlpFormatSchema = z.object({
    format_id: z.string(),
    ext: z.string(),
    resolution: z.string(), // can be e.g. "1920x1080" or "audio only"
    vcodec: z.string(), // can be "none"
    acodec: z.string(), // can be "none"
    filesize: z.number().nullable().optional(),
});

const YtDlpVideoInfoSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    uploader: z.string(),
    duration: z.number(),
    thumbnail: z.string(),
    webpage_url: z.string(),
    formats: z.array(YtDlpFormatSchema)
});

export async function fetchVideoInfo(url: string): Promise<VideoInfo> {
    try {
        const { stdout } = await execFileAsync(YTDLP_PATH, [
            '--dump-json',
            '--no-warnings',
            url
        ]);
        const data = JSON.parse(stdout);
        const parsedData = YtDlpVideoInfoSchema.parse(data);

        const videoInfo: VideoInfo = {
            id: parsedData.id,
            title: parsedData.title,
            description: parsedData.description,
            uploader: parsedData.uploader,
            duration: parsedData.duration,
            thumbnailUrl: parsedData.thumbnail,
            webpageUrl: parsedData.webpage_url,
            retrievedAt: new Date(),
            availableFormats: parsedData.formats.map(f => ({
                format_id: f.format_id,
                ext: f.ext,
                resolution: f.resolution === 'audio only' ? undefined : f.resolution,
                vcodec: f.vcodec,
                acodec: f.acodec,
                filesize: f.filesize ?? undefined,
            }))
        };
        return videoInfo;
    } catch (error: any) {
        console.error('Error fetching video info with yt-dlp:', error);
        if (error.code === 'ENOENT') {
            throw new Error('yt-dlp not found. Please ensure it is installed and in your system PATH.');
        }
        throw new Error('Failed to fetch video information. The URL might be invalid, or the video is private or region-locked.');
    }
}
