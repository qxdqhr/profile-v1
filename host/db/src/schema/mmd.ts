/**
 * 宿主聚合 schema：仅资源表（mmd_models 等）。
 * playlist 管理表留在 sa2kit drizzle-schema，按需单独接入，避免本刀误扩 migrate 面。
 */
export {
  mmdModels,
  mmdAnimations,
  mmdAudios,
  mmdScenes,
  mmdModelFavorites,
  mmdAnimationFavorites,
  mmdModelsRelations,
  mmdAnimationsRelations,
  mmdAudiosRelations,
  mmdScenesRelations,
  mmdModelFavoritesRelations,
  mmdAnimationFavoritesRelations,
} from 'sa2kit/business/mmd/server';
