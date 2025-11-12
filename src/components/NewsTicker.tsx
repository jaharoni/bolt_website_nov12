import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
}

const RSS_FEED_URL = import.meta.env.VITE_NEWS_RSS_URL;
const ENABLE_REMOTE_NEWS = Boolean(RSS_FEED_URL);

const FALLBACK_NEWS: NewsItem[] = [
  "Local Man Still Hasn't Figured Out What He Wants To Do With His Life",
  "Area Woman Discovers She's Been Pronouncing 'Quinoa' Wrong This Whole Time",
  "Breaking: Scientists Confirm Coffee Still Good",
  "Nation's Cats Reportedly 'Fine' With Current Political Climate",
  "Local Dad's Joke About Weather Somehow Still Not Funny After 47th Telling",
  "Area Millennial Finally Admits They Don't Know How To Change A Tire",
  "Breaking: Man Who Says He 'Doesn't Watch TV' Owns Television",
  "Local Woman's Plant Somehow Still Alive Despite Best Efforts",
  "Nation's Dogs Confused By Humans' Obsession With Throwing Away Perfectly Good Balls",
  "Area Man's Spotify Wrapped Reveals Embarrassing Truth About His Music Taste"
].map((title, index) => ({
  title,
  link: 'https://theonion.com',
  pubDate: new Date(Date.now() - index * 3600000).toISOString()
}));

const NewsTicker: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>(FALLBACK_NEWS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(ENABLE_REMOTE_NEWS);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ENABLE_REMOTE_NEWS || !RSS_FEED_URL) {
      setLoading(false);
      return;
    }

    const fetchNews = async () => {
      try {
        const response = await fetch(RSS_FEED_URL, { cache: "no-cache" });
        if (!response.ok) {
          throw new Error(`Failed to fetch news (${response.status})`);
        }

        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        const items = xmlDoc.querySelectorAll('item');
        const newsItems: NewsItem[] = Array.from(items).slice(0, 10).map(item => ({
          title: item.querySelector('title')?.textContent || 'No title',
          link: item.querySelector('link')?.textContent || '#',
          pubDate: item.querySelector('pubDate')?.textContent || ''
        }));

        if (newsItems.length > 0) {
          setNews(newsItems);
          setError(null);
        } else {
          setNews(FALLBACK_NEWS);
        }
      } catch (err) {
        console.warn('[NewsTicker] Failed to fetch remote news feed:', err);
        setNews(FALLBACK_NEWS);
        setError('News unavailable');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (news.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % news.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [news.length]);

  if (loading) {
    return (
      <div className="text-white/50 text-sm font-mono flex items-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span>Loading news...</span>
      </div>
    );
  }

  const currentNews = news[currentIndex];
  const label = ENABLE_REMOTE_NEWS ? 'Latest Headlines' : 'Highlights';

  return (
    <div className="text-white/70 text-sm font-mono text-center w-64">
      <div className="space-y-1">
        <div className="text-xs text-white/50 font-medium tracking-wider uppercase">
          {label}
        </div>

        <div className="relative h-8 overflow-hidden">
          <a
            href={currentNews.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:text-yellow-300 transition-colors duration-300 group"
          >
            <div
              key={currentIndex}
              className="absolute inset-0 flex items-center justify-center text-xs leading-tight px-2 group-hover:underline animate-news-flip gap-1"
            >
              <span className="text-center line-clamp-2 overflow-hidden text-ellipsis">
                {currentNews.title.length > 80 ? `${currentNews.title.substring(0, 80)}...` : currentNews.title}
              </span>
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
            </div>
          </a>
        </div>
      </div>
      {error && (
        <div className="mt-1 text-[10px] text-amber-400">
          {error}
        </div>
      )}
    </div>
  );
};

export default NewsTicker;