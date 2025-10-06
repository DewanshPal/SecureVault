'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/helper/AuthContext';
import { useTheme } from '@/helper/ThemeContext';
import { IDecryptedVaultItem } from '@/model/vault.model';
import { encryptVaultItem, decryptVaultItem } from '@/lib/encryption';
import { copyToClipboardWithClear, showNotification } from '@/lib/clipboard';
import VaultItemForm from './VaultItemForm';
import PasswordGenerator from './PasswordGenerator';
import UserSettings from './UserSettings';
import { 
  Plus, 
  Copy, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  LogOut,
  User,
  Key,
  Moon,
  Sun,
  Settings
} from 'lucide-react';

export default function VaultDashboard() {
  const { user, token, encryptionKey, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [vaultItems, setVaultItems] = useState<IDecryptedVaultItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<IDecryptedVaultItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<IDecryptedVaultItem | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showUserSettings, setShowUserSettings] = useState(false);

  // Load vault items
  const loadVaultItems = async () => {
    if (!token || !encryptionKey) return;

    try {
      const response = await fetch('/api/vault', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const decryptedItems = data.vaultItems.map((item: any) => 
          decryptVaultItem(item, encryptionKey)
        );
        setVaultItems(decryptedItems);
        setFilteredItems(decryptedItems);
      } else {
        showNotification('Failed to load vault items', 'error');
      }
    } catch (error) {
      showNotification('Error loading vault items', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Search/filter items
  useEffect(() => {
    if (!searchTerm) {
      setFilteredItems(vaultItems);
    } else {
      const filtered = vaultItems.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.url || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, vaultItems]);

  useEffect(() => {
    loadVaultItems();
  }, [token, encryptionKey]);

  const handleSaveItem = async (itemData: Omit<IDecryptedVaultItem, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!token || !encryptionKey) return;

    try {
      const encryptedItem = encryptVaultItem(itemData, encryptionKey);
      
      const url = selectedItem ? `/api/vault/${selectedItem._id}` : '/api/vault';
      const method = selectedItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(encryptedItem),
      });

      if (response.ok) {
        showNotification(
          selectedItem ? 'Item updated successfully' : 'Item added successfully',
          'success'
        );
        loadVaultItems();
        setSelectedItem(undefined);
      } else {
        const data = await response.json();
        showNotification(data.error || 'Failed to save item', 'error');
      }
    } catch (error) {
      showNotification('Error saving item', 'error');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!token || !confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/vault/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        showNotification('Item deleted successfully', 'success');
        loadVaultItems();
      } else {
        showNotification('Failed to delete item', 'error');
      }
    } catch (error) {
      showNotification('Error deleting item', 'error');
    }
  };

  const togglePasswordVisibility = (itemId: string) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(itemId)) {
      newVisible.delete(itemId);
    } else {
      newVisible.add(itemId);
    }
    setVisiblePasswords(newVisible);
  };

  const copyToClipboard = async (text: string, label: string) => {
    const success = await copyToClipboardWithClear(text, 15);
    if (success) {
      showNotification(`${label} copied! Will clear in 15 seconds`, 'success');
    } else {
      showNotification(`Failed to copy ${label.toLowerCase()}`, 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Modern Header */}
      <header className="glass border-b border-white/20 dark:border-gray-700/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Key className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">SecureVault</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Your digital fortress</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleDarkMode}
                className="modern-icon-button"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button
                onClick={() => setShowUserSettings(true)}
                className="modern-icon-button"
                title="User settings"
              >
                <Settings size={20} />
              </button>
              
              <div className="hidden sm:flex items-center space-x-2 px-3 py-2 glass rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User size={14} className="text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name}</span>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 glass hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 group"
                title="Sign out"
              >
                <LogOut size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-red-500" />
                <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-400 group-hover:text-red-500">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Password Generator Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="modern-card">
              <button
                onClick={() => setShowPasswordGenerator(!showPasswordGenerator)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 rounded-2xl transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                    <Key className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">Password Generator</span>
                </div>
                <Plus className={`h-5 w-5 text-gray-500 dark:text-gray-400 transform transition-transform duration-200 ${showPasswordGenerator ? 'rotate-45' : ''}`} />
              </button>
              
              {showPasswordGenerator && (
                <div className="px-6 pb-6">
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mb-6"></div>
                  <PasswordGenerator />
                </div>
              )}
            </div>
            
            {/* Stats Card */}
            <div className="modern-card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Vault Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Items</span>
                  <span className="font-medium text-gray-900 dark:text-white">{vaultItems.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Filtered Items</span>
                  <span className="font-medium text-gray-900 dark:text-white">{filteredItems.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Vault Items */}
          <div className="lg:col-span-2">
            <div className="modern-card">
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold gradient-text">
                      Your Vault
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedItem(undefined);
                      setIsFormOpen(true);
                    }}
                    className="modern-button bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                {/* Modern Search Bar */}
                <div className="mt-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search your vault..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="modern-input pl-12 bg-gray-50/50 dark:bg-gray-800/50"
                    />
                  </div>
                </div>
              </div>

              {/* Modern Items List */}
              <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {filteredItems.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center">
                      <Key className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {searchTerm ? 'No items found' : 'Your vault is empty'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'Try adjusting your search term.' : 'Add your first secure item to get started!'}
                    </p>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <div key={item._id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-200 group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Key className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                  {item.title}
                                </h3>
                                {item.url && (
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                    title="Open website"
                                  >
                                    <ExternalLink size={18} />
                                  </a>
                                )}
                              </div>
                              {item.notes && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                                  {item.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {item.username && (
                            <div className="flex items-center space-x-3 mb-2 ml-15">
                              <span className="text-sm text-gray-500 dark:text-gray-400 w-20">Username:</span>
                              <span className="text-sm text-gray-900 dark:text-white font-medium">{item.username}</span>
                              <button
                                onClick={() => copyToClipboard(item.username!, 'Username')}
                                className="modern-icon-button-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Copy username"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          )}
                          
                          {item.password && (
                            <div className="flex items-center space-x-3 mb-3 ml-15">
                              <span className="text-sm text-gray-500 dark:text-gray-400 w-20">Password:</span>
                              <span className="text-sm font-mono text-gray-900 dark:text-white">
                                {visiblePasswords.has(item._id!) ? item.password : '••••••••••••'}
                              </span>
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => togglePasswordVisibility(item._id!)}
                                  className="modern-icon-button-sm"
                                  title={visiblePasswords.has(item._id!) ? 'Hide password' : 'Show password'}
                                >
                                  {visiblePasswords.has(item._id!) ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                                <button
                                  onClick={() => copyToClipboard(item.password!, 'Password')}
                                  className="modern-icon-button-sm"
                                  title="Copy password"
                                >
                                  <Copy size={14} />
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3 ml-15">
                              {item.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-200"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setIsFormOpen(true);
                            }}
                            className="modern-icon-button hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                            title="Edit item"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item._id!)}
                            className="modern-icon-button hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                            title="Delete item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vault Item Form Modal */}
      <VaultItemForm
        item={selectedItem}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedItem(undefined);
        }}
        onSave={handleSaveItem}
      />

      {/* User Settings Modal */}
      <UserSettings
        isOpen={showUserSettings}
        onClose={() => setShowUserSettings(false)}
      />
    </div>
  );
}
