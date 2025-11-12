import { useState, useEffect } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import type { BGConfig, PageBGRule } from '../../lib/backgrounds';
import { supabase, getMediaFolders } from '../../lib/supabase';
import { refresh as refreshBGConfig } from '../../lib/backgrounds';

export function PageBackgroundsManager() {
  const [config, setConfig] = useState<BGConfig | null>(null);
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
    loadFolders();
  }, []);

  async function loadConfig() {
    try {
      const bgConfig = await refreshBGConfig();
      setConfig(bgConfig);
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadFolders() {
    try {
      const folderData = await getMediaFolders();
      const folderNames = folderData.map(f => f.slug);
      setFolders(['media', ...folderNames]);
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  }

  async function saveConfig() {
    if (!config) return;
    setSaving(true);
    try {
      for (const [pageKey, rule] of Object.entries(config.pages)) {
        const zoneKey = `zone_${pageKey}`;
        await supabase
          .from('site_zones')
          .upsert({
            key: zoneKey,
            config_json: rule,
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
      }

      await supabase
        .from('site_zones')
        .upsert({
          key: 'zone_global',
          config_json: config.fallback,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      alert('Configuration saved successfully!');
      await loadConfig();
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  }

  function updatePage(key: string, rule: Partial<PageBGRule>) {
    if (!config) return;
    setConfig({
      ...config,
      pages: {
        ...config.pages,
        [key]: { ...config.pages[key], ...rule } as PageBGRule,
      },
    });
  }

  function addPage() {
    const key = prompt('Enter page key (e.g., "about", "contact"):');
    if (!key || !config) return;
    setConfig({
      ...config,
      pages: {
        ...config.pages,
        [key]: { mode: 'random', images: [], folders: ['media'] },
      },
    });
  }

  function removePage(key: string) {
    if (!config || !confirm(`Remove page "${key}"?`)) return;
    const newPages = { ...config.pages };
    delete newPages[key];
    setConfig({ ...config, pages: newPages });
  }

  if (loading) return <div className="p-4">Loading...</div>;
  if (!config) return <div className="p-4">Failed to load configuration</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Page Backgrounds</h2>
        <div className="flex gap-2">
          <button
            onClick={addPage}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Page
          </button>
          <button
            onClick={saveConfig}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(config.pages).map(([key, rule]) => (
          <div key={key} className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-white">{key}</h3>
              <button
                onClick={() => removePage(key)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Mode</label>
                <select
                  value={rule.mode}
                  onChange={(e) => updatePage(key, { mode: e.target.value as 'specific' | 'random' })}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                >
                  <option value="specific">Specific Images</option>
                  <option value="random">Random from Folders</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Folders</label>
                <select
                  multiple
                  value={rule.folders}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                    updatePage(key, { folders: selected });
                  }}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                  size={3}
                >
                  {folders.map(folder => (
                    <option key={folder} value={folder}>{folder}</option>
                  ))}
                </select>
              </div>

              {key === 'home' && (
                <>
                  <div>
                    <label className="flex items-center text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={rule.slideshow || false}
                        onChange={(e) => updatePage(key, { slideshow: e.target.checked })}
                        className="mr-2"
                      />
                      Enable Slideshow
                    </label>
                  </div>

                  {rule.slideshow && (
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Interval (ms)</label>
                      <input
                        type="number"
                        value={rule.intervalMs || 6000}
                        onChange={(e) => updatePage(key, { intervalMs: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
