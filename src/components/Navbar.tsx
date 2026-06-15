'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LineChart, ClipboardList, PenTool, ChevronDown, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const links = [
    { name: 'INÍCIO', path: '/', icon: Home },
    { name: 'ESTOQUE', path: '/inventory', icon: LineChart },
    { name: 'AVALIAÇÕES', path: '/evaluations', icon: ClipboardList },
    { name: 'FERRAMENTAS', path: '/tools', icon: PenTool },
  ];

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
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
      
      {/* Sub-bar / Breadcrumb Area as shown in the image */}
      <div className={styles.subNavbar}>
        <div className={styles.subNavContainer}>
          <div className={styles.breadcrumbCard}>
            <div className={styles.breadcrumbHome}>
              <Home size={16} />
            </div>
            <div className={styles.breadcrumbActive}>
              {pathname === '/' ? 'Dashboard' : 
               pathname.startsWith('/evaluations') ? 'Avaliações' : 
               pathname.startsWith('/inventory') ? 'Estoque' : 'Página'}
            </div>
          </div>
          <div className={styles.subNavIcons}>
          </div>
        </div>
      </div>
    </>
  );
}
