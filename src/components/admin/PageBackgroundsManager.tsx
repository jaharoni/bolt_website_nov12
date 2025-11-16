import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, RefreshCw } from 'lucide-react';
import { supabase, getMediaFolders } from '../../lib/supabase';

interface MediaFolder {
  id: string;
  name: string;
  slug: string;
}

interface SiteZone {
  key: string;
  carousel_enabled: boolean;
  carousel_interval_ms: number;
  randomization_enabled: boolean;
  config_json: {
    folders?: string[];
  };
}

export function PageBackgroundsManager() {
  const [zones, setZones] = useState<SiteZone[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      await Promise.all([loadZones(), loadFolders()]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadZones() {
    const { data, error } = await supabase
      .from('site_zones')
      .select('key, carousel_enabled, carousel_interval_ms, randomization_enabled, config_json')
      .order('key');

    if (error) {
      console.error('Failed to load zones:', error);
      return;
    }

    setZones(data || []);
  }

  async function loadFolders() {
    try {
      const folderData = await getMediaFolders();
      setFolders(folderData);
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  }

  async function saveZone(zone: SiteZone) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_zones')
        .upsert({
          key: zone.key,
          carousel_enabled: zone.carousel_enabled,
          carousel_interval_ms: zone.carousel_interval_ms,
          randomization_enabled: zone.randomization_enabled,
          config_json: zone.config_json,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (error) throw error;

      alert('Zone saved successfully!');
      await loadZones();
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save zone');
    } finally {
      setSaving(false);
    }
  }

  async function createNewZone() {
    const pageName = prompt('Enter page name (e.g., "about", "gallery", "contact"):');
    if (!pageName) return;

    const zoneKey = pageName === 'home' ? 'home.background' : `page.${pageName}.background`;

    const existingZone = zones.find(z => z.key === zoneKey);
    if (existingZone) {
      alert('Zone already exists for this page!');
      return;
    }

    const newZone: SiteZone = {
      key: zoneKey,
      carousel_enabled: false,
      carousel_interval_ms: 7000,
      randomization_enabled: true,
      config_json: { folders: ['backgrounds'] }
    };

    await saveZone(newZone);
  }

  async function deleteZone(zoneKey: string) {
    if (!confirm(`Delete zone "${zoneKey}"?`)) return;

    try {
      const { error } = await supabase
        .from('site_zones')
        .delete()
        .eq('key', zoneKey);

      if (error) throw error;

      await loadZones();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete zone');
    }
  }

  function updateZone(zoneKey: string, updates: Partial<SiteZone>) {
    setZones(zones.map(z =>
      z.key === zoneKey
        ? { ...z, ...updates }
        : z
    ));
  }

  function updateZoneFolders(zoneKey: string, folders: string[]) {
    setZones(zones.map(z =>
      z.key === zoneKey
        ? { ...z, config_json: { ...z.config_json, folders } }
        : z
    ));
  }

  function getPageName(zoneKey: string): string {
    if (zoneKey === 'home.background') return 'Home';
    return zoneKey.replace('page.', '').replace('.background', '');
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse text-white/70">Loading background settings...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Page Background Settings</h2>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={createNewZone}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Page
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {zones.map((zone) => {
          const pageName = getPageName(zone.key);
          const isHome = zone.key === 'home.background';
          const selectedFolders = zone.config_json?.folders || ['backgrounds'];

          return (
            <div key={zone.key} className="bg-gray-800 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-white">{pageName}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveZone(zone)}
                    disabled={saving}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="w-3 h-3" />
                    Save
                  </button>
                  {!isHome && (
                    <button
                      onClick={() => deleteZone(zone.key)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={zone.randomization_enabled}
                      onChange={(e) => updateZone(zone.key, { randomization_enabled: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="font-medium">Randomization Enabled</span>
                  </label>
                  <p className="text-xs text-gray-400 ml-6">
                    When enabled, a random image is selected on each page load/navigation
                  </p>
                </div>

                {isHome && (
                  <div className="space-y-2">
                    <label className="flex items-center text-sm text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={zone.carousel_enabled}
                        onChange={(e) => updateZone(zone.key, { carousel_enabled: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="font-medium">Carousel Enabled</span>
                    </label>
                    <p className="text-xs text-gray-400 ml-6">
                      Automatically rotate through images while on this page
                    </p>
                  </div>
                )}

                {isHome && zone.carousel_enabled && (
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-300 font-medium">
                      Carousel Interval (milliseconds)
                    </label>
                    <input
                      type="number"
                      min="1000"
                      step="1000"
                      value={zone.carousel_interval_ms}
                      onChange={(e) => updateZone(zone.key, { carousel_interval_ms: parseInt(e.target.value) || 7000 })}
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                    />
                    <p className="text-xs text-gray-400">
                      Time between automatic transitions (1000ms = 1 second)
                    </p>
                  </div>
                )}

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm text-gray-300 font-medium">
                    Media Folders
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {folders.map(folder => (
                      <label
                        key={folder.id}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded cursor-pointer hover:bg-gray-600"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFolders.includes(folder.slug)}
                          onChange={(e) => {
                            const newFolders = e.target.checked
                              ? [...selectedFolders, folder.slug]
                              : selectedFolders.filter(f => f !== folder.slug);
                            updateZoneFolders(zone.key, newFolders);
                          }}
                        />
                        <span className="text-sm">{folder.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    Select which folders to pull background images from
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-700">
                <div className="text-xs text-gray-400 font-mono">
                  Zone Key: {zone.key}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {zones.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="mb-4">No page background zones configured yet.</p>
          <button
            onClick={createNewZone}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Create First Zone
          </button>
        </div>
      )}
    </div>
  );
}
