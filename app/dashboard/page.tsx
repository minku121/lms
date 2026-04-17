'use client';

import { useEffect, useState } from 'react';


interface Stats {
  books: { total: number; stock: number; available: number };
  students: { total: number };
  issued: { total: number };
  overdue: { total: number };
  recent: Array<{
    student: string;
    book: string;
    type: string;
    issue_date: string;
    return_date: string | null;
  }>;
}

export default function DashboardOverview() {

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, []);




  if (loading || !stats) return <div className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Dashboard...</div>;



  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Overview</h1>
          <p className="text-zinc-500 font-medium uppercase tracking-widest text-xs">Real-time system health & analytics</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Database Connected
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <StatCard title="Total Books" value={stats.books?.total || 0} icon="📚" detail={`${stats.books?.available || 0} Available`} color="blue" />
        <StatCard title="Active Issues" value={stats.issued?.total || 0} icon="🔄" detail={`${stats.overdue?.total || 0} Overdue`} color="purple" />
        <StatCard title="Total Students" value={stats.students?.total || 0} icon="👥" detail="Active Enrollment" color="emerald" />
      </div>


      {/* Activity Section */}
      <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8">
        <h3 className="text-xl font-bold text-white mb-6 tracking-tight">Recent Circulation</h3>
        <div className="space-y-6">
          {stats.recent.length > 0 ? (
            stats.recent.map((activity, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg">👤</div>
                  <div>
                    <div className="font-bold text-zinc-200 group-hover:text-white transition-colors">{activity.student}</div>
                    <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest">{activity.book}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-black uppercase tracking-widest ${activity.type === 'issued' ? 'text-blue-400' : 'text-emerald-400'}`}>
                    {activity.type}
                  </div>
                  <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                    {activity.type === 'issued' 
                      ? new Date(activity.issue_date).toLocaleDateString() 
                      : new Date(activity.return_date!).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-zinc-600 font-bold uppercase tracking-widest text-xs">No recent activity</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, detail, color }: { title: string; value: string | number; icon: string; detail: string; color: string }) {

  const colorMap: { [key: string]: string } = {
    blue: 'border-blue-500/20 text-blue-500 bg-blue-500/5',
    purple: 'border-purple-500/20 text-purple-500 bg-purple-500/5',
    emerald: 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5',
    amber: 'border-amber-500/20 text-amber-500 bg-amber-500/5',
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] hover:bg-white/[0.05] transition-all group">
      <div className="flex items-start justify-between mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <div className="text-4xl font-black text-white mb-2 tracking-tighter group-hover:scale-105 transition-transform origin-left">{value}</div>
      <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{title}</div>
      <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">{detail}</div>
    </div>
  );
}

function HealthIndicator({ label, percentage, color }: { label: string; percentage: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-black text-white">{percentage}%</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.3)]`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

