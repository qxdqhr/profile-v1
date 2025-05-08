import { ReactNode } from 'react';

export interface SocialLink {
  type: string;
  url: string;
  icon?: ReactNode;
}

export interface ProfileData {
  name: string;
  avatar?: string;
  title?: string;
  bio?: string;
  contacts?: Record<string, string>;
  socialLinks?: SocialLink[];
  customContent?: ReactNode;
  badges?: Badge[];
  stats?: Stat[];
}

export interface Badge {
  label: string;
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  icon?: ReactNode;
}

export interface Stat {
  label: string;
  value: string | number;
  icon?: ReactNode;
} 