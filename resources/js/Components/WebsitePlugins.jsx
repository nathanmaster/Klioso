import { useState } from 'react';
import { router } from '@inertiajs/react';
import Button from '@/Components/Button';
import Form from '@/Components/Form';

export default function WebsitePlugins({ website, allPlugins = [], websitePlugins = [] }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedPlugin, setSelectedPlugin] = useState('');
    const [version, setVersion] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);

    // Safety checks for props
    if (!website || !website.id) {
        return <div className="text-red-500">Error: Website data is missing</div>;
    }

    // Ensure arrays are always arrays
    const safeAllPlugins = Array.isArray(allPlugins) ? allPlugins : [];
    const safeWebsitePlugins = Array.isArray(websitePlugins) ? websitePlugins : [];

    // Get plugins that are not yet attached to this website
    const availablePlugins = safeAllPlugins.filter(plugin => 
        !safeWebsitePlugins.some(wp => wp.id === plugin.id)
    );

    const handleAddPlugin = (e) => {
        e.preventDefault();
        if (!selectedPlugin) return;

        setLoading(true);
        router.post(`/websites/${website.id}/plugins`, {
            plugin_id: selectedPlugin,
            version: version,
            is_active: isActive
        }, {
            onSuccess: () => {
                setShowAddForm(false);
                setSelectedPlugin('');
                setVersion('');
                setIsActive(true);
                setLoading(false);
            },
            onError: () => {
                setLoading(false);
            }
        });
    };

    const handleUpdatePlugin = (pluginId, newVersion, newIsActive) => {
        router.put(`/websites/${website.id}/plugins/${pluginId}`, {
            version: newVersion,
            is_active: newIsActive
        });
    };

    const handleRemovePlugin = (pluginId) => {
        if (confirm('Are you sure you want to remove this plugin from the website?')) {
            router.delete(`/websites/${website.id}/plugins/${pluginId}`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Website Plugins</h3>
                {availablePlugins.length > 0 && (
                    <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
                        {showAddForm ? 'Cancel' : 'Add Plugin'}
                    </Button>
                )}
            </div>

            {/* Add Plugin Form */}
            {showAddForm && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <h4 className="font-medium mb-3">Add Plugin to Website</h4>
                    <form onSubmit={handleAddPlugin} className="space-y-3">
                        <Form.Select
                            label="Plugin"
                            value={selectedPlugin}
                            onChange={e => setSelectedPlugin(e.target.value)}
                            required
                        >
                            <option value="">Select a plugin</option>
                            {availablePlugins.map(plugin => (
                                <option key={plugin.id} value={plugin.id}>
                                    {plugin.name}
                                </option>
                            ))}
                        </Form.Select>
                        
                        <Form.Input
                            label="Version"
                            value={version}
                            onChange={e => setVersion(e.target.value)}
                            placeholder="1.0.0"
                        />
                        
                        <Form.Checkbox
                            label="Active"
                            checked={isActive}
                            onChange={e => setIsActive(e.target.checked)}
                        />
                        
                        <div className="flex gap-2">
                            <Button type="submit" disabled={loading} size="sm">
                                {loading ? 'Adding...' : 'Add Plugin'}
                            </Button>
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => setShowAddForm(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Current Plugins */}
            {safeWebsitePlugins.length > 0 ? (
                <div className="space-y-3">
                    {safeWebsitePlugins.map(plugin => (
                        <div key={plugin.id} className="bg-white border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h4 className="font-medium">{plugin.name}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{plugin.description}</p>
                                    <div className="flex gap-4 mt-2 text-sm">
                                        <span>
                                            <strong>Version:</strong> {plugin.pivot?.version || 'Not specified'}
                                        </span>
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            plugin.pivot?.is_active 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {plugin.pivot?.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <Button
                                        onClick={() => {
                                            const newVersion = prompt('Enter new version:', plugin.pivot?.version || '');
                                            if (newVersion !== null) {
                                                handleUpdatePlugin(plugin.id, newVersion, plugin.pivot?.is_active);
                                            }
                                        }}
                                        size="sm"
                                        variant="outline"
                                    >
                                        Update
                                    </Button>
                                    <Button
                                        onClick={() => handleUpdatePlugin(
                                            plugin.id, 
                                            plugin.pivot?.version, 
                                            !plugin.pivot?.is_active
                                        )}
                                        size="sm"
                                        variant="outline"
                                    >
                                        {plugin.pivot?.is_active ? 'Deactivate' : 'Activate'}
                                    </Button>
                                    <Button
                                        onClick={() => handleRemovePlugin(plugin.id)}
                                        size="sm"
                                        className="text-red-600 border-red-300 hover:bg-red-50"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <p>No plugins assigned to this website yet.</p>
                    {availablePlugins.length > 0 && (
                        <Button 
                            onClick={() => setShowAddForm(true)} 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                        >
                            Add First Plugin
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
