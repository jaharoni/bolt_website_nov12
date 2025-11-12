import React, { useState, useEffect } from "react";
import { Save, AlertCircle } from "lucide-react";
import useSupabaseTable from "../../hooks/useSupabaseTable";
import { SiteSettings } from "../../lib/types";
import { supabase } from "../../lib/supabase";

export default function SettingsManager() {
  const { items, fetchAll, loading, error } = useSupabaseTable<SiteSettings>({
    table: "site_settings",
    order: { column: "category", ascending: true },
  });

  const [saving, setSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Convert array of settings to object for easier access
    const settingsObj: Record<string, any> = {};
    items.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    setLocalSettings(settingsObj);
  }, [items]);

  const updateSetting = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      // Update each changed setting
      for (const [key, value] of Object.entries(localSettings)) {
        const setting = items.find(s => s.key === key);
        if (setting) {
          const { error } = await supabase
            .from('site_settings')
            .update({ value, updated_at: new Date().toISOString() })
            .eq('id', setting.id);

          if (error) throw error;
        }
      }

      await fetchAll();
      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setSaveMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-white/70">Loading settings...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">Error Loading Settings</span>
          </div>
          <p className="text-sm">{String(error.message || error)}</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-white/70 mb-4">No settings found in database</div>
        <p className="text-sm text-white/50">Settings should have been created by migration</p>
      </div>
    );
  }

  // Group settings by category
  const generalSettings = items.filter(s => s.category === 'general');
  const featureSettings = items.filter(s => s.category === 'features');
  const systemSettings = items.filter(s => s.category === 'system');

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Site Settings</h2>
          <p className="text-sm text-white/60 mt-1">Configure your website preferences and features</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-4 rounded-lg border ${
          saveMessage.type === 'success'
            ? 'bg-green-500/10 border-green-500/50 text-green-400'
            : 'bg-red-500/10 border-red-500/50 text-red-400'
        }`}>
          {saveMessage.text}
        </div>
      )}

      {/* General Settings */}
      <section className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>

        {generalSettings.map(setting => (
          <div key={setting.key} className="space-y-2">
            <label className="block">
              <div className="text-sm text-white/80 mb-2 font-medium">
                {setting.key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </div>
              {setting.description && (
                <div className="text-xs text-white/50 mb-2">{setting.description}</div>
              )}
              {setting.key === 'social_links' ? (
                <div className="space-y-2">
                  {Object.entries(localSettings[setting.key] || {}).map(([platform, url]) => (
                    <div key={platform} className="flex items-center gap-2">
                      <span className="text-sm text-white/70 w-24 capitalize">{platform}:</span>
                      <input
                        type="url"
                        value={String(url)}
                        onChange={(e) => updateSetting(setting.key, {
                          ...localSettings[setting.key],
                          [platform]: e.target.value
                        })}
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-white/40"
                        placeholder={`https://${platform}.com/username`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <input
                  type={setting.key.includes('email') ? 'email' : 'text'}
                  value={String(localSettings[setting.key] || '')}
                  onChange={(e) => updateSetting(setting.key, e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded text-white placeholder-white/40"
                  placeholder={`Enter ${setting.key.replace(/_/g, ' ')}`}
                />
              )}
            </label>
          </div>
        ))}
      </section>

      {/* Feature Toggles */}
      <section className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Feature Toggles</h3>
          <p className="text-sm text-white/50 mt-1">Enable or disable specific features</p>
        </div>

        <div className="space-y-3">
          {featureSettings.map(setting => (
            <label key={setting.key} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(localSettings[setting.key])}
                onChange={(e) => updateSetting(setting.key, e.target.checked)}
                className="mt-1 w-5 h-5 rounded"
              />
              <div>
                <div className="text-white font-medium">
                  {setting.key.split('_').slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </div>
                {setting.description && (
                  <div className="text-sm text-white/60 mt-1">{setting.description}</div>
                )}
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* System Settings */}
      {systemSettings.length > 0 && (
        <section className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white">System Settings</h3>
            <p className="text-sm text-white/50 mt-1">Advanced system configuration</p>
          </div>

          <div className="space-y-3">
            {systemSettings.map(setting => (
              <label key={setting.key} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(localSettings[setting.key])}
                  onChange={(e) => updateSetting(setting.key, e.target.checked)}
                  className="mt-1 w-5 h-5 rounded"
                />
                <div>
                  <div className="text-white font-medium">
                    {setting.key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </div>
                  {setting.description && (
                    <div className="text-sm text-white/60 mt-1">{setting.description}</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </section>
      )}

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-300">
            <p className="font-medium mb-1">Settings Information</p>
            <p className="text-blue-300/80">
              These settings are stored in the database and persist across deployments.
              Changes take effect immediately after saving.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
