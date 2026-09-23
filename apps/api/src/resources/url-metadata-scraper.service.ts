import { Injectable, Logger } from '@nestjs/common';
import * as net from 'net';
import { UrlDetectorService } from './url-detector.service';
import { UrlMetadataResponse } from '@ascendiaos/shared';

@Injectable()
export class UrlMetadataScraperService {
  private readonly logger = new Logger(UrlMetadataScraperService.name);

  constructor(private readonly urlDetector: UrlDetectorService) {}

  async scrape(urlStr: string): Promise<UrlMetadataResponse> {
    const detected = this.urlDetector.detect(urlStr);

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(urlStr);
    } catch {
      return {
        url: urlStr,
        type: detected.type,
        title: urlStr,
        description: null,
        thumbnailUrl: detected.thumbnailUrl || null,
        provider: detected.provider,
        externalId: detected.externalId || null,
        domain: detected.domain || null,
        metadata: {},
      };
    }

    // SSRF Validation
    if (!this.isSafeUrl(parsedUrl)) {
      this.logger.warn(`Blocked unsafe URL metadata fetch (SSRF check): ${urlStr}`);
      return {
        url: urlStr,
        type: detected.type,
        title: this.formatFallbackTitle(parsedUrl, detected.provider),
        description: null,
        thumbnailUrl: detected.thumbnailUrl || null,
        provider: detected.provider,
        externalId: detected.externalId || null,
        domain: detected.domain,
        metadata: { ssrfBlocked: true },
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(parsedUrl.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AscendiaOS/1.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          url: urlStr,
          type: detected.type,
          title: this.formatFallbackTitle(parsedUrl, detected.provider),
          description: null,
          thumbnailUrl: detected.thumbnailUrl || null,
          provider: detected.provider,
          externalId: detected.externalId || null,
          domain: detected.domain,
          metadata: { httpStatus: response.status },
        };
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        return {
          url: urlStr,
          type: detected.type,
          title: this.formatFallbackTitle(parsedUrl, detected.provider),
          description: null,
          thumbnailUrl: detected.thumbnailUrl || null,
          provider: detected.provider,
          externalId: detected.externalId || null,
          domain: detected.domain,
          metadata: { contentType },
        };
      }

      const htmlText = await response.text();
      const extracted = this.extractHtmlMetadata(htmlText);

      return {
        url: urlStr,
        type: detected.type,
        title: extracted.title || detected.provider + ' Link',
        description: extracted.description || null,
        thumbnailUrl: detected.thumbnailUrl || extracted.ogImage || null,
        provider: extracted.siteName || detected.provider,
        externalId: detected.externalId || null,
        domain: detected.domain,
        metadata: {
          extractedTitle: extracted.title,
          extractedDescription: extracted.description,
          ogImage: extracted.ogImage,
          siteName: extracted.siteName,
        },
      };
    } catch (err: any) {
      this.logger.debug(`Metadata extraction failed gracefully for ${urlStr}: ${err?.message}`);
      return {
        url: urlStr,
        type: detected.type,
        title: this.formatFallbackTitle(parsedUrl, detected.provider),
        description: null,
        thumbnailUrl: detected.thumbnailUrl || null,
        provider: detected.provider,
        externalId: detected.externalId || null,
        domain: detected.domain,
        metadata: { error: err?.message || 'Failed to fetch metadata' },
      };
    }
  }

  private isSafeUrl(parsedUrl: URL): boolean {
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return false;
    }

    const host = parsedUrl.hostname.toLowerCase();

    if (host === 'localhost' || host === '0.0.0.0' || host === '::1') {
      return false;
    }

    if (net.isIP(host)) {
      if (
        host.startsWith('127.') ||
        host.startsWith('10.') ||
        host.startsWith('169.254.') ||
        host.startsWith('192.168.')
      ) {
        return false;
      }
      if (host.startsWith('172.')) {
        const parts = host.split('.');
        const secondOctet = parseInt(parts[1], 10);
        if (secondOctet >= 16 && secondOctet <= 31) {
          return false;
        }
      }
    }

    if (host.endsWith('.local') || host.endsWith('.internal')) {
      return false;
    }

    return true;
  }

  private formatFallbackTitle(parsedUrl: URL, provider: string): string {
    const pathname = parsedUrl.pathname;
    if (pathname && pathname !== '/') {
      const lastPart = pathname.split('/').filter(Boolean).pop();
      if (lastPart) {
        return decodeURIComponent(lastPart).replace(/[-_]/g, ' ');
      }
    }
    return `${provider} Resource`;
  }

  private extractHtmlMetadata(html: string): {
    title?: string;
    description?: string;
    ogImage?: string;
    siteName?: string;
  } {
    const result: {
      title?: string;
      description?: string;
      ogImage?: string;
      siteName?: string;
    } = {};

    // og:title
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
    if (ogTitleMatch && ogTitleMatch[1]) {
      result.title = this.cleanString(ogTitleMatch[1]);
    }

    // fallback <title>
    if (!result.title) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        result.title = this.cleanString(titleMatch[1]);
      }
    }

    // og:description
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
    if (ogDescMatch && ogDescMatch[1]) {
      result.description = this.cleanString(ogDescMatch[1]);
    }

    // fallback meta description
    if (!result.description) {
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
      if (descMatch && descMatch[1]) {
        result.description = this.cleanString(descMatch[1]);
      }
    }

    // og:image
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (ogImageMatch && ogImageMatch[1]) {
      result.ogImage = ogImageMatch[1];
    }

    // og:site_name
    const siteNameMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:site_name["']/i);
    if (siteNameMatch && siteNameMatch[1]) {
      result.siteName = this.cleanString(siteNameMatch[1]);
    }

    return result;
  }

  private cleanString(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }
}
