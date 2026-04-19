// KYWC 3D班網 — 共用 Layout 組件
// 設計：港式制服藍，固定頂部導航，深色頁腳
// 包含：響應式導航、下拉選單、移動端漢堡選單、登出功能

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { clearAuth, checkAuth } from "@/lib/auth";

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function Layout({ children, requireAuth = true }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDropdowns, setMobileDropdowns] = useState<Record<string, boolean>>({});
  const [, navigate] = useLocation();

  useEffect(() => {
    if (requireAuth && !checkAuth()) {
      navigate("/login");
    }
  }, [requireAuth, navigate]);

  const handleLogout = () => {
    if (confirm("確定要登出嗎？")) {
      clearAuth();
      navigate("/login");
    }
  };

  const toggleMobileDropdown = (key: string) => {
    setMobileDropdowns(prev => ({
      ...Object.fromEntries(Object.keys(prev).map(k => [k, false])),
      [key]: !prev[key],
    }));
  };

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileDropdowns({});
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ===== 導航欄 ===== */}
      <header className="bg-white border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="container">
          <div className="flex justify-between items-center py-3">
            {/* Logo */}
            <Link href="/" onClick={closeMobile} className="flex items-center gap-2">
              <img
                src="https://www.twghkywc.edu.hk/sites/default/files/sch_logo.png"
                alt="KYWC學校標誌"
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
              />
              <span className="text-base sm:text-lg font-bold text-primary hidden sm:inline leading-tight">
                KYWC 3D班網
              </span>
            </Link>

            {/* 桌面導航 */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink href="/" label="首頁" />

              <DesktopDropdown label="最新公告">
                <DropdownItem href="/ad" label="考試資訊" />
                <DropdownItem href="/announcements?category=activity" label="活動通知" />
              </DesktopDropdown>

              <DesktopDropdown label="關於我們">
                <DropdownItem href="/#about-teachers" label="班主任" />
                <DropdownItem href="/#about-committee" label="班會幹事" />
                <DropdownItem href="/#about-timetable" label="班級上課時間表" />
              </DesktopDropdown>

              <DesktopDropdown label="快速連結">
                <DropdownItem href="/resources" label="學習資源" />
                <DropdownItem href="/gallery" label="班級相冊" />
                <DropdownItem href="/committee" label="班會幹事" />
                <DropdownItem href="/info" label="學校資訊" />
              </DesktopDropdown>

              <NavLink href="/#contact" label="聯絡我們" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 font-medium px-4 py-2 text-foreground hk-hover hover:text-primary text-sm"
              >
                <i className="fas fa-sign-out-alt" />
                登出
              </button>
            </nav>

            {/* 移動端漢堡按鈕 */}
            <button
              className="md:hidden p-2 text-foreground hover:text-primary"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="開啟選單"
            >
              <i className={`fas ${mobileOpen ? "fa-times" : "fa-bars"} text-xl`} />
            </button>
          </div>
        </div>

        {/* 移動端選單 */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-border">
            <div className="container py-3 space-y-1">
              <MobileNavLink href="/" label="首頁" onClick={closeMobile} />

              <MobileDropdown
                label="最新公告"
                isOpen={!!mobileDropdowns["announcements"]}
                onToggle={() => toggleMobileDropdown("announcements")}
              >
                <MobileNavLink href="/ad" label="考試資訊" onClick={closeMobile} sub />
                <MobileNavLink href="/announcements" label="活動通知" onClick={closeMobile} sub />
              </MobileDropdown>

              <MobileDropdown
                label="關於我們"
                isOpen={!!mobileDropdowns["about"]}
                onToggle={() => toggleMobileDropdown("about")}
              >
                <MobileNavLink href="/#about-teachers" label="班主任" onClick={closeMobile} sub />
                <MobileNavLink href="/#about-committee" label="班會幹事" onClick={closeMobile} sub />
                <MobileNavLink href="/#about-timetable" label="班級上課時間表" onClick={closeMobile} sub />
              </MobileDropdown>

              <MobileDropdown
                label="快速連結"
                isOpen={!!mobileDropdowns["links"]}
                onToggle={() => toggleMobileDropdown("links")}
              >
                <MobileNavLink href="/resources" label="學習資源" onClick={closeMobile} sub />
                <MobileNavLink href="/gallery" label="班級相冊" onClick={closeMobile} sub />
                <MobileNavLink href="/committee" label="班會幹事" onClick={closeMobile} sub />
                <MobileNavLink href="/info" label="學校資訊" onClick={closeMobile} sub />
              </MobileDropdown>

              <MobileNavLink href="/#contact" label="聯絡我們" onClick={closeMobile} />

              <button
                onClick={() => { closeMobile(); handleLogout(); }}
                className="w-full flex items-center gap-2 py-3 px-4 font-medium text-foreground hover:bg-primary/5 hover:text-primary rounded-lg text-left text-sm"
              >
                <i className="fas fa-sign-out-alt" /> 登出
              </button>

              <MobileNavLink href="/#suggestion" label="意見反映" onClick={closeMobile} highlight />
            </div>
          </div>
        )}
      </header>

      {/* ===== 主要內容 ===== */}
      <main className="flex-1">{children}</main>

      {/* ===== 頁腳 ===== */}
      <footer className="bg-foreground text-white py-10">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-white text-primary p-1.5 rounded-lg">
                  <i className="fa fa-graduation-cap text-lg" />
                </div>
                <h3 className="text-base font-bold">KYWC_3D班網</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                團結互助，共創輝煌，我們的班級故事從這裡開始。
              </p>
            </div>

            <div>
              <h4 className="text-base font-semibold mb-3">快速連結</h4>
              <ul className="space-y-1.5 text-gray-400 text-sm">
                {[
                  { href: "/", label: "首頁" },
                  { href: "/announcements", label: "最新公告" },
                  { href: "/#about", label: "關於我們" },
                  { href: "/#links", label: "快速連結" },
                  { href: "/#contact", label: "聯絡我們" },
                ].map(item => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-white hk-hover">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-base font-semibold mb-3">相關資源</h4>
              <ul className="space-y-1.5 text-gray-400 text-sm">
                {[
                  { href: "/resources", label: "學習資源" },
                  { href: "/gallery", label: "班級相冊" },
                  { href: "/committee", label: "班會幹事" },
                  { href: "/info", label: "學校資訊" },
                ].map(item => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-white hk-hover">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-base font-semibold mb-3">聯繫 Admin</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <i className="fa fa-envelope-o w-4" />
                  <span>admin@kywc3d.qzz.io</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fa fa-instagram w-4" />
                  <a
                    href="https://www.instagram.com/kywc_3d/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white hk-hover"
                  >
                    kywc_3d
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fa fa-whatsapp w-4 text-green-400" />
                  <a
                    href="https://wa.me/85292683237"
                    className="hover:text-white hk-hover"
                  >
                    852 9268 3237
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              &copy; 2025 KYWC_3D班網. 保留所有權利。
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary text-white hover:bg-secondary font-medium px-4 py-2 rounded-lg text-sm hk-hover"
            >
              返回頂部 <i className="fa fa-arrow-up" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ===== 子組件 =====

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="font-medium px-4 py-2 text-foreground hk-hover hover:text-primary text-sm"
    >
      {label}
    </Link>
  );
}

function DesktopDropdown({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group">
      <button className="flex items-center gap-1 font-medium px-4 py-2 text-foreground hk-hover hover:text-primary text-sm">
        {label}
        <i className="fa fa-chevron-down text-xs transition-transform duration-200 group-hover:rotate-180" />
      </button>
      <div className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1.5">{children}</div>
      </div>
    </div>
  );
}

function DropdownItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 text-sm text-foreground hk-hover hover:bg-primary/5 hover:text-primary"
    >
      {label}
    </Link>
  );
}

function MobileNavLink({
  href,
  label,
  onClick,
  sub = false,
  highlight = false,
}: {
  href: string;
  label: string;
  onClick: () => void;
  sub?: boolean;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block py-2.5 px-4 font-medium rounded-lg text-sm hk-hover
        ${sub ? "text-muted-foreground hover:bg-primary/5 hover:text-primary" : "text-foreground hover:bg-primary/5 hover:text-primary"}
        ${highlight ? "text-primary" : ""}
      `}
    >
      {label}
    </Link>
  );
}

function MobileDropdown({
  label,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center py-2.5 px-4 font-medium text-foreground hover:bg-primary/5 hover:text-primary rounded-lg text-left text-sm"
      >
        {label}
        <i className={`fa fa-chevron-down text-xs transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="pl-4 border-l-2 border-primary/20 ml-4 mt-1 space-y-0.5">
          {children}
        </div>
      )}
    </div>
  );
}
