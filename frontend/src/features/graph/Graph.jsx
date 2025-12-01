/**
 * Semantic Graph Visualization
 * 
 * This component visualizes the relationships between document chunks using an interactive node-link graph.
 * It uses React Flow to render nodes (chunks) and edges (connections).
 */

import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';

const Graph = () => {
    // Fetch graph data from the backend
    const { data: graphData, isLoading } = useQuery({
        queryKey: ['graph'],
        queryFn: async () => {
            const res = await api.get('/semantic_graph');
            return res.data;
        }
    });

    // Transform backend data into React Flow compatible format (nodes and edges)
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        if (!graphData) return { nodes: [], edges: [] };

        const nodes = [];
        const edges = [];

        // Process graph elements
        // Note: A simple random layout is used here. For production, consider using a layout library like Dagre.
        graphData.forEach((el, idx) => {
            if (el.data.source && el.data.target) {
                // It's an edge
                edges.push({
                    id: `e${el.data.source}-${el.data.target}`,
                    source: el.data.source,
                    target: el.data.target,
                    animated: true,
                    style: { stroke: '#3b82f6' }
                });
            } else {
                // It's a node
                nodes.push({
                    id: el.data.id,
                    data: { label: el.data.label },
                    // Random positioning for demonstration
                    position: { x: Math.random() * 500, y: Math.random() * 500 },
                    style: {
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '10px',
                        width: 150,
                        fontSize: '12px'
                    }
                });
            }
        });

        return { nodes, edges };
    }, [graphData]);

    // React Flow state management hooks
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Update graph state when data is loaded
    React.useEffect(() => {
        if (initialNodes.length > 0) {
            setNodes(initialNodes);
            setEdges(initialEdges);
        }
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    if (isLoading) return <div className="p-8">Loading graph...</div>;

    return (
        <div className="h-full w-full bg-slate-50 dark:bg-slate-900">
            <div className="absolute top-4 left-4 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Semantic Graph</h1>
                <p className="text-sm text-slate-500">Visualizing memory connections</p>
            </div>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
            >
                <Background />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
};

export default Graph;
