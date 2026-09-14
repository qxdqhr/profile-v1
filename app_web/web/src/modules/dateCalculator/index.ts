/**
 * 薄兼容层（Phase H2）：实现已迁至 sa2kit/business/webTools/dateCalculator。
 * 正式入口：/tools/date-calculator
 */
export {
  DateCalculatorTool,
  DateCalculatorDemoPage,
  type DateCalculatorToolProps,
} from 'sa2kit/business/webTools/dateCalculator';
export type * from 'sa2kit/business/webTools/dateCalculator/domain';
export {
  parseYmd,
  formatYmd,
  todayYmd,
  computeInterval,
  shiftDate,
  calendarBreakdown,
} from 'sa2kit/business/webTools/dateCalculator/domain';
