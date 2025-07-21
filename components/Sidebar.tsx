import React from 'react';
import { Page } from '../types.ts';
import { ICONS } from '../constants.tsx';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const NavItem: React.FC<{
  page: Page;
  icon: React.ReactNode;
  active: boolean;
  onClick: (page: Page) => void;
}> = ({ page, icon, active, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick(page);
      }}
      className={`flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
        active
          ? 'bg-black/20 text-white shadow-lg'
          : 'text-gray-300 hover:bg-black/10 hover:text-white'
      }`}
    >
      {icon}
      <span className="ml-4 font-medium whitespace-nowrap">{page}</span>
    </a>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, activePage, setActivePage }) => {
  const menuItems = [
    { page: Page.Dashboard, icon: ICONS.dashboard },
    { page: Page.Appointments, icon: ICONS.appointments },
    { page: Page.GateManagement, icon: ICONS.gate },
    { page: Page.Operations, icon: ICONS.operations },
    { page: Page.Docks, icon: ICONS.docks },
    { page: Page.Carriers, icon: ICONS.carriers },
    { page: Page.Vendors, icon: ICONS.vendors },
    { page: Page.Configurations, icon: ICONS.settings },
    { page: Page.Documents, icon: ICONS.documents },
    { page: Page.Reports, icon: ICONS.reports },
  ];
  
  const secondaryMenuItems = [
      { page: Page.Settings, icon: ICONS.settings },
      { page: Page.Help, icon: ICONS.help },
  ]

  return (
    <div
      className={`text-brand-text flex-shrink-0 flex flex-col shadow-2xl transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-0'}`}
      style={{ backgroundImage: 'linear-gradient(to bottom, #794575, #1A1A26)' }}
    >
        <div className="w-64 h-full overflow-hidden">
            <div className="p-4 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center flex-1 min-w-0">
                        <div className="bg-brand-accent p-2 rounded-full flex-shrink-0">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 4v16"></path></svg>
                        </div>
                        <div className="ml-3 min-w-0">
                            <h1 className="text-xl font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">DOCKFLOW</h1>
                            <span className="text-xs text-gray-400 whitespace-nowrap">ABC Logistics</span>
                        </div>
                    </div>
                    <button onClick={onToggle} className="p-1 rounded-full text-gray-400 hover:bg-white/10 hover:text-white" aria-label="Collapse sidebar">
                        {ICONS.chevronDoubleLeft}
                    </button>
                </div>
                
                <nav className="flex-1">
                    <ul>
                    {menuItems.map((item) => (
                        <NavItem
                        key={item.page}
                        page={item.page}
                        icon={item.icon}
                        active={activePage === item.page}
                        onClick={setActivePage}
                        />
                    ))}
                    </ul>
                </nav>

                <div className="mt-auto">
                    <ul>
                    {secondaryMenuItems.map((item) => (
                        <NavItem
                        key={item.page}
                        page={item.page}
                        icon={item.icon}
                        active={activePage === item.page}
                        onClick={setActivePage}
                        />
                    ))}
                    </ul>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Sidebar;