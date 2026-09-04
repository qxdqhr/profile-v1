/** @deprecated 请改引 `sa2kit/business/showmasterpiece/ui/web/types` */
export * from 'sa2kit/business/showmasterpiece/ui/web/types';
export type {
  BookingStatus,
  Booking,
  BookingListParams,
  BookingListResponse,
  CollectionSummary,
  CreateBookingRequest,
  UpdateBookingRequest,
  BookingFormData,
} from 'sa2kit/business/showmasterpiece/ui/web/types/booking';
export {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
} from 'sa2kit/business/showmasterpiece/ui/web/types/booking';
export type {
  Cart,
  CartItem,
  AddToCartRequest,
  UpdateCartItemRequest,
  RemoveFromCartRequest,
  ClearCartRequest,
  CartAction,
  CartState,
  BatchBookingRequest,
  BatchBookingResponse,
} from 'sa2kit/business/showmasterpiece/ui/web/types/cart';
export type {
  PopupConfig,
  NewPopupConfig,
} from 'sa2kit/business/showmasterpiece/ui/web/types/popup';
export type { CartContextState } from 'sa2kit/business/showmasterpiece/ui/web/types/context';
