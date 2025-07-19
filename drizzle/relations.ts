import { relations } from "drizzle-orm/relations";
import { examTypes, examQuestions, comicUniverseCategories, comicUniverseCollections, users, userSessions, calendarConfigs, comicUniverseArtworks, comicUniverseTags, comicUniverseCollectionTags, mmdAudios, calendarEvents, eventShares, recurrenceRules, reminders, ideaLists, ideaItems, mmdModelFavorites, mmdModels, mmdAnimationFavorites, mmdAnimations, mikutapConfigs, mikutapGridCells, mmdScenes, mikutapSoundLibrary, mikutapBackgroundMusic, fileStorageProviders, fileMetadata, fileFolders, fileAccessLogs, fileShares, fileProcessingRecords, fileThumbnails, fileVersions } from "./schema";

export const examQuestionsRelations = relations(examQuestions, ({one}) => ({
	examType: one(examTypes, {
		fields: [examQuestions.examTypeId],
		references: [examTypes.id]
	}),
}));

export const examTypesRelations = relations(examTypes, ({many}) => ({
	examQuestions: many(examQuestions),
}));

export const comicUniverseCollectionsRelations = relations(comicUniverseCollections, ({one, many}) => ({
	comicUniverseCategory: one(comicUniverseCategories, {
		fields: [comicUniverseCollections.categoryId],
		references: [comicUniverseCategories.id]
	}),
	comicUniverseArtworks: many(comicUniverseArtworks),
	comicUniverseCollectionTags: many(comicUniverseCollectionTags),
}));

export const comicUniverseCategoriesRelations = relations(comicUniverseCategories, ({many}) => ({
	comicUniverseCollections: many(comicUniverseCollections),
}));

