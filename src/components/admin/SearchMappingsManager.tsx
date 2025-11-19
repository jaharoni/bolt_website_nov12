import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Save, X, Search } from 'lucide-react';

interface SearchMapping {
    id: string;
    keyword: string;
    target_route: string;
    created_at: string;
}

export default function SearchMappingsManager() {
    const [mappings, setMappings] = useState<SearchMapping[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newKeyword, setNewKeyword] = useState('');
    const [newRoute, setNewRoute] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMappings();
    }, []);

    const fetchMappings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('search_mappings')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMappings(data || []);
        } catch (err: any) {
            console.error('Error fetching mappings:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyword.trim() || !newRoute.trim()) return;

        try {
            const { error } = await supabase
                .from('search_mappings')
                .insert([{
                    keyword: newKeyword.trim().toLowerCase(),
                    target_route: newRoute.trim()
                }]);

            if (error) throw error;

            setNewKeyword('');
            setNewRoute('');
            setIsAdding(false);
            fetchMappings();
        } catch (err: any) {
            console.error('Error adding mapping:', err);
            setError(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this mapping?')) return;

        try {
            const { error } = await supabase
                .from('search_mappings')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchMappings();
        } catch (err: any) {
            console.error('Error deleting mapping:', err);
            setError(err.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display text-white">Search Logic</h2>
                    <p className="text-white/60">Manage keyword redirects for the search bar</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Mapping
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            {isAdding && (
                <div className="glass-card p-6 animate-in slide-in-from-top-2">
                    <form onSubmit={handleAdd} className="flex items-end gap-4">
                        <div className="flex-1">
                            <label className="block text-sm text-white/60 mb-2">Keyword</label>
                            <input
                                type="text"
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                placeholder="e.g., hire"
                                className="input-glass-dark w-full"
                                autoFocus
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm text-white/60 mb-2">Target Route</label>
                            <input
                                type="text"
                                value={newRoute}
                                onChange={(e) => setNewRoute(e.target.value)}
                                placeholder="e.g., /contact"
                                className="input-glass-dark w-full"
                            />
                        </div>
                        <div className="flex items-center gap-2 pb-1">
                            <button type="submit" className="btn-primary p-2">
                                <Save className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="btn-secondary p-2"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass-card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="p-4 text-white/60 font-medium">Keyword</th>
                            <th className="p-4 text-white/60 font-medium">Target Route</th>
                            <th className="p-4 text-white/60 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-white/40">
                                    Loading mappings...
                                </td>
                            </tr>
                        ) : mappings.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-white/40">
                                    No mappings found. Add one to get started.
                                </td>
                            </tr>
                        ) : (
                            mappings.map((mapping) => (
                                <tr key={mapping.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-white font-mono">
                                        <div className="flex items-center gap-2">
                                            <Search className="w-4 h-4 text-white/40" />
                                            {mapping.keyword}
                                        </div>
                                    </td>
                                    <td className="p-4 text-yellow-400 font-mono">{mapping.target_route}</td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(mapping.id)}
                                            className="text-white/40 hover:text-red-400 transition-colors"
                                            title="Delete mapping"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
