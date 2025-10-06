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
  Search, 
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Key className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">SecureVault</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button
                onClick={() => setShowUserSettings(true)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Settings size={20} />
              </button>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <User size={16} />
                <span>{user?.name}</span>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Password Generator */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <button
                onClick={() => setShowPasswordGenerator(!showPasswordGenerator)}
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <span className="font-medium text-gray-900 dark:text-white">Password Generator</span>
                <Plus className={`h-5 w-5 transform transition-transform ${showPasswordGenerator ? 'rotate-45' : ''}`} />
              </button>
            </div>
            
            {showPasswordGenerator && (
              <PasswordGenerator className="mb-6" />
            )}
          </div>

          {/* Vault Items */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
              <div className="p-6 border-b dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Your Vault ({filteredItems.length})
                  </h2>
                  <button
                    onClick={() => {
                      setSelectedItem(undefined);
                      setIsFormOpen(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    <Plus size={16} />
                    <span>Add Item</span>
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Search vault items..."
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y dark:divide-gray-700">
                {filteredItems.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No items match your search.' : 'No vault items yet. Add your first item!'}
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <div key={item._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                              {item.title}
                            </h3>
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <ExternalLink size={16} />
                              </a>
                            )}
                          </div>
                          
                          {item.username && (
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Username:</span>
                              <span className="text-sm text-gray-900 dark:text-white">{item.username}</span>
                              <button
                                onClick={() => copyToClipboard(item.username!, 'Username')}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          )}
                          
                          {item.password && (
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Password:</span>
                              <span className="text-sm font-mono text-gray-900 dark:text-white">
                                {visiblePasswords.has(item._id!) ? item.password : '••••••••'}
                              </span>
                              <button
                                onClick={() => togglePasswordVisibility(item._id!)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                              >
                                {visiblePasswords.has(item._id!) ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                              <button
                                onClick={() => copyToClipboard(item.password!, 'Password')}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          )}
                          
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setIsFormOpen(true);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item._id!)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
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
