# **App Name**: Avalonia Download Studio

## Core Features:

- URL Parsing & Video Info: Parses a YouTube URL to display video information such as title, channel, duration, and available formats using yt-dlp. It supports single videos, playlists, and channels.
- Download Options & Format Selection: Presents multiple download options after clicking the download button, pre-selecting the best option automatically. Provides format selection for both video and audio-only downloads (powered by FFmpeg).
- Download Queue Management: Manages a download queue with options to start, pause, resume, and cancel downloads. Limits concurrent downloads based on user settings.
- Real-Time Progress Tracking: Tracks download progress in real-time, displaying a progress bar, download speed, and estimated time remaining.  Provides status updates for pending, in-progress, completed, and failed downloads.
- Data Storage & Settings: Stores download history and settings in an SQLite database. Settings include the default download path, preferred video quality, theme preferences (light, dark, system), and yt-dlp/FFmpeg paths.
- Intelligent Suggestion Tool: Suggests the 'best' download option. It will incorporate knowledge of optimal resolutions, codecs, and file sizes when acting as a download tool.
- Notifications: Displays desktop notifications for download completion, errors, and other relevant events. Sound notifications are also configurable.

## Style Guidelines:

- Primary color: Blue (#2563eb), conveys a modern and trustworthy feel for the application.
- Background color: Light gray (#f8fafc) for the light theme; dark gray (#0f172a) for the dark theme. These provide a clean, unobtrusive backdrop.
- Accent color: A slightly lighter blue (#3b82f6) for highlighting interactive elements, providing a clear visual distinction.
- Headline font: 'Space Grotesk' (sans-serif), lends a modern, tech-focused appearance to titles and headings.
- Body font: 'Inter' (sans-serif), a modern font to provide clear and readable descriptions, UI labels, and list views.
- Use simple, consistent icons for navigation and actions. Menu item icons will follow the operating system design and will adapt based on light/dark mode setting. Use meaningful colors only for status indication. Don't use trendy, decorative icons.
- A sidebar for main navigation, a header for window controls, and a dynamic main content area will enable an adaptive layout for various screen sizes. Content is designed with a focus on responsive design.