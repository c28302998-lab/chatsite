"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Home, Users, Briefcase, FileText, Settings, UserPlus, Wallet, LogOut, Shield, Gift } from 'lucide-react';

export default function Sidebar({ hasOwnedBand, hasBandId, role }: { hasOwnedBand?: boolean; hasBandId?: boolean; role?: string }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const showWorkersTab = role === 'ADMIN' || role === 'PARTNER';

  const menuItems = role === 'CHATTER'
    ? [
        { name: 'Главная (Сдать отчет)', href: '/', icon: Home },
        { name: 'Баланс', href: '/balance', icon: Wallet },
        { name: 'Настройки', href: '/settings', icon: Settings },
      ]
    : [
        { name: 'Главная', href: '/', icon: Home },
        { name: 'Заявки', href: '/applications', icon: Briefcase },
        ...(showWorkersTab ? [{ name: 'Команда', href: '/workers', icon: Users }] : []),
        { name: 'Чатеры', href: '/chatters', icon: UserPlus },
        { name: 'Баланс', href: '/balance', icon: Wallet },
        { name: 'Отчеты', href: '/reports', icon: FileText },
        ...(role === 'ADMIN' ? [
          { name: 'Финансы (Админ)', href: '/admin/finances', icon: Wallet },
          { name: 'Составы', href: '/admin/bands', icon: Shield },
          { name: 'Бонусы и Ставки', href: '/admin/bonuses', icon: Gift }
        ] : []),
        { name: 'Настройки', href: '/settings', icon: Settings },
      ];

  const userName = session?.user?.name || 'Пользователь';
  const userEmail = session?.user?.email || 'Загрузка...';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <aside className="h-full w-full bg-slate-950/90 backdrop-blur-xl border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
        <span className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
          HUNTME CRM
        </span>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all active:scale-95 ${
                isActive 
                  ? 'bg-indigo-500/10 text-indigo-400' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-indigo-400/80'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Mini */}
      <div className="p-4 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">{userEmail}</p>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 -mr-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Выйти"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
