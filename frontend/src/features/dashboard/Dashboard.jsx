/**
 * Dashboard Feature
 * 
 * This component serves as the main landing page for the application.
 * It displays system statistics, provides a document upload interface,
 * and lists recently ingested documents.
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, Database, Layers, Clock } from 'lucide-react';
import api from '../../api/client';

const Dashboard = () => {
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');

    // Fetch system statistics
    const { data: stats } = useQuery({
        queryKey: ['stats'],
        queryFn: async () => {
            // Mock stats for now as backend doesn't have a stats endpoint yet
            // In a real app, we'd fetch this from /stats
            return {
                documents: 4,
                vectors: 1250,
                memories: 12,
                interactions: 45
            };
        }
    });

    // Mutation for handling file uploads
    const uploadMutation = useMutation({
        mutationFn: async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data;
        },
        onSuccess: (data) => {
            setUploadStatus(`Success: ${data.message}`);
            setUploading(false);
            // Refresh document list after successful upload
            queryClient.invalidateQueries(['documents']);
        },
        onError: (err) => {
            setUploadStatus(`Error: ${err.message}`);
            setUploading(false);
        }
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploading(true);
            setUploadStatus('Uploading and processing...');
            uploadMutation.mutate(file);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400">System Overview & Ingestion</p>
            </header>

            {/* Statistics Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard icon={<FileText />} label="Documents" value={stats?.documents || '-'} color="bg-blue-500" />
                <StatCard icon={<Database />} label="Vectors" value={stats?.vectors || '-'} color="bg-purple-500" />
                <StatCard icon={<Layers />} label="Consolidated" value={stats?.memories || '-'} color="bg-green-500" />
                <StatCard icon={<Clock />} label="Interactions" value={stats?.interactions || '-'} color="bg-orange-500" />
            </div>

            {/* Document Upload Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Ingest New Document</h2>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-12 text-center hover:border-primary transition-colors">
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".pdf"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                        <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-full mb-4">
                            <Upload className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                        </div>
                        <span className="text-lg font-medium text-slate-700 dark:text-slate-200">
                            {uploading ? 'Processing...' : 'Click to upload PDF'}
                        </span>
                        <span className="text-sm text-slate-500 mt-2">
                            Supported: Confidentiality Agreements, NDAs, Contracts
                        </span>
                    </label>
                </div>
                {uploadStatus && (
                    <div className={`mt-4 p-4 rounded-lg ${uploadStatus.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {uploadStatus}
                    </div>
                )}
            </div>

            {/* Recent Documents List (Placeholder) */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent Ingestions</h2>
                </div>
                <div className="p-6">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                                <th className="pb-3 font-medium">Document Name</th>
                                <th className="pb-3 font-medium">Date</th>
                                <th className="pb-3 font-medium">Status</th>
                                <th className="pb-3 font-medium">Chunks</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-700 dark:text-slate-300">
                            <tr className="border-b border-slate-100 dark:border-slate-700">
                                <td className="py-4">CONFIDENTIALITY_IP_ASSIGNMENT.pdf</td>
                                <td className="py-4">Just now</td>
                                <td className="py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Indexed</span></td>
                                <td className="py-4">124</td>
                            </tr>
                            <tr>
                                <td className="py-4">NON_DISCLOSURE_AGREEMENT.pdf</td>
                                <td className="py-4">2 hours ago</td>
                                <td className="py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Indexed</span></td>
                                <td className="py-4">89</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

/**
 * Statistic Card Component
 * 
 * Displays a single statistic with an icon and label.
 */
const StatCard = ({ icon, label, value, color }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-${color.replace('bg-', '')}`}>
            {React.cloneElement(icon, { className: `text-${color.replace('bg-', '')}-500` })}
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    </div>
);

export default Dashboard;
