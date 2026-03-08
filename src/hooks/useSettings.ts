import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import type { UserSettings } from '../types';

const DEFAULTS: UserSettings = {
  default_distance: 5.0,
  default_activity: 'foot',
  default_map_style: 'dark',
};

export function useSettings(userId: string | undefined) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  // Load settings from Supabase
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        const { data } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (data) {
          setSettings({
            default_distance: data.default_distance ?? DEFAULTS.default_distance,
            default_activity: data.default_activity ?? DEFAULTS.default_activity,
            default_map_style: data.default_map_style ?? DEFAULTS.default_map_style,
          });
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [userId]);

  const updateSettings = useCallback(
    async (updates: Partial<UserSettings>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);

      if (!userId) return;

      await supabase
        .from('user_settings')
        .upsert(
          {
            user_id: userId,
            default_distance: newSettings.default_distance,
            default_activity: newSettings.default_activity,
            default_map_style: newSettings.default_map_style,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
    },
    [settings, userId]
  );

  return { settings, updateSettings, loading };
}
