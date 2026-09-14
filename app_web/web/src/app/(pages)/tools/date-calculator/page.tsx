import { redirect } from 'next/navigation';

/** 主站薄兼容 → utilities 子应用 /tools/date-calculator */
export default function DateCalculatorToolRedirectPage() {
  redirect('/tools/date-calculator');
}
