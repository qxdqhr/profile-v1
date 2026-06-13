import {
  filterChatModels,
  filterVisionModels as filterVisionModelsBase,
  isKnownTextOnlyModel,
  isLikelyVisionModel as isLikelyVisionModelBase,
  pickDefaultVisionModel as pickDefaultVisionModelBase,
} from 'sa2kit/common/aiApi';
import { isMimoVisionCapableModel } from './mimoVisionModels';

export { filterChatModels, isKnownTextOnlyModel };

export function isLikelyVisionModel(id: string): boolean {
  if (isMimoVisionCapableModel(id)) return true;
  return isLikelyVisionModelBase(id);
}

export function filterVisionModels(modelIds: string[]): string[] {
  const fromSa2kit = filterVisionModelsBase(modelIds);
  const mimo = modelIds.filter(isMimoVisionCapableModel);
  return [...new Set([...fromSa2kit, ...mimo])].sort((a, b) => a.localeCompare(b));
}

export function pickDefaultVisionModel(
  modelIds: string[],
  currentVisionModel?: string
): string | undefined {
  const mimoPreferred = modelIds.find((id) => id === 'mimo-v2.5' || isMimoVisionCapableModel(id));
  if (mimoPreferred) return mimoPreferred;
  return pickDefaultVisionModelBase(modelIds, currentVisionModel);
}
