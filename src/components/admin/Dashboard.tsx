import React, { useEffect, useState } from 'react';
import {
  Image, FileText, FolderOpen, Layout,
  Upload, PlusCircle, TrendingUp, Clock,
  HardDrive, ArrowRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface MetricCard {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  link?: string;
}

interface Activity {
  id: string;
  action: string;
  target: string;
  timestamp: string;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    mediaCount: 0,
    pagesCount: 0,
    projectsCount: 0,
    essaysCount: 0,
    storageUsed: 0,
  });
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Admin');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserName(user.email.split('@')[0]);
      }

      const mediaResult = await supabase.from('media_items').select('id, file_size', { count: 'exact' }).then(r => r).catch(() => ({ data: [], count: 0 }));
      const pagesResult = await supabase.from('pages').select('id', { count: 'exact' }).eq('is_published', true).then(r => r).catch(() => ({ data: [], count: 0 }));
      const projectsResult = await supabase.from('gallery_projects').select('id', { count: 'exact' }).eq('is_active', true).then(r => r).catch(() => ({ data: [], count: 0 }));
      const essaysResult = await supabase.from('essays').select('id', { count: 'exact' }).then(r => r).catch(() => ({ data: [], count: 0 }));

      const totalStorage = mediaResult.data?.reduce((acc: number, item: any) => acc + (item.file_size || 0), 0) || 0;

      setMetrics({
        mediaCount: mediaResult.count || 0,
        pagesCount: pagesResult.count || 0,
        projectsCount: projectsResult.count || 0,
        essaysCount: essaysResult.count || 0,
        storageUsed: totalStorage,
      });

      await loadRecentActivity();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const activities: Activity[] = [];

      const mediaItems = await supabase.from('media_items').select('id, title, created_at').order('created_at', { ascending: false }).limit(3).then(r => r).catch(() => ({ data: [] }));
      const pages = await supabase.from('pages').select('id, title, updated_at').order('updated_at', { ascending: false }).limit(2).then(r => r).catch(() => ({ data: [] }));
      const essays = await supabase.from('essays').select('id, title, updated_at').order('updated_at', { ascending: false }).limit(2).then(r => r).catch(() => ({ data: [] }));
      const projects = await supabase.from('gallery_projects').select('id, title, updated_at').order('updated_at', { ascending: false }).limit(2).then(r => r).catch(() => ({ data: [] }));

      if (mediaItems.data) {
        mediaItems.data.forEach(item => {
          activities.push({
            id: item.id,
            action: 'Uploaded media',
            target: item.title,
            timestamp: item.created_at,
          });
        });
      }

      if (pages.data) {
        pages.data.forEach(item => {
          activities.push({
            id: item.id,
            action: 'Updated page',
            target: item.title,
            timestamp: item.updated_at,
          });
        });
      }

      if (essays.data) {
        essays.data.forEach(item => {
          activities.push({
            id: item.id,
            action: 'Updated essay',
            target: item.title,
            timestamp: item.updated_at,
          });
        });
      }

      if (projects.data) {
        projects.data.forEach(item => {
          activities.push({
            id: item.id,
            action: 'Updated project',
            target: item.title,
            timestamp: item.updated_at,
          });
        });
      }

      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(activities.slice(0, 10));
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const metricCards: MetricCard[] = [
    {
      label: 'Media Items',
      value: metrics.mediaCount,
      icon: <Image className="w-6 h-6" />,
      color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
      link: 'media',
    },
    {
      label: 'Active Pages',
      value: metrics.pagesCount,
      icon: <Layout className="w-6 h-6" />,
      color: 'from-green-500/20 to-green-600/20 border-green-500/30',
      link: 'pages',
    },
    {
      label: 'Gallery Projects',
      value: metrics.projectsCount,
      icon: <FolderOpen className="w-6 h-6" />,
      color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
      link: 'projects',
    },
    {
      label: 'Essays',
      value: metrics.essaysCount,
      icon: <FileText className="w-6 h-6" />,
      color: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
      link: 'essays',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/70">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Welcome back, {userName}
        </h1>
        <p className="text-white/60">Here's what's happening with your portfolio today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br ${card.color} border rounded-lg p-6 hover:scale-105 transition-transform cursor-pointer`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/10 rounded-lg text-white">
                {card.icon}
              </div>
              <TrendingUp className="w-4 h-4 text-white/50" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-white">{card.value}</p>
              <p className="text-sm text-white/70">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </h2>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-12 text-white/50">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div>
                      <p className="text-white text-sm">
                        <span className="font-medium">{activity.action}</span>
                        <span className="text-white/60"> • {activity.target}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-white/50">{formatTimestamp(activity.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              Quick Actions
            </h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white text-left flex items-center gap-3 transition-colors group">
                <Upload className="w-4 h-4" />
                <span className="flex-1">Upload Media</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white text-left flex items-center gap-3 transition-colors group">
                <Layout className="w-4 h-4" />
                <span className="flex-1">Create Page</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white text-left flex items-center gap-3 transition-colors group">
                <FolderOpen className="w-4 h-4" />
                <span className="flex-1">New Project</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white text-left flex items-center gap-3 transition-colors group">
                <FileText className="w-4 h-4" />
                <span className="flex-1">Add Essay</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Storage Usage
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Total Used</span>
                <span className="text-white font-semibold">{formatBytes(metrics.storageUsed)}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                  style={{ width: '15%' }}
                ></div>
              </div>
              <p className="text-xs text-white/50">15% of available storage</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
