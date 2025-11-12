import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ExternalLink, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  link?: string;
}

const PrintfulSetupChecklist: React.FC = () => {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: 'migration',
      title: 'Run Database Migration',
      description: 'Apply the Printful catalog migration in your Supabase dashboard',
      completed: false,
    },
    {
      id: 'api-key',
      title: 'Add Printful API Key',
      description: 'Add VITE_PRINTFUL_API_KEY to your .env file',
      completed: false,
      link: 'https://www.printful.com/dashboard/settings?panel=api',
    },
    {
      id: 'netlify',
      title: 'Run with Netlify Dev',
      description: 'Use "npm run dev:netlify" instead of "npm run dev"',
      completed: false,
    },
    {
      id: 'sync',
      title: 'Sync Printful Catalog',
      description: 'Click "Sync from Printful" to load available products',
      completed: false,
    },
    {
      id: 'photos',
      title: 'Upload Your Photos',
      description: 'Upload your photography to the Media Library',
      completed: false,
    },
    {
      id: 'mapping',
      title: 'Map Photos to Products',
      description: 'Create your first product in the "Map to Printful" tab',
      completed: false,
    },
  ]);

  const [showChecklist, setShowChecklist] = useState(true);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    const updatedItems = [...items];

    try {
      const { data: catalogData, error: catalogError } = await supabase
        .from('printful_catalog')
        .select('id')
        .limit(1);

      if (!catalogError && catalogData) {
        updatedItems[0].completed = true;

        if (catalogData.length > 0) {
          updatedItems[3].completed = true;
        }
      }
    } catch (error) {
      updatedItems[0].completed = false;
    }

    const hasApiKey = import.meta.env.VITE_PRINTFUL_API_KEY &&
                      import.meta.env.VITE_PRINTFUL_API_KEY !== 'your_printful_api_key_here';
    updatedItems[1].completed = hasApiKey;

    try {
      const { data: mediaData, error: mediaError } = await supabase
        .from('media_items')
        .select('id')
        .eq('media_type', 'image')
        .limit(1);

      if (!mediaError && mediaData && mediaData.length > 0) {
        updatedItems[4].completed = true;
      }
    } catch (error) {
      updatedItems[4].completed = false;
    }

    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('fulfillment_method', 'printful')
        .limit(1);

      if (!productsError && productsData && productsData.length > 0) {
        updatedItems[5].completed = true;
      }
    } catch (error) {
      updatedItems[5].completed = false;
    }

    setItems(updatedItems);
  };

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progress = (completedCount / totalCount) * 100;
  const allComplete = completedCount === totalCount;

  if (!showChecklist && allComplete) {
    return null;
  }

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {allComplete ? (
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          ) : (
            <AlertCircle className="w-6 h-6 text-yellow-400" />
          )}
          <div>
            <h3 className="text-white font-semibold">Printful Setup Progress</h3>
            <p className="text-white/60 text-sm">
              {completedCount} of {totalCount} steps complete
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowChecklist(!showChecklist)}
          className="text-white/60 hover:text-white text-sm"
        >
          {showChecklist ? 'Hide' : 'Show'}
        </button>
      </div>

      <div className="mb-4">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-green-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {showChecklist && (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                item.completed
                  ? 'bg-green-500/10 border border-green-500/30'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <div className="mt-0.5">
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <Circle className="w-5 h-5 text-white/40" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className={`font-semibold text-sm ${
                    item.completed ? 'text-green-400' : 'text-white'
                  }`}>
                    {index + 1}. {item.title}
                  </h4>
                  {item.link && !item.completed && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-400 hover:text-yellow-300"
                      title="Open external link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-white/60 text-xs mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {allComplete && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-green-400 text-sm text-center font-semibold">
            Setup complete! You're ready to sell prints.
          </p>
        </div>
      )}
    </div>
  );
};

export default PrintfulSetupChecklist;
