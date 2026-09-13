import ComfyPromptAuthShell from '../../lib/ComfyPromptAuthShell';
import { ComfyPromptLayout, PromptPlazaPage } from 'sa2kit/business/comfyPrompt/ui/web';

export default function Page() {
  return (
    <ComfyPromptAuthShell>
      <ComfyPromptLayout>
        <PromptPlazaPage />
      </ComfyPromptLayout>
    </ComfyPromptAuthShell>
  );
}
