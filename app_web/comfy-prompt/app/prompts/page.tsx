import ComfyPromptAuthShell from '../../lib/ComfyPromptAuthShell';
import { ComfyPromptLayout, ComfyPromptPage } from 'sa2kit/business/comfyPrompt/ui/web';

export default function Page() {
  return (
    <ComfyPromptAuthShell>
      <ComfyPromptLayout>
        <ComfyPromptPage />
      </ComfyPromptLayout>
    </ComfyPromptAuthShell>
  );
}