export const userSessionsRelations = relations(userSessions, ({one}) => ({
	user: one(users, {
		fields: [userSessions.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	userSessions: many(userSessions),
	calendarConfigs: many(calendarConfigs),
	mmdAudios: many(mmdAudios),
	eventShares_sharedWithUserId: many(eventShares, {
		relationName: "eventShares_sharedWithUserId_users_id"
	}),
	eventShares_sharedByUserId: many(eventShares, {
		relationName: "eventShares_sharedByUserId_users_id"
	}),
	calendarEvents: many(calendarEvents),
	ideaLists: many(ideaLists),
	mmdModelFavorites: many(mmdModelFavorites),
	mmdAnimationFavorites: many(mmdAnimationFavorites),
	mmdAnimations: many(mmdAnimations),
	mmdModels: many(mmdModels),
	mmdScenes: many(mmdScenes),
}));

export const calendarConfigsRelations = relations(calendarConfigs, ({one}) => ({
	user: one(users, {
		fields: [calendarConfigs.userId],
		references: [users.id]
	}),
}));

export const comicUniverseArtworksRelations = relations(comicUniverseArtworks, ({one}) => ({
	comicUniverseCollection: one(comicUniverseCollections, {
		fields: [comicUniverseArtworks.collectionId],
		references: [comicUniverseCollections.id]
	}),
}));

export const comicUniverseCollectionTagsRelations = relations(comicUniverseCollectionTags, ({one}) => ({
	comicUniverseTag: one(comicUniverseTags, {
		fields: [comicUniverseCollectionTags.tagId],
		references: [comicUniverseTags.id]
	}),
	comicUniverseCollection: one(comicUniverseCollections, {
		fields: [comicUniverseCollectionTags.collectionId],
		references: [comicUniverseCollections.id]
	}),
}));

export const comicUniverseTagsRelations = relations(comicUniverseTags, ({many}) => ({
	comicUniverseCollectionTags: many(comicUniverseCollectionTags),
}));

export const mmdAudiosRelations = relations(mmdAudios, ({one, many}) => ({
	user: one(users, {
		fields: [mmdAudios.userId],
		references: [users.id]
	}),
	mmdScenes: many(mmdScenes),
}));

export const eventSharesRelations = relations(eventShares, ({one}) => ({
	calendarEvent: one(calendarEvents, {
		fields: [eventShares.eventId],
		references: [calendarEvents.id]
	}),
	user_sharedWithUserId: one(users, {
		fields: [eventShares.sharedWithUserId],
		references: [users.id],
		relationName: "eventShares_sharedWithUserId_users_id"
	}),
	user_sharedByUserId: one(users, {
		fields: [eventShares.sharedByUserId],
		references: [users.id],
		relationName: "eventShares_sharedByUserId_users_id"
	}),
}));

export const calendarEventsRelations = relations(calendarEvents, ({one, many}) => ({
	eventShares: many(eventShares),
	recurrenceRules: many(recurrenceRules),
	reminders: many(reminders),
	user: one(users, {
		fields: [calendarEvents.userId],
		references: [users.id]
	}),
}));

export const recurrenceRulesRelations = relations(recurrenceRules, ({one}) => ({
	calendarEvent: one(calendarEvents, {
		fields: [recurrenceRules.eventId],
		references: [calendarEvents.id]
	}),
}));

export const remindersRelations = relations(reminders, ({one}) => ({
	calendarEvent: one(calendarEvents, {
		fields: [reminders.eventId],
		references: [calendarEvents.id]
	}),
}));

export const ideaListsRelations = relations(ideaLists, ({one, many}) => ({
	user: one(users, {
		fields: [ideaLists.userId],
		references: [users.id]
	}),
	ideaItems: many(ideaItems),
}));

export const ideaItemsRelations = relations(ideaItems, ({one}) => ({
	ideaList: one(ideaLists, {
		fields: [ideaItems.listId],
		references: [ideaLists.id]
	}),
}));

export const mmdModelFavoritesRelations = relations(mmdModelFavorites, ({one}) => ({
	user: one(users, {
		fields: [mmdModelFavorites.userId],
		references: [users.id]
	}),
	mmdModel: one(mmdModels, {
		fields: [mmdModelFavorites.modelId],
		references: [mmdModels.id]
	}),
}));

export const mmdModelsRelations = relations(mmdModels, ({one, many}) => ({
	mmdModelFavorites: many(mmdModelFavorites),
	user: one(users, {
		fields: [mmdModels.userId],
		references: [users.id]
	}),
	mmdScenes: many(mmdScenes),
}));

export const mmdAnimationFavoritesRelations = relations(mmdAnimationFavorites, ({one}) => ({
	user: one(users, {
		fields: [mmdAnimationFavorites.userId],
		references: [users.id]
	}),
	mmdAnimation: one(mmdAnimations, {
		fields: [mmdAnimationFavorites.animationId],
		references: [mmdAnimations.id]
	}),
}));

export const mmdAnimationsRelations = relations(mmdAnimations, ({one, many}) => ({
	mmdAnimationFavorites: many(mmdAnimationFavorites),
	user: one(users, {
		fields: [mmdAnimations.userId],
		references: [users.id]
	}),
	mmdScenes: many(mmdScenes),
}));

export const mikutapGridCellsRelations = relations(mikutapGridCells, ({one}) => ({
	mikutapConfig: one(mikutapConfigs, {
		fields: [mikutapGridCells.configId],
		references: [mikutapConfigs.id]
	}),
}));

export const mikutapConfigsRelations = relations(mikutapConfigs, ({many}) => ({
	mikutapGridCells: many(mikutapGridCells),
	mikutapSoundLibraries: many(mikutapSoundLibrary),
	mikutapBackgroundMusics: many(mikutapBackgroundMusic),
}));

export const mmdScenesRelations = relations(mmdScenes, ({one}) => ({
	mmdModel: one(mmdModels, {
		fields: [mmdScenes.modelId],
		references: [mmdModels.id]
	}),
	mmdAnimation: one(mmdAnimations, {
		fields: [mmdScenes.animationId],
		references: [mmdAnimations.id]
	}),
	mmdAudio: one(mmdAudios, {
		fields: [mmdScenes.audioId],
		references: [mmdAudios.id]
	}),
	user: one(users, {
		fields: [mmdScenes.userId],
		references: [users.id]
	}),
}));

export const mikutapSoundLibraryRelations = relations(mikutapSoundLibrary, ({one}) => ({
	mikutapConfig: one(mikutapConfigs, {
		fields: [mikutapSoundLibrary.configId],
		references: [mikutapConfigs.id]
	}),
}));

export const mikutapBackgroundMusicRelations = relations(mikutapBackgroundMusic, ({one}) => ({
	mikutapConfig: one(mikutapConfigs, {
		fields: [mikutapBackgroundMusic.configId],
		references: [mikutapConfigs.id]
	}),
}));

export const fileMetadataRelations = relations(fileMetadata, ({one, many}) => ({
	fileStorageProvider: one(fileStorageProviders, {
		fields: [fileMetadata.storageProviderId],
		references: [fileStorageProviders.id]
	}),
	fileFolder: one(fileFolders, {
		fields: [fileMetadata.folderId],
		references: [fileFolders.id]
	}),
	fileAccessLogs: many(fileAccessLogs),
	fileProcessingRecords: many(fileProcessingRecords),
	fileThumbnails: many(fileThumbnails),
	fileVersions: many(fileVersions),
}));

export const fileStorageProvidersRelations = relations(fileStorageProviders, ({many}) => ({
	fileMetadata: many(fileMetadata),
}));

export const fileFoldersRelations = relations(fileFolders, ({many}) => ({
	fileMetadata: many(fileMetadata),
}));

export const fileAccessLogsRelations = relations(fileAccessLogs, ({one}) => ({
	fileMetadatum: one(fileMetadata, {
		fields: [fileAccessLogs.fileId],
		references: [fileMetadata.id]
	}),
	fileShare: one(fileShares, {
		fields: [fileAccessLogs.shareId],
		references: [fileShares.id]
	}),
}));

export const fileSharesRelations = relations(fileShares, ({many}) => ({
	fileAccessLogs: many(fileAccessLogs),
}));

export const fileProcessingRecordsRelations = relations(fileProcessingRecords, ({one}) => ({
	fileMetadatum: one(fileMetadata, {
		fields: [fileProcessingRecords.fileId],
		references: [fileMetadata.id]
	}),
}));

export const fileThumbnailsRelations = relations(fileThumbnails, ({one}) => ({
	fileMetadatum: one(fileMetadata, {
		fields: [fileThumbnails.fileId],
		references: [fileMetadata.id]
	}),
}));

export const fileVersionsRelations = relations(fileVersions, ({one}) => ({
	fileMetadatum: one(fileMetadata, {
		fields: [fileVersions.fileId],
		references: [fileMetadata.id]
	}),
}));