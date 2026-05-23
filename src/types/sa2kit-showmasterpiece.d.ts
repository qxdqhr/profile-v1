/**
 * ShowMasterpiece 类型补丁：仅补充主入口未导出的预订类型与页面组件。
 * server 等子路径以 node_modules/sa2kit 自带声明为准，勿在此用 any 覆盖。
 */
declare module 'sa2kit/showmasterpiece' {
  import type { ComponentType } from 'react';

  export type BookingStatus =
    | 'pending'
    | 'confirmed'
    | 'completed'
    | 'cancelled';

  export interface CreateBookingRequest {
    collectionId: number;
    qqNumber: string;
    phoneNumber: string;
    quantity: number;
    notes?: string;
  }

  export interface UpdateBookingRequest {
    status?: BookingStatus;
    adminNotes?: string;
  }

  export interface BookingListParams {
    collectionId?: number;
    qqNumber?: string;
    phoneNumber?: string;
    status?: BookingStatus;
    page?: number;
    limit?: number;
  }

  export const ShowMasterPiecesPage: ComponentType;
  export const ShowMasterPiecesConfigPage: ComponentType;
  export const ShowMasterPiecesHistoryPage: ComponentType;
}
