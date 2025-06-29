import { type VideoInfo, type FormatInfo } from './types';

function generateRandomFormats(): FormatInfo[] {
  const resolutions = ['144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '2160p'];
  const videoCodecs = ['avc1', 'vp9', 'av01'];
  const audioCodecs = ['mp4a', 'opus'];

  const formats: FormatInfo[] = [];

  // Video formats
  resolutions.forEach((res, i) => {
    const vcodec = videoCodecs[Math.floor(Math.random() * videoCodecs.length)];
    const acodec = audioCodecs[Math.floor(Math.random() * audioCodecs.length)];
    formats.push({
      format_id: `v-${i}`,
      ext: 'mp4',
      resolution: res,
      vcodec: vcodec,
      acodec: acodec,
      filesize: Math.floor(Math.random() * (i + 1) * 50 * 1024 * 1024) + (10 * 1024 * 1024),
    });
  });

  // Audio only formats
  audioCodecs.forEach((acodec, i) => {
    formats.push({
      format_id: `a-${i}`,
      ext: acodec === 'opus' ? 'webm' : 'm4a',
      resolution: undefined,
      vcodec: 'none',
      acodec: acodec,
      filesize: Math.floor(Math.random() * 5 * 1024 * 1024) + (2 * 1024 * 1024),
    });
  });

  return formats;
}

export function mockFetchVideoInfo(url: string): Promise<VideoInfo> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const videoInfo: VideoInfo = {
        id: 'dQw4w9WgXcQ',
        title: 'Epic Nature Documentary - The Wonders of the Wild',
        description: 'A breathtaking journey through the most stunning landscapes on Earth. From the highest mountains to the deepest oceans, witness nature in its purest form. This is a sample description for a video fetched for the Avalonia Download Studio.',
        uploader: 'Nature Explorers',
        duration: 243,
        thumbnailUrl: 'https://placehold.co/640x360.png',
        webpageUrl: url,
        retrievedAt: new Date(),
        availableFormats: generateRandomFormats(),
      };
      resolve(videoInfo);
    }, 1500); // Simulate network delay
  });
}
