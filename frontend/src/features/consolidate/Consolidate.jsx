/**
 * Memory Consolidation Feature
 * 
 * This component provides an interface to trigger the memory consolidation process.
 * It allows users to group related document chunks and view the generated summaries.
 */

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Layers, CheckCircle } from 'lucide-react';
import api from '../../api/client';

const Consolidate = () => {
    const [result, setResult] = useState(null);

    // Mutation to trigger the consolidation endpoint
    const consolidateMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post('/consolidate', { threshold: 0.75 });
            return res.data;
        },
        onSuccess: (data) => {
            setResult(data);
        }
    });

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Memory Consolidation</h1>
                <p className="text-slate-500 dark:text-slate-400">Group and summarize related memory chunks</p>
            </header>

            {/* Action Card */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                <div className="bg-blue-50 dark:bg-blue-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Layers size={40} className="text-blue-500" />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Run Consolidation</h2>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                    This process analyzes all memory chunks, identifies clusters, and generates higher-level summaries to improve retrieval quality.
                </p>
                <button
                    onClick={() => consolidateMutation.mutate()}
                    disabled={consolidateMutation.isPending}
                    className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                    {consolidateMutation.isPending ? 'Consolidating...' : 'Start Consolidation'}
                </button>
            </div>

            {/* Results Display */}
            {result && (
                <div className="mt-8 space-y-4">
                    <div className="flex items-center space-x-2 text-green-600 mb-4">
                        <CheckCircle size={20} />
                        <span className="font-medium">{result.message}</span>
                    </div>

                    <div className="grid gap-4">
                        {result.consolidated_groups.map((group) => (
                            <div key={group.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-slate-900 dark:text-white">{group.source}</h3>
                                    <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs">
                                        {group.member_count} chunks
                                    </span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400">{group.summary}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Consolidate;
