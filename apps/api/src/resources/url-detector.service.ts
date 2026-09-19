import { Injectable } from '@nestjs/common';
import { ResourceType } from '@studyos/shared';

export interface DetectedUrlInfo {
  type: ResourceType;
  provider: string;
  externalId?: string;
  thumbnailUrl?: string;
  domain: string;
}

@Injectable()
export class UrlDetectorService {
  detect(urlStr: string): DetectedUrlInfo {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(urlStr);
    } catch {
      return {
        type: ResourceType.BOOKMARK,
        provider: 'Web',
        domain: '',
      };
    }

    const host = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = parsedUrl.pathname;
    const searchParams = parsedUrl.searchParams;

    // YouTube Playlist
    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      const listId = searchParams.get('list');
      if (listId && (pathname.includes('/playlist') || searchParams.has('v'))) {
        return {
          type: ResourceType.YOUTUBE_PLAYLIST,
          provider: 'YouTube',
          externalId: listId,
          domain: host,
        };
      }

      // YouTube Video
      let videoId: string | null = null;
      if (host.includes('youtu.be')) {
        videoId = pathname.substring(1).split('/')[0];
      } else if (pathname.includes('/watch')) {
        videoId = searchParams.get('v');
      } else if (pathname.includes('/embed/')) {
        videoId = pathname.split('/embed/')[1]?.split('/')[0];
      } else if (pathname.includes('/shorts/')) {
        videoId = pathname.split('/shorts/')[1]?.split('/')[0];
      }

      if (videoId) {
        return {
          type: ResourceType.YOUTUBE_VIDEO,
          provider: 'YouTube',
          externalId: videoId,
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          domain: host,
        };
      }

      return {
        type: ResourceType.YOUTUBE_VIDEO,
        provider: 'YouTube',
        domain: host,
      };
    }

    // Provider identification based on domain
    let provider = 'Website';
    if (host.includes('github.com')) provider = 'GitHub';
    else if (host.includes('medium.com')) provider = 'Medium';
    else if (host.includes('dev.to')) provider = 'DEV Community';
    else if (host.includes('wikipedia.org')) provider = 'Wikipedia';
    else if (host.includes('stackoverflow.com')) provider = 'Stack Overflow';
    else if (host.includes('arxiv.org')) provider = 'arXiv';
    else if (host.includes('notion.site') || host.includes('notion.so')) provider = 'Notion';
    else {
      // Capitalize first letter of main domain part
      const parts = host.split('.');
      if (parts.length >= 2) {
        const namePart = parts[parts.length - 2];
        provider = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      }
    }

    return {
      type: ResourceType.WEBSITE,
      provider,
      domain: host,
    };
  }
}
