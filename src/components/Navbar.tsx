'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LineChart, ClipboardList, PenTool, ChevronDown, User, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const links = [
    { name: 'INÍCIO', path: '/', icon: Home },
    { name: 'DASHBOARD', path: '/dashboard', icon: TrendingUp },
    { name: 'ESTOQUE', path: '/inventory', icon: LineChart },
    { name: 'AVALIAÇÕES', path: '/evaluations', icon: ClipboardList },
    { name: 'FERRAMENTAS', path: '/tools', icon: PenTool },
  ];

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', marginRight: '2rem', letterSpacing: '-0.5px' }}>
              <span style={{ color: '#111' }}>CarFlip</span>
              <span style={{ color: 'rgba(0,0,0,0.6)' }}>.PRO</span>
            </div>
            <div className={styles.navLinks}>
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.path || (link.path !== '/' && pathname?.startsWith(link.path));
              return (
                <Link key={link.path} href={link.path} className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
                  <Icon size={18} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
            </div>
          </div>

          {user && (
            <div className={styles.userMenu}>
              <button 
                className={styles.userMenuBtn} 
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
                <span className={styles.userName}>Minha Conta</span>
                <ChevronDown size={14} />
              </button>
              
              {showDropdown && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <button onClick={signOut} className={styles.logoutBtn}>
                    Sair
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
      

    </>
  );
}
