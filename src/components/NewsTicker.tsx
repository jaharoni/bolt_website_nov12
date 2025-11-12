import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
}

const NewsTicker: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Using a CORS proxy to fetch The Onion RSS feed
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const rssUrl = 'https://www.theonion.com/rss';
        
        const response = await fetch(proxyUrl + encodeURIComponent(rssUrl));
        
        if (!response.ok) {
          throw new Error('Failed to fetch news');
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

        setNews(newsItems);
        setLoading(false);
      } catch (err) {
        // Fallback to mock Onion-style headlines if RSS fails
        const mockHeadlines = [
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
        ];

        const mockNews = mockHeadlines.map((title, index) => ({
          title,
          link: 'https://theonion.com',
          pubDate: new Date(Date.now() - index * 3600000).toISOString()
        }));

        setNews(mockNews);
        setLoading(false);
      }
    };

    fetchNews();
    
    // Refresh news every 30 minutes
    const interval = setInterval(fetchNews, 1800000);
    return () => clearInterval(interval);
  }, []);

  // Cycle through headlines every 8 seconds
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

  if (error || news.length === 0) {
    return (
      <div className="text-white/50 text-sm font-mono">
        <div>News unavailable</div>
      </div>
    );
  }

  const currentNews = news[currentIndex];

  return (
    <div className="text-white/70 text-sm font-mono text-center w-64">
      <div className="space-y-1">
        <div className="text-xs text-white/50 font-medium tracking-wider uppercase">
          THE ONION
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
              className="absolute inset-0 flex items-center justify-center text-xs leading-tight px-2 group-hover:underline animate-news-flip"
            >
              <span className="text-center line-clamp-2 overflow-hidden text-ellipsis">
                {currentNews.title.length > 80 ? currentNews.title.substring(0, 80) + '...' : currentNews.title}
              </span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;