'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  Play,
  Share,
  Users,
  Calendar,
  Clock,
  Target,
  Zap,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  engagementRate: number;
  growthRate: number;
  topPerformer: string;
  recentActivity: Array<{
    type: 'view' | 'like' | 'share' | 'comment';
    count: number;
    change: number;
  }>;
}

interface AnalyticsDashboardProps {
  isVisible: boolean;
  onClose: () => void;
  data?: AnalyticsData;
}

const mockAnalyticsData: AnalyticsData = {
  totalViews: 12847,
  totalLikes: 1293,
  totalShares: 456,
  engagementRate: 8.7,
  growthRate: 24.5,
  topPerformer: 'Midnight Sessions Album',
  recentActivity: [
    { type: 'view', count: 2847, change: 12.5 },
    { type: 'like', count: 293, change: -2.1 },
    { type: 'share', count: 156, change: 8.3 },
    { type: 'comment', count: 89, change: 15.7 }
  ]
};

function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'orange',
  delay = 0 
}: {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  delay?: number;
}) {
  const colorClasses = {
    orange: 'from-orange-500 to-red-500',
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    yellow: 'from-yellow-500 to-orange-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, type: "spring" }}
      className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 overflow-hidden group hover:border-gray-600/50 transition-all duration-300"
    >
      {/* Background Glow */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300",
        colorClasses[color as keyof typeof colorClasses]
      )} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "p-3 rounded-xl bg-gradient-to-br",
            colorClasses[color as keyof typeof colorClasses]
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
              change >= 0 
                ? "bg-green-500/20 text-green-400" 
                : "bg-red-500/20 text-red-400"
            )}>
              {change >= 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          <p className="text-sm text-gray-400">{title}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ActivityChart() {
  const data = [
    { day: 'Mon', views: 120, likes: 45 },
    { day: 'Tue', views: 180, likes: 67 },
    { day: 'Wed', views: 240, likes: 89 },
    { day: 'Thu', views: 160, likes: 52 },
    { day: 'Fri', views: 320, likes: 124 },
    { day: 'Sat', views: 280, likes: 98 },
    { day: 'Sun', views: 200, likes: 76 }
  ];

  const maxViews = Math.max(...data.map(d => d.views));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Weekly Activity</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span className="text-gray-400">Views</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span className="text-gray-400">Likes</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-end justify-between h-32 gap-2">
        {data.map((item, index) => (
          <div key={item.day} className="flex flex-col items-center gap-2 flex-1">
            <div className="flex flex-col items-center gap-1 w-full">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(item.views / maxViews) * 100}%` }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-sm min-h-[4px]"
              />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(item.likes / maxViews) * 100}%` }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
                className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-sm min-h-[2px]"
              />
            </div>
            <span className="text-xs text-gray-400">{item.day}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function TopContent() {
  const topItems = [
    { title: 'Midnight Sessions', type: 'Album', views: '2.4K', trend: 'up' },
    { title: 'Chill Vibes', type: 'Playlist', views: '1.8K', trend: 'up' },
    { title: 'Music Production Tips', type: 'Blog', views: '1.2K', trend: 'down' },
    { title: 'Summer Hits 2024', type: 'Playlist', views: '980', trend: 'up' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7, duration: 0.4 }}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-6">Top Performing Content</h3>
      
      <div className="space-y-4">
        {topItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 + index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-700/30 transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                {index + 1}
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">{item.title}</h4>
                <p className="text-xs text-gray-400">{item.type}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{item.views}</span>
              <div className={cn(
                "p-1 rounded-full",
                item.trend === 'up' ? "text-green-400" : "text-red-400"
              )}>
                {item.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function AnalyticsDashboard({ 
  isVisible, 
  onClose, 
  data = mockAnalyticsData 
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'audience'>('overview');

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
                  <p className="text-gray-400">Your content performance insights</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8">
              {[
                { key: 'overview', label: 'Overview', icon: Activity },
                { key: 'performance', label: 'Performance', icon: TrendingUp },
                { key: 'audience', label: 'Audience', icon: Users }
              ].map((tab) => (
                <Button
                  key={tab.key}
                  variant={activeTab === tab.key ? 'default' : 'ghost'}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={cn(
                    "flex items-center gap-2",
                    activeTab === tab.key 
                      ? "bg-orange-500 text-white" 
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                      title="Total Views"
                      value={data.totalViews}
                      change={12.5}
                      icon={Eye}
                      color="blue"
                      delay={0.1}
                    />
                    <MetricCard
                      title="Total Likes"
                      value={data.totalLikes}
                      change={-2.1}
                      icon={Heart}
                      color="purple"
                      delay={0.2}
                    />
                    <MetricCard
                      title="Engagement Rate"
                      value={`${data.engagementRate}%`}
                      change={8.3}
                      icon={Zap}
                      color="yellow"
                      delay={0.3}
                    />
                    <MetricCard
                      title="Growth Rate"
                      value={`+${data.growthRate}%`}
                      change={15.7}
                      icon={TrendingUp}
                      color="green"
                      delay={0.4}
                    />
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ActivityChart />
                    <TopContent />
                  </div>
                </motion.div>
              )}

              {activeTab === 'performance' && (
                <motion.div
                  key="performance"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="text-center py-12"
                >
                  <div className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl inline-block mb-4">
                    <TrendingUp className="w-12 h-12 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Performance Analytics</h3>
                  <p className="text-gray-400">Detailed performance metrics coming soon...</p>
                </motion.div>
              )}

              {activeTab === 'audience' && (
                <motion.div
                  key="audience"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="text-center py-12"
                >
                  <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl inline-block mb-4">
                    <Users className="w-12 h-12 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Audience Insights</h3>
                  <p className="text-gray-400">Audience demographics and behavior analysis coming soon...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}