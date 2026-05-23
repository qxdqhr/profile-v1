/**
 * sa2kit@1.6.115 删单 API 前瞻类型（npm 仍为 1.6.114 时供 profile-v1 编译）。
 * 发版并升级依赖后可删除本文件，改由 node_modules 声明为准。
 */
declare module 'sa2kit/showmasterpiece/server' {
  export interface BookingDeleteCredentials {
    qqNumber: string;
    phoneNumber: string;
  }

  export interface DeleteBookingOptions {
    asAdmin?: boolean;
    credentials?: BookingDeleteCredentials;
  }

  export type BookingCommandErrorCode =
    | 'INVALID_BOOKING_ID'
    | 'BOOKING_NOT_FOUND'
    | 'INVALID_PAYLOAD'
    | 'INVALID_PHONE'
    | 'INVALID_QQ'
    | 'INVALID_QUANTITY'
    | 'COLLECTION_NOT_FOUND'
    | 'INVALID_STATUS'
    | 'UNAUTHORIZED';

  export class BookingCommandError extends Error {
    readonly code: BookingCommandErrorCode;
    constructor(code: BookingCommandErrorCode, message: string);
  }

  interface BookingCommandService {
    deleteBooking(id: number, options?: DeleteBookingOptions): Promise<void>;
  }
}
