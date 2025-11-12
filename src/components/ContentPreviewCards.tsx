import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Image, FileText, ShoppingBag } from 'lucide-react';

interface ContentPreview {
  type: 'media' | 'essay' | 'product' | 'gallery';
  id: string;
  title: string;
  thumbnail?: string;
  url: string;
}

interface ContentPreviewCardsProps {
  items: ContentPreview[];
}

const ContentPreviewCards: React.FC<ContentPreviewCardsProps> = ({ items }) => {
  const navigate = useNavigate();

  if (items.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'media':
        return <Image className="w-4 h-4" />;
      case 'essay':
        return <FileText className="w-4 h-4" />;
      case 'product':
        return <ShoppingBag className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex gap-2 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => navigate(item.url)}
          className="flex-shrink-0 glass-card p-3 rounded-xl hover:scale-105 transition-all duration-200 min-w-[160px] max-w-[160px] group"
        >
          {item.thumbnail ? (
            <div className="w-full h-20 mb-2 rounded-lg overflow-hidden bg-black/20">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="w-full h-20 mb-2 rounded-lg bg-white/5 flex items-center justify-center">
              {getIcon(item.type)}
            </div>
          )}
          <p className="text-white text-xs font-medium line-clamp-2 text-left">
            {item.title}
          </p>
        </button>
      ))}
    </div>
  );
};

export default ContentPreviewCards;
