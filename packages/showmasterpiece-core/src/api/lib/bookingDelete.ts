import type { BookingCredentials } from './bookingCredentials';
import { bookingMatchesLookup } from './bookingAccess';
import {
  bookingCommandService,
  bookingQueryService,
} from './bookingServices';
import {
  BookingCommandError,
  type DeleteBookingOptions,
} from '@profile/showmasterpiece-core/server';

/**
 * 删单：宿主先校验（兼容 sa2kit@1.6.114）；1.6.115+ Command 层二次校验。
 * 删单校验在宿主 bookingDelete；下沉 sa2kit business 时迁入 server 层。
 */
export async function deleteBookingWithCredentialGuard(
  id: number,
  options: { isAdmin: boolean; credentials: BookingCredentials | null },
): Promise<void> {
  const booking = await bookingQueryService.getBookingById(id);
  if (!booking) {
    throw new BookingCommandError('BOOKING_NOT_FOUND', '预订不存在');
  }

  if (!options.isAdmin) {
    const { credentials } = options;
    if (
      !credentials ||
      !bookingMatchesLookup(
        booking,
        credentials.qqNumber,
        credentials.phoneNumber,
      )
    ) {
      throw new BookingCommandError(
        'INVALID_PAYLOAD',
        '删除预订请同时提供匹配的 QQ 号与手机号',
      );
    }
  }

  const deleteOptions: DeleteBookingOptions | undefined = options.isAdmin
    ? { asAdmin: true }
    : options.credentials
      ? {
          credentials: {
            qqNumber: options.credentials.qqNumber,
            phoneNumber: options.credentials.phoneNumber,
          },
        }
      : undefined;

  await bookingCommandService.deleteBooking(id, deleteOptions);
}

export function isBookingDeleteUnauthorized(
  error: BookingCommandError,
): boolean {
  return (
    error.code === 'UNAUTHORIZED' ||
    (error.code === 'INVALID_PAYLOAD' &&
      error.message.includes('删除预订'))
  );
}
