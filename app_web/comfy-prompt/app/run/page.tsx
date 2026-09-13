import ComfyPromptAuthShell from '../../lib/ComfyPromptAuthShell';
import { ComfyPromptLayout, RemoteRunPage } from 'sa2kit/business/comfyPrompt/ui/web';

export default function Page() {
  return (
    <ComfyPromptAuthShell>
      <ComfyPromptLayout>
        <RemoteRunPage />
      </ComfyPromptLayout>
    </ComfyPromptAuthShell>
  );
}
