/**
 * Main Application Component
 * 
 * This component sets up the application shell, including the sidebar navigation
 * and the main content area with routing. It also provides the QueryClient context
 * for data fetching throughout the application.
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LayoutDashboard, Search, Clock, Network, Layers } from 'lucide-react';
import Dashboard from './features/dashboard/Dashboard';
import QueryConsole from './features/query/QueryConsole';
import Timeline from './features/timeline/Timeline';
import Graph from './features/graph/Graph';
import Consolidate from './features/consolidate/Consolidate';

// Initialize React Query client for data fetching and caching
const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
                    {/* Sidebar Navigation */}
                    <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                            <h1 className="text-xl font-bold text-primary dark:text-white">LegalBriefAI</h1>
                        </div>
                        <nav className="flex-1 p-4 space-y-2">
                            <NavLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                            <NavLink to="/query" icon={<Search size={20} />} label="Query Console" />
                            <NavLink to="/timeline" icon={<Clock size={20} />} label="Timeline" />
                            <NavLink to="/graph" icon={<Network size={20} />} label="Semantic Graph" />
                            <NavLink to="/consolidate" icon={<Layers size={20} />} label="Consolidate" />
                        </nav>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 overflow-auto">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/query" element={<QueryConsole />} />
                            <Route path="/timeline" element={<Timeline />} />
                            <Route path="/graph" element={<Graph />} />
                            <Route path="/consolidate" element={<Consolidate />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </QueryClientProvider>
    );
}

/**
 * Navigation Link Component
 * 
 * Renders a styled link with an icon for the sidebar.
 */
const NavLink = ({ to, icon, label }) => (
    <Link
        to={to}
        className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white"
    >
        {icon}
        <span>{label}</span>
    </Link>
);

export default App;
