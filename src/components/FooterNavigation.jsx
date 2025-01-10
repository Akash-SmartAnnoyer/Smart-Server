import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, FileText, Home, History, Settings, ChefHat, LayoutDashboard, User, Lightbulb, DollarOutlined, IndianRupee } from 'lucide-react';

const FooterNavigation = () => {
  const location = useLocation();
  const role = localStorage.getItem('role') || 'customer';

  const isActive = (path) => location.pathname === path;

  const customerLinks = [
    { path: '/home', icon: Home, label: 'Menu' },
    { path: '/cart', icon: ShoppingBag, label: 'Cart' },
    { path: '/all-orders-summary', icon: FileText, label: 'Summary' },
    { path: '/my-orders', icon: History, label: 'My Order' }
  ];

  const adminLinks = [
    { path: '/admin', icon: ChefHat, label: 'Orders' },
    { path: '/menu-management', icon: FileText, label: 'Menu' },
    { path: '/menu-suggestion', icon: Lightbulb, label: 'Suggestion'},
    { path: '/charges-management', icon: IndianRupee, label: 'Charges' },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/order-history', icon: History, label: 'History' },
    { path: '/management', icon: User, label: 'Profile' },
  ];

  const links = role === 'customer' ? customerLinks : adminLinks;

  return (
    <nav className="footer-nav">
      <div className="nav-container">
        {links.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`nav-item ${isActive(path) ? 'active' : ''}`}
          >
            <div className="icon-container">
              <Icon className="nav-icon" />
              <div className="icon-background" />
            </div>
            <span className="nav-label">{label}</span>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .footer-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
        }

        .nav-container {
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 4px 16px;
          padding-bottom: calc(4px + env(safe-area-inset-bottom));
          gap: ${role === 'admin' ? '8px' : '16px'};
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
          position: relative;
          padding: 4px ${role === 'admin' ? '4px' : '8px'};
          transition: transform 0.2s ease;
        }

        .nav-item:hover {
          transform: translateY(-2px);
        }

        .icon-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${role === 'admin' ? '32px' : '40px'};
          height: ${role === 'admin' ? '32px' : '40px'};
          margin-bottom: 2px;
        }

        .nav-icon {
          width: ${role === 'admin' ? '16px' : '20px'};
          height: ${role === 'admin' ? '16px' : '20px'};
          position: relative;
          z-index: 2;
          stroke-width: 2px;
          transition: all 0.3s ease;
          color: #666;
        }

        .icon-background {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.8);
          width: 100%;
          height: 100%;
          border-radius: 16px;
          background: transparent;
          transition: all 0.3s ease;
        }

        .nav-label {
          font-size: 11px;
          font-weight: 500;
          color: #666;
          transition: all 0.3s ease;
          margin-top: 2px;
        }

        .nav-item.active {
          transform: translateY(-4px);
        }

        .nav-item.active .nav-icon {
          color: #e53e3e;
          transform: scale(1.1);
        }

        .nav-item.active .icon-background {
          background: rgba(229, 62, 62, 0.15);
          transform: translate(-50%, -50%) scale(1);
        }

        .nav-item.active .nav-label {
          color: #e53e3e;
          font-weight: 600;
        }

        @media (hover: hover) {
          .nav-item:hover .nav-icon {
            color: #e53e3e;
          }

          .nav-item:hover .nav-label {
            color: #e53e3e;
          }
        }

        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .footer-nav {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }

        @media (max-width: 380px) {
          .icon-container {
            width: 36px;
            height: 36px;
          }

          .nav-icon {
            width: 18px;
            height: 18px;
          }

          .nav-label {
            font-size: 10px;
          }
        }
      `}</style>
    </nav>
  );
};

export default FooterNavigation;
