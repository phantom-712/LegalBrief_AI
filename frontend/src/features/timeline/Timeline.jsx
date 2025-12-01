/**
 * Timeline Feature
 * 
 * This component displays a chronological view of events extracted from the documents.
 * It fetches timeline data from the backend and renders it in a vertical timeline layout.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, ArrowRight } from 'lucide-react';
import api from '../../api/client';

const Timeline = () => {
    // Fetch timeline events from the backend
    const { data: events, isLoading } = useQuery({
        queryKey: ['timeline'],
        queryFn: async () => {
            const res = await api.get('/timeline');
            return res.data;
        }
    });

    if (isLoading) return <div className="p-8">Loading timeline...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Legal Timeline</h1>
                <p className="text-slate-500 dark:text-slate-400">Chronological view of extracted dates and events</p>
            </header>

            {/* Vertical Timeline Container */}
            <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-4 space-y-8">
                {events?.map((event, idx) => (
                    <div key={idx} className="relative pl-8">
                        {/* Timeline Dot Indicator */}
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-primary"></div>

                        {/* Event Card */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-2 mb-2">
                                <Calendar size={16} className="text-primary" />
                                <span className="font-bold text-slate-900 dark:text-white">{event.date}</span>
                                <span className="text-slate-400 text-sm">• {event.source}</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300">{event.event}</p>
                            <button className="mt-4 text-sm text-primary font-medium flex items-center hover:underline">
                                View Context <ArrowRight size={14} className="ml-1" />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {(!events || events.length === 0) && (
                    <div className="pl-8 text-slate-500">No timeline events found yet. Upload documents with dates.</div>
                )}
            </div>
        </div>
    );
};

export default Timeline;
