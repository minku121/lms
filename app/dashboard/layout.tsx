'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Overview', href: '/dashboard', icon: '📊' },
    { name: 'Books Management', href: '/dashboard/books', icon: '📚' },
    { name: 'Student Registry', href: '/dashboard/students', icon: '👥' },
    { name: 'Issue / Return', href: '/dashboard/issue', icon: '🔄' },
  ];

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-zinc-400">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0d0d0d] border-r border-white/5 flex flex-col fixed h-full z-10">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/20">L</div>
            <span className="text-sm font-black text-white tracking-tight leading-tight">Library <br/><span className="text-blue-500">Management System</span></span>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm tracking-tight ${isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'hover:bg-white/[0.05] hover:text-white'
                    }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/5 space-y-4">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 transition-colors font-bold text-sm tracking-tight"
          >
            <span>🚪</span>
            Logout
          </button>
          <div className="text-[10px] font-medium text-zinc-500 text-center uppercase tracking-widest leading-relaxed pt-4 border-t border-white/5">
            Designed & Developed by <br/>
            <span className="text-zinc-400 font-bold">Minku Singh</span><br/>
            23155134013
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-10">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
