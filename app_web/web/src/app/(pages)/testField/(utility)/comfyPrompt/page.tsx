import { redirect } from 'next/navigation';

export default function ComfyPromptLegacyRedirect() {
  redirect('/comfy-prompt/prompts');
}
