import {
  checkAppConfigFromFile,
  logConfigDoctorReport,
  resolveAppConfigPath,
} from 'sa2kit/common/config/bootstrap';
import { loadAppConfig } from 'sa2kit/common/config/bootstrap';

loadAppConfig({ logDoctor: false });

const filePath = process.argv[2] ?? resolveAppConfigPath();
const { report } = checkAppConfigFromFile(filePath);
logConfigDoctorReport(report, { force: true });
process.exit(report.ok ? 0 : 1);
