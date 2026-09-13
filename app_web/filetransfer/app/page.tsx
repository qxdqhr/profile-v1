import FileTransferAuthShell from '../lib/FileTransferAuthShell';
import { FileTransferPage } from 'sa2kit/business/filetransfer/ui/web';

export default function FileTransferHomePage() {
  return (
    <FileTransferAuthShell>
      <FileTransferPage />
    </FileTransferAuthShell>
  );
}
