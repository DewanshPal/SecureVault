'use client';

import React, { useState, useEffect } from 'react';
import { generatePassword, calculatePasswordStrength, type PasswordOptions } from '@/lib/passwordGenerator';
import { copyToClipboardWithClear, showNotification } from '@/lib/clipboard';
import { Copy, RefreshCw, Settings } from 'lucide-react';

interface PasswordGeneratorProps {
  onPasswordGenerated?: (password: string) => void;
  className?: string;
}

export default function PasswordGenerator({ onPasswordGenerated, className = '' }: PasswordGeneratorProps) {
  const [password, setPassword] = useState('');
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [strength, setStrength] = useState({ score: 0, feedback: [] as string[] });

  const handleGeneratePassword = () => {
    try {
      const newPassword = generatePassword(options);
      setPassword(newPassword);
      setStrength(calculatePasswordStrength(newPassword));
      onPasswordGenerated?.(newPassword);
    } catch (error) {
      showNotification('Please select at least one character type', 'error');
    }
  };

  const handleCopyPassword = async () => {
    if (!password) return;
    
    const success = await copyToClipboardWithClear(password, 15);
    if (success) {
      showNotification('Password copied! Will clear in 15 seconds', 'success');
    } else {
      showNotification('Failed to copy password', 'error');
    }
  };

  const updateOption = (key: keyof PasswordOptions, value: boolean | number) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    handleGeneratePassword();
  }, [options]);

  const getStrengthColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStrengthText = (score: number) => {
    if (score >= 80) return 'Very Strong';
    if (score >= 60) return 'Strong';
    if (score >= 40) return 'Fair';
    return 'Weak';
  };

  return (
    <div className={`modern-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
            <RefreshCw className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold gradient-text">Password Generator</h2>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="modern-icon-button"
          title={showAdvanced ? "Hide advanced options" : "Show advanced options"}
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Generated Password Display */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            value={password}
            readOnly
            className="modern-input flex-1 font-mono text-sm bg-gray-50/50 dark:bg-gray-800/50 text-center"
            placeholder="Click generate to create a password..."
          />
          <button
            onClick={handleCopyPassword}
            disabled={!password}
            className="modern-icon-button p-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white"
            title="Copy password"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={handleGeneratePassword}
            className="modern-icon-button p-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            title="Generate new password"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Modern Password Strength Indicator */}
        {password && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Security Strength:</span>
              <span className={`font-bold text-sm px-3 py-1 rounded-full ${
                strength.score >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                strength.score >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                strength.score >= 40 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                {getStrengthText(strength.score)}
              </span>
            </div>
            <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${getStrengthColor(strength.score)}`}
                style={{ width: `${strength.score}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modern Length Slider */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Password Length
            </label>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
              {options.length} characters
            </span>
          </div>
          <input
            type="range"
            min="8"
            max="128"
            value={options.length}
            onChange={(e) => updateOption('length', parseInt(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span className="font-medium">Weak (8)</span>
            <span className="font-medium">Strong (128)</span>
          </div>
        </div>

        {showAdvanced && (
          <div className="space-y-4 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                <Settings className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Advanced Options</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="modern-checkbox-label">
                <input
                  type="checkbox"
                  checked={options.includeUppercase}
                  onChange={(e) => updateOption('includeUppercase', e.target.checked)}
                  className="modern-checkbox"
                />
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Uppercase Letters
                  <span className="block text-xs text-gray-500 dark:text-gray-400">A, B, C...</span>
                </span>
              </label>

              <label className="modern-checkbox-label">
                <input
                  type="checkbox"
                  checked={options.includeLowercase}
                  onChange={(e) => updateOption('includeLowercase', e.target.checked)}
                  className="modern-checkbox"
                />
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Lowercase Letters
                  <span className="block text-xs text-gray-500 dark:text-gray-400">a, b, c...</span>
                </span>
              </label>

              <label className="modern-checkbox-label">
                <input
                  type="checkbox"
                  checked={options.includeNumbers}
                  onChange={(e) => updateOption('includeNumbers', e.target.checked)}
                  className="modern-checkbox"
                />
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Numbers
                  <span className="block text-xs text-gray-500 dark:text-gray-400">0, 1, 2...</span>
                </span>
              </label>

              <label className="modern-checkbox-label">
                <input
                  type="checkbox"
                  checked={options.includeSymbols}
                  onChange={(e) => updateOption('includeSymbols', e.target.checked)}
                  className="modern-checkbox"
                />
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Symbols
                  <span className="block text-xs text-gray-500 dark:text-gray-400">!, @, #...</span>
                </span>
              </label>
            </div>

            <label className="modern-checkbox-label">
              <input
                type="checkbox"
                checked={options.excludeSimilar}
                onChange={(e) => updateOption('excludeSimilar', e.target.checked)}
                className="modern-checkbox"
              />
              <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Exclude Similar Characters
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  Avoid confusing characters like i, l, 1, L, o, 0, O
                </span>
              </span>
            </label>
          </div>
        )}

        {/* Modern Strength Feedback */}
        {password && strength.feedback.length > 0 && (
          <div className="modern-alert bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Security Recommendations:</h4>
                <ul className="text-sm space-y-1">
                  {strength.feedback.map((tip, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
