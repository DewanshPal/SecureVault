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
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Password Generator</h2>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Generated Password */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="text"
            value={password}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            onClick={handleCopyPassword}
            disabled={!password}
            className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-md transition-colors"
            title="Copy password"
          >
            <Copy size={18} />
          </button>
          <button
            onClick={handleGeneratePassword}
            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
            title="Generate new password"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Password Strength */}
        {password && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Strength:</span>
              <span className={`font-semibold ${
                strength.score >= 80 ? 'text-green-600' :
                strength.score >= 60 ? 'text-yellow-600' :
                strength.score >= 40 ? 'text-orange-600' :
                'text-red-600'
              }`}>
                {getStrengthText(strength.score)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(strength.score)}`}
                style={{ width: `${strength.score}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Basic Options */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Length: {options.length}
          </label>
          <input
            type="range"
            min="8"
            max="128"
            value={options.length}
            onChange={(e) => updateOption('length', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>8</span>
            <span>128</span>
          </div>
        </div>

        {showAdvanced && (
          <div className="space-y-3 border-t dark:border-gray-700 pt-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Character Types</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeUppercase}
                  onChange={(e) => updateOption('includeUppercase', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Uppercase (A-Z)</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeLowercase}
                  onChange={(e) => updateOption('includeLowercase', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Lowercase (a-z)</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeNumbers}
                  onChange={(e) => updateOption('includeNumbers', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Numbers (0-9)</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeSymbols}
                  onChange={(e) => updateOption('includeSymbols', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Symbols (!@#$...)</span>
              </label>
            </div>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.excludeSimilar}
                onChange={(e) => updateOption('excludeSimilar', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Exclude similar characters (i, l, 1, L, o, 0, O)
              </span>
            </label>
          </div>
        )}

        {/* Strength Feedback */}
        {password && strength.feedback.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              Suggestions:
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              {strength.feedback.map((tip, index) => (
                <li key={index}>• {tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
