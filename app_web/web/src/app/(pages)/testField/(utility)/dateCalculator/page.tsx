import { redirect } from 'next/navigation';

/** Legacy testField → 正式路径 /tools/date-calculator */
export default function DateCalculatorLegacyRedirect() {
  redirect('/tools/date-calculator');
}
