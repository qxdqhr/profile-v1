'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Database, Image, Tag, Save, RotateCcw, Plus, Edit, Trash2, ArrowUpDown, Calendar, RefreshCw, Bell, Cog, Activity } from 'lucide-react';
import { useMasterpiecesConfig, useBookingAdmin } from '../../hooks';
import { ConfigFormData, CollectionFormData, ArtworkFormData, CollectionCategory, CollectionCategoryType, getAvailableCategories, getCategoryDisplayName } from '../../types';
import { 
  UniversalImageUpload, 
  CollectionOrderManagerV2 as CollectionOrderManager,
  ArtworkOrderManagerV2 as ArtworkOrderManager,
  BookingAdminPanel,
  PopupConfigManagement,
  SystemConfigManager,
  EventSelector,
  MultiEventOverview
} from '../../components';
import { shouldUseUniversalFileService, getStorageModeDisplayName } from '../../services';
import { AuthGuard, AuthProvider } from '@/modules/auth';
import { 
  Button, 
  Input, 
  Label, 
  Textarea, 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Tabs, TabsContent, TabsList, TabsTrigger,
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
  Badge,
  Separator,
  ScrollArea,
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from 'sa2kit';

type TabType = 'general' | 'collections' | 'artworks' | 'bookings' | 'popup' | 'system' | 'events';

// ... (rest of the file remains the same)
