import mongoose from 'mongoose';

// User Model
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  // 2FA fields
  twoFactorSecret: {
    type: String,
    default: null
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  backupCodes: [{
    code: {
      type: String,
      required: true
    },
    used: {
      type: Boolean,
      default: false
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// VaultItem Model - stores encrypted data
const VaultItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true // This will be encrypted on client side
  },
  username: {
    type: String // Encrypted
  },
  password: {
    type: String // Encrypted
  },
  url: {
    type: String // Encrypted
  },
  notes: {
    type: String // Encrypted
  },
  tags: [{
    type: String // Each tag will be encrypted
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
VaultItemSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const VaultItem = mongoose.models.VaultItem || mongoose.model('VaultItem', VaultItemSchema);

// Types for TypeScript
export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  backupCodes: Array<{
    code: string;
    used: boolean;
  }>;
  createdAt: Date;
}

export interface IVaultItem {
  _id?: string;
  userId: string;
  title: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Client-side decrypted vault item interface
export interface IDecryptedVaultItem {
  _id?: string;
  userId: string;
  title: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

