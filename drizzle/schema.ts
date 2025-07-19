import { pgTable, text, timestamp, foreignKey, serial, json, integer, varchar, boolean, index, unique, uuid, real, jsonb, bigint } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const examMetadata = pgTable("exam_metadata", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	lastModified: timestamp("last_modified", { mode: 'string' }).notNull(),
});

export const examQuestions = pgTable("exam_questions", {
	id: serial().primaryKey().notNull(),
	examTypeId: text("exam_type_id").notNull(),
	questionId: text("question_id").notNull(),
	content: text().notNull(),
	type: text().notNull(),
	answer: text(),
	answers: json(),
	score: integer().notNull(),
	specialEffect: json("special_effect"),
	audioUrl: text("audio_url"),
	options: json().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.examTypeId],
			foreignColumns: [examTypes.id],
			name: "exam_questions_exam_type_id_exam_types_id_fk"
		}).onDelete("cascade"),
]);

export const examTypes = pgTable("exam_types", {
	id: text().primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const examResultModals = pgTable("exam_result_modals", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	showDelayTime: integer("show_delay_time").notNull(),
	messages: json().notNull(),
	buttonText: text("button_text").notNull(),
	passingScore: integer("passing_score").notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const examStartScreens = pgTable("exam_start_screens", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	rules: json().notNull(),
	buttonText: text("button_text").notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const comicUniverseConfigs = pgTable("comic_universe_configs", {
	id: serial().primaryKey().notNull(),
	siteName: varchar("site_name", { length: 255 }).default('画集展览').notNull(),
	siteDescription: text("site_description").default('精美的艺术作品展览'),
	heroTitle: varchar("hero_title", { length: 255 }).default('艺术画集展览').notNull(),
	heroSubtitle: text("hero_subtitle").default('探索精美的艺术作品，感受创作的魅力'),
	maxCollectionsPerPage: integer("max_collections_per_page").default(9).notNull(),
	enableSearch: boolean("enable_search").default(true).notNull(),
	enableCategories: boolean("enable_categories").default(true).notNull(),
	defaultCategory: varchar("default_category", { length: 100 }).default('all').notNull(),
	theme: varchar({ length: 20 }).default('light').notNull(),
	language: varchar({ length: 10 }).default('zh').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const comicUniverseCollections = pgTable("comic_universe_collections", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	artist: varchar({ length: 255 }).notNull(),
	coverImage: text("cover_image").notNull(),
	description: text(),
	categoryId: integer("category_id"),
	isPublished: boolean("is_published").default(true).notNull(),
	publishedAt: timestamp("published_at", { mode: 'string' }),
	displayOrder: integer("display_order").default(0),
	viewCount: integer("view_count").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("collections_category_id_idx").using("btree", table.categoryId.asc().nullsLast().op("int4_ops")),
	index("collections_display_order_idx").using("btree", table.displayOrder.asc().nullsLast().op("int4_ops")),
	index("collections_is_published_idx").using("btree", table.isPublished.asc().nullsLast().op("bool_ops")),
	index("collections_published_created_idx").using("btree", table.isPublished.asc().nullsLast().op("timestamp_ops"), table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("collections_published_order_idx").using("btree", table.isPublished.asc().nullsLast().op("bool_ops"), table.displayOrder.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [comicUniverseCategories.id],
			name: "comic_universe_collections_category_id_comic_universe_categorie"
		}).onDelete("set null"),
]);

export const comicUniverseTags = pgTable("comic_universe_tags", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	color: varchar({ length: 7 }).default('#3b82f6'),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("tags_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	unique("comic_universe_tags_name_unique").on(table.name),
]);

export const userSessions = pgTable("user_sessions", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	sessionToken: varchar("session_token", { length: 255 }).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_sessions_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("user_sessions_session_token_unique").on(table.sessionToken),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	phone: varchar({ length: 20 }).notNull(),
	name: varchar({ length: 100 }),
	email: varchar({ length: 255 }),
	isActive: boolean("is_active").default(true).notNull(),
	role: varchar({ length: 20 }).default('user').notNull(),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	password: varchar({ length: 255 }).notNull(),
}, (table) => [
	unique("users_phone_unique").on(table.phone),
]);

export const verificationCodes = pgTable("verification_codes", {
	id: serial().primaryKey().notNull(),
	phone: text().notNull(),
	code: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	used: boolean().default(false).notNull(),
});

export const fileTransfers = pgTable("file_transfers", {
	id: text().primaryKey().notNull(),
	fileName: text("file_name").notNull(),
	fileType: text("file_type").notNull(),
	fileSize: integer("file_size").notNull(),
	filePath: text("file_path").notNull(),
	uploaderId: text("uploader_id").notNull(),
	status: text().default('pending').notNull(),
	progress: integer().default(0).notNull(),
	downloadCount: integer("download_count").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
});

export const calendarConfigs = pgTable("calendar_configs", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	firstDayOfWeek: integer("first_day_of_week").default(1).notNull(),
	workingHoursStart: varchar("working_hours_start", { length: 5 }).default('09:00').notNull(),
	workingHoursEnd: varchar("working_hours_end", { length: 5 }).default('18:00').notNull(),
	timeZone: varchar("time_zone", { length: 50 }).default('Asia/Shanghai').notNull(),
	dateFormat: varchar("date_format", { length: 20 }).default('YYYY-MM-DD').notNull(),
	timeFormat: varchar("time_format", { length: 20 }).default('HH:mm').notNull(),
	defaultView: varchar("default_view", { length: 20 }).default('month').notNull(),
	defaultEventColor: varchar("default_event_color", { length: 7 }).default('#3B82F6').notNull(),
	weekends: boolean().default(true).notNull(),
	eventColors: json("event_colors").default({"blue":"#3B82F6","green":"#10B981","purple":"#8B5CF6","red":"#EF4444","yellow":"#F59E0B","pink":"#EC4899","indigo":"#6366F1","gray":"#6B7280"}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "calendar_configs_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("calendar_configs_user_id_unique").on(table.userId),
]);

export const comicUniverseCategories = pgTable("comic_universe_categories", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	displayOrder: integer("display_order").default(0),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("categories_display_order_idx").using("btree", table.displayOrder.asc().nullsLast().op("int4_ops")),
	index("categories_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	unique("comic_universe_categories_name_unique").on(table.name),
]);

export const comicUniverseArtworks = pgTable("comic_universe_artworks", {
	id: serial().primaryKey().notNull(),
	collectionId: integer("collection_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	artist: varchar({ length: 255 }).notNull(),
	image: text(),
	description: text(),
	createdTime: varchar("created_time", { length: 20 }),
	theme: varchar({ length: 255 }),
	dimensions: varchar({ length: 100 }),
	pageOrder: integer("page_order").default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	fileId: uuid("file_id"),
	migrationStatus: varchar("migration_status", { length: 20 }).default('pending'),
}, (table) => [
	index("artworks_collection_active_idx").using("btree", table.collectionId.asc().nullsLast().op("bool_ops"), table.isActive.asc().nullsLast().op("bool_ops")),
	index("artworks_collection_active_order_idx").using("btree", table.collectionId.asc().nullsLast().op("bool_ops"), table.isActive.asc().nullsLast().op("bool_ops"), table.pageOrder.asc().nullsLast().op("bool_ops")),
	index("artworks_collection_id_idx").using("btree", table.collectionId.asc().nullsLast().op("int4_ops")),
	index("artworks_collection_order_idx").using("btree", table.collectionId.asc().nullsLast().op("int4_ops"), table.pageOrder.asc().nullsLast().op("int4_ops")),
	index("artworks_file_id_idx").using("btree", table.fileId.asc().nullsLast().op("uuid_ops")),
	index("artworks_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("artworks_migration_status_idx").using("btree", table.migrationStatus.asc().nullsLast().op("text_ops")),
	index("artworks_page_order_idx").using("btree", table.pageOrder.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.collectionId],
			foreignColumns: [comicUniverseCollections.id],
			name: "comic_universe_artworks_collection_id_comic_universe_collection"
		}).onDelete("cascade"),
]);

export const comicUniverseCollectionTags = pgTable("comic_universe_collection_tags", {
	collectionId: integer("collection_id").notNull(),
	tagId: integer("tag_id").notNull(),
}, (table) => [
	index("collection_tags_collection_id_idx").using("btree", table.collectionId.asc().nullsLast().op("int4_ops")),
	index("collection_tags_tag_id_idx").using("btree", table.tagId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.tagId],
			foreignColumns: [comicUniverseTags.id],
			name: "comic_universe_collection_tags_tag_id_comic_universe_tags_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.collectionId],
			foreignColumns: [comicUniverseCollections.id],
			name: "comic_universe_collection_tags_collection_id_comic_universe_col"
		}).onDelete("cascade"),
]);

export const mmdAudios = pgTable("mmd_audios", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	filePath: varchar("file_path", { length: 500 }).notNull(),
	fileSize: integer("file_size").notNull(),
	duration: real().notNull(),
	format: varchar({ length: 10 }).notNull(),
	uploadTime: timestamp("upload_time", { mode: 'string' }).defaultNow().notNull(),
	userId: integer("user_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "mmd_audios_user_id_users_id_fk"
		}).onDelete("set null"),
]);

export const eventShares = pgTable("event_shares", {
	id: serial().primaryKey().notNull(),
	eventId: integer("event_id").notNull(),
	sharedWithUserId: integer("shared_with_user_id").notNull(),
	sharedByUserId: integer("shared_by_user_id").notNull(),
	permission: varchar({ length: 20 }).default('read').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [calendarEvents.id],
			name: "event_shares_event_id_calendar_events_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.sharedWithUserId],
			foreignColumns: [users.id],
			name: "event_shares_shared_with_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.sharedByUserId],
			foreignColumns: [users.id],
			name: "event_shares_shared_by_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const recurrenceRules = pgTable("recurrence_rules", {
	id: serial().primaryKey().notNull(),
	eventId: integer("event_id").notNull(),
	ruleType: varchar("rule_type", { length: 20 }).notNull(),
	interval: integer().default(1).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }),
	count: integer(),
	byWeekday: json("by_weekday"),
	byMonthday: json("by_monthday"),
	byMonth: json("by_month"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [calendarEvents.id],
			name: "recurrence_rules_event_id_calendar_events_id_fk"
		}).onDelete("cascade"),
]);

export const reminders = pgTable("reminders", {
	id: serial().primaryKey().notNull(),
	eventId: integer("event_id").notNull(),
	reminderTime: timestamp("reminder_time", { mode: 'string' }).notNull(),
	reminderType: varchar("reminder_type", { length: 20 }).notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [calendarEvents.id],
			name: "reminders_event_id_calendar_events_id_fk"
		}).onDelete("cascade"),
]);

export const calendarEvents = pgTable("calendar_events", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { mode: 'string' }).notNull(),
	allDay: boolean("all_day").default(false).notNull(),
	location: varchar({ length: 500 }),
	color: varchar({ length: 7 }).default('#3B82F6').notNull(),
	userId: integer("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	priority: varchar({ length: 10 }).default('normal').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "calendar_events_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const ideaLists = pgTable("idea_lists", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	color: varchar({ length: 20 }).default('blue'),
	order: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "idea_lists_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const ideaItems = pgTable("idea_items", {
	id: serial().primaryKey().notNull(),
	listId: integer("list_id").notNull(),
	title: varchar({ length: 200 }).notNull(),
	description: text(),
	isCompleted: boolean("is_completed").default(false).notNull(),
	priority: varchar({ length: 10 }).default('medium').notNull(),
	tags: json().default([]),
	order: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.listId],
			foreignColumns: [ideaLists.id],
			name: "idea_items_list_id_idea_lists_id_fk"
		}).onDelete("cascade"),
]);

export const mmdModelFavorites = pgTable("mmd_model_favorites", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	modelId: integer("model_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "mmd_model_favorites_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.modelId],
			foreignColumns: [mmdModels.id],
			name: "mmd_model_favorites_model_id_mmd_models_id_fk"
		}).onDelete("cascade"),
]);

export const mmdAnimationFavorites = pgTable("mmd_animation_favorites", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	animationId: integer("animation_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "mmd_animation_favorites_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.animationId],
			foreignColumns: [mmdAnimations.id],
			name: "mmd_animation_favorites_animation_id_mmd_animations_id_fk"
		}).onDelete("cascade"),
]);

export const mmdAnimations = pgTable("mmd_animations", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	filePath: varchar("file_path", { length: 500 }).notNull(),
	fileSize: integer("file_size").notNull(),
	duration: real().notNull(),
	frameCount: integer("frame_count").notNull(),
	uploadTime: timestamp("upload_time", { mode: 'string' }).defaultNow().notNull(),
	userId: integer("user_id"),
	tags: json(),
	isPublic: boolean("is_public").default(false).notNull(),
	compatibleModels: json("compatible_models"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "mmd_animations_user_id_users_id_fk"
		}).onDelete("set null"),
]);

export const mikutapGridCells = pgTable("mikutap_grid_cells", {
	id: text().primaryKey().notNull(),
	configId: text("config_id").notNull(),
	row: integer().notNull(),
	col: integer().notNull(),
	key: text(),
	soundType: text("sound_type").notNull(),
	soundSource: text("sound_source").notNull(),
	waveType: text("wave_type").notNull(),
	frequency: real(),
	volume: real(),
	description: text().notNull(),
	icon: text().notNull(),
	color: text().notNull(),
	enabled: boolean().default(true).notNull(),
	audioFile: text("audio_file"),
	effects: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	animationEnabled: boolean("animation_enabled").default(true).notNull(),
	animationType: text("animation_type").default('pulse').notNull(),
	animationData: json("animation_data"),
	animationConfig: json("animation_config"),
}, (table) => [
	foreignKey({
			columns: [table.configId],
			foreignColumns: [mikutapConfigs.id],
			name: "mikutap_grid_cells_config_id_mikutap_configs_id_fk"
		}).onDelete("cascade"),
]);

export const mmdModels = pgTable("mmd_models", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	filePath: varchar("file_path", { length: 500 }).notNull(),
	thumbnailPath: varchar("thumbnail_path", { length: 500 }),
	fileSize: integer("file_size").notNull(),
	format: varchar({ length: 10 }).notNull(),
	uploadTime: timestamp("upload_time", { mode: 'string' }).defaultNow().notNull(),
	userId: integer("user_id"),
	tags: json(),
	isPublic: boolean("is_public").default(false).notNull(),
	downloadCount: integer("download_count").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "mmd_models_user_id_users_id_fk"
		}).onDelete("set null"),
]);

export const mmdScenes = pgTable("mmd_scenes", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	modelId: integer("model_id").notNull(),
	animationId: integer("animation_id"),
	audioId: integer("audio_id"),
	cameraPosition: json("camera_position").notNull(),
	cameraTarget: json("camera_target").notNull(),
	lighting: json().notNull(),
	background: json().notNull(),
	userId: integer("user_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.modelId],
			foreignColumns: [mmdModels.id],
			name: "mmd_scenes_model_id_mmd_models_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.animationId],
			foreignColumns: [mmdAnimations.id],
			name: "mmd_scenes_animation_id_mmd_animations_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.audioId],
			foreignColumns: [mmdAudios.id],
			name: "mmd_scenes_audio_id_mmd_audios_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "mmd_scenes_user_id_users_id_fk"
		}).onDelete("set null"),
]);

export const cardAssets = pgTable("card_assets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	type: varchar({ length: 20 }).notNull(),
	category: varchar({ length: 50 }).notNull(),
	fileUrl: varchar("file_url", { length: 500 }).notNull(),
	thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
	name: varchar({ length: 100 }).notNull(),
	tags: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const cards = pgTable("cards", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: varchar("user_id", { length: 255 }),
	characterName: varchar("character_name", { length: 100 }).notNull(),
	characterDescription: text("character_description"),
	avatarUrl: varchar("avatar_url", { length: 500 }),
	backgroundUrl: varchar("background_url", { length: 500 }),
	config: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const mikutapSoundLibrary = pgTable("mikutap_sound_library", {
	id: text().primaryKey().notNull(),
	configId: text("config_id").notNull(),
	name: text().notNull(),
	file: text().notNull(),
	type: text().notNull(),
	description: text(),
	size: integer(),
	duration: real(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.configId],
			foreignColumns: [mikutapConfigs.id],
			name: "mikutap_sound_library_config_id_mikutap_configs_id_fk"
		}).onDelete("cascade"),
]);

export const mikutapBackgroundMusic = pgTable("mikutap_background_music", {
	id: text().primaryKey().notNull(),
	configId: text("config_id").notNull(),
	name: text().notNull(),
	fileType: text("file_type").default('uploaded').notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	volume: real().default(0.5).notNull(),
	loop: boolean().default(true).notNull(),
	bpm: integer().default(120).notNull(),
	description: text(),
	size: integer(),
	duration: real(),
	generationConfig: json("generation_config"),
	rhythmPattern: json("rhythm_pattern"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	audioData: text("audio_data").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.configId],
			foreignColumns: [mikutapConfigs.id],
			name: "mikutap_background_music_config_id_mikutap_configs_id_fk"
		}).onDelete("cascade"),
]);

export const mikutapConfigs = pgTable("mikutap_configs", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	rows: integer().default(6).notNull(),
	cols: integer().default(5).notNull(),
	soundLibrary: json("sound_library"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	interfaceSettings: json("interface_settings"),
});

export const fileFolders = pgTable("file_folders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	parentId: uuid("parent_id"),
	moduleId: varchar("module_id", { length: 100 }),
	businessId: varchar("business_id", { length: 255 }),
	path: text().notNull(),
	depth: integer().default(0).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	description: text(),
	isSystem: boolean("is_system").default(false).notNull(),
	createdBy: varchar("created_by", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("folders_business_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("folders_module_business_parent_idx").using("btree", table.moduleId.asc().nullsLast().op("text_ops"), table.businessId.asc().nullsLast().op("text_ops"), table.parentId.asc().nullsLast().op("text_ops")),
	index("folders_module_idx").using("btree", table.moduleId.asc().nullsLast().op("text_ops")),
	index("folders_parent_idx").using("btree", table.parentId.asc().nullsLast().op("uuid_ops")),
	index("folders_path_idx").using("btree", table.path.asc().nullsLast().op("text_ops")),
]);

export const fileMetadata = pgTable("file_metadata", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	originalName: varchar("original_name", { length: 500 }).notNull(),
	storedName: varchar("stored_name", { length: 500 }).notNull(),
	extension: varchar({ length: 20 }),
	mimeType: varchar("mime_type", { length: 100 }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	size: bigint({ mode: "number" }).notNull(),
	md5Hash: varchar("md5_hash", { length: 32 }).notNull(),
	sha256Hash: varchar("sha256_hash", { length: 64 }),
	storageProviderId: integer("storage_provider_id").notNull(),
	storagePath: text("storage_path").notNull(),
	cdnUrl: text("cdn_url"),
	folderId: uuid("folder_id"),
	moduleId: varchar("module_id", { length: 100 }),
	businessId: varchar("business_id", { length: 255 }),
	tags: json(),
	metadata: json(),
	isTemporary: boolean("is_temporary").default(false).notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	accessCount: integer("access_count").default(0).notNull(),
	downloadCount: integer("download_count").default(0).notNull(),
	uploaderId: varchar("uploader_id", { length: 255 }).notNull(),
	uploadTime: timestamp("upload_time", { mode: 'string' }).defaultNow().notNull(),
	lastAccessTime: timestamp("last_access_time", { mode: 'string' }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("file_metadata_business_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("file_metadata_folder_deleted_idx").using("btree", table.folderId.asc().nullsLast().op("uuid_ops"), table.isDeleted.asc().nullsLast().op("bool_ops")),
	index("file_metadata_folder_idx").using("btree", table.folderId.asc().nullsLast().op("uuid_ops")),
	index("file_metadata_is_deleted_idx").using("btree", table.isDeleted.asc().nullsLast().op("bool_ops")),
	index("file_metadata_is_temporary_idx").using("btree", table.isTemporary.asc().nullsLast().op("bool_ops")),
	index("file_metadata_md5_idx").using("btree", table.md5Hash.asc().nullsLast().op("text_ops")),
	index("file_metadata_mime_type_idx").using("btree", table.mimeType.asc().nullsLast().op("text_ops")),
	index("file_metadata_module_business_deleted_idx").using("btree", table.moduleId.asc().nullsLast().op("bool_ops"), table.businessId.asc().nullsLast().op("text_ops"), table.isDeleted.asc().nullsLast().op("bool_ops")),
	index("file_metadata_module_idx").using("btree", table.moduleId.asc().nullsLast().op("text_ops")),
	index("file_metadata_sha256_idx").using("btree", table.sha256Hash.asc().nullsLast().op("text_ops")),
	index("file_metadata_upload_time_idx").using("btree", table.uploadTime.asc().nullsLast().op("timestamp_ops")),
	index("file_metadata_uploader_idx").using("btree", table.uploaderId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.storageProviderId],
			foreignColumns: [fileStorageProviders.id],
			name: "file_metadata_storage_provider_id_file_storage_providers_id_fk"
		}),
	foreignKey({
			columns: [table.folderId],
			foreignColumns: [fileFolders.id],
			name: "file_metadata_folder_id_file_folders_id_fk"
		}).onDelete("set null"),
]);

export const fileAccessLogs = pgTable("file_access_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	fileId: uuid("file_id"),
	shareId: uuid("share_id"),
	accessType: varchar("access_type", { length: 20 }).notNull(),
	userId: varchar("user_id", { length: 255 }),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: text("user_agent"),
	referer: text(),
	statusCode: integer("status_code"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	bytesTransferred: bigint("bytes_transferred", { mode: "number" }),
	responseTimeMs: integer("response_time_ms"),
	accessedAt: timestamp("accessed_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("file_access_logs_access_type_idx").using("btree", table.accessType.asc().nullsLast().op("text_ops")),
	index("file_access_logs_accessed_at_idx").using("btree", table.accessedAt.asc().nullsLast().op("timestamp_ops")),
	index("file_access_logs_file_idx").using("btree", table.fileId.asc().nullsLast().op("uuid_ops")),
	index("file_access_logs_share_idx").using("btree", table.shareId.asc().nullsLast().op("uuid_ops")),
	index("file_access_logs_user_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.fileId],
			foreignColumns: [fileMetadata.id],
			name: "file_access_logs_file_id_file_metadata_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.shareId],
			foreignColumns: [fileShares.id],
			name: "file_access_logs_share_id_file_shares_id_fk"
		}).onDelete("set null"),
]);

export const fileShares = pgTable("file_shares", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	shareCode: varchar("share_code", { length: 20 }).notNull(),
	fileIds: json("file_ids").notNull(),
	title: varchar({ length: 255 }),
	description: text(),
	password: varchar({ length: 100 }),
	permission: varchar({ length: 20 }).default('view').notNull(),
	maxDownloads: integer("max_downloads"),
	downloadCount: integer("download_count").default(0).notNull(),
	maxAccess: integer("max_access"),
	accessCount: integer("access_count").default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdBy: varchar("created_by", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("file_shares_created_by_idx").using("btree", table.createdBy.asc().nullsLast().op("text_ops")),
	index("file_shares_expires_at_idx").using("btree", table.expiresAt.asc().nullsLast().op("timestamp_ops")),
	index("file_shares_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("file_shares_share_code_idx").using("btree", table.shareCode.asc().nullsLast().op("text_ops")),
	unique("file_shares_share_code_unique").on(table.shareCode),
]);

export const fileStorageProviders = pgTable("file_storage_providers", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	type: varchar({ length: 50 }).notNull(),
	config: json().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	priority: integer().default(100).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	maxFileSize: bigint("max_file_size", { mode: "number" }),
	supportedMimeTypes: json("supported_mime_types"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("storage_providers_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("storage_providers_priority_idx").using("btree", table.priority.asc().nullsLast().op("int4_ops")),
	index("storage_providers_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	unique("file_storage_providers_name_unique").on(table.name),
]);

export const fileProcessingRecords = pgTable("file_processing_records", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	fileId: uuid("file_id").notNull(),
	processingType: varchar("processing_type", { length: 50 }).notNull(),
	processorName: varchar("processor_name", { length: 100 }).notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	parameters: json(),
	result: json(),
	outputPath: text("output_path"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	outputSize: bigint("output_size", { mode: "number" }),
	processingTimeMs: integer("processing_time_ms"),
	errorMessage: text("error_message"),
	retryCount: integer("retry_count").default(0).notNull(),
	priority: integer().default(5).notNull(),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("file_processing_records_file_idx").using("btree", table.fileId.asc().nullsLast().op("uuid_ops")),
	index("file_processing_records_file_processing_type_idx").using("btree", table.fileId.asc().nullsLast().op("text_ops"), table.processingType.asc().nullsLast().op("uuid_ops")),
	index("file_processing_records_priority_idx").using("btree", table.priority.asc().nullsLast().op("int4_ops")),
	index("file_processing_records_processing_type_idx").using("btree", table.processingType.asc().nullsLast().op("text_ops")),
	index("file_processing_records_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.fileId],
			foreignColumns: [fileMetadata.id],
			name: "file_processing_records_file_id_file_metadata_id_fk"
		}).onDelete("cascade"),
]);

export const fileThumbnails = pgTable("file_thumbnails", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	fileId: uuid("file_id").notNull(),
	type: varchar({ length: 50 }).notNull(),
	size: varchar({ length: 20 }).notNull(),
	width: integer(),
	height: integer(),
	format: varchar({ length: 10 }).notNull(),
	fileSize: integer("file_size").notNull(),
	storagePath: text("storage_path").notNull(),
	cdnUrl: text("cdn_url"),
	quality: integer().default(85),
	isGenerated: boolean("is_generated").default(false).notNull(),
	generatedAt: timestamp("generated_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("file_thumbnails_file_idx").using("btree", table.fileId.asc().nullsLast().op("uuid_ops")),
	index("file_thumbnails_file_type_size_idx").using("btree", table.fileId.asc().nullsLast().op("uuid_ops"), table.type.asc().nullsLast().op("text_ops"), table.size.asc().nullsLast().op("uuid_ops")),
	index("file_thumbnails_is_generated_idx").using("btree", table.isGenerated.asc().nullsLast().op("bool_ops")),
	index("file_thumbnails_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.fileId],
			foreignColumns: [fileMetadata.id],
			name: "file_thumbnails_file_id_file_metadata_id_fk"
		}).onDelete("cascade"),
]);

export const fileVersions = pgTable("file_versions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	fileId: uuid("file_id").notNull(),
	version: integer().notNull(),
	description: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	size: bigint({ mode: "number" }).notNull(),
	md5Hash: varchar("md5_hash", { length: 32 }).notNull(),
	storagePath: text("storage_path").notNull(),
	cdnUrl: text("cdn_url"),
	isCurrent: boolean("is_current").default(false).notNull(),
	createdBy: varchar("created_by", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("file_versions_file_idx").using("btree", table.fileId.asc().nullsLast().op("uuid_ops")),
	index("file_versions_file_version_idx").using("btree", table.fileId.asc().nullsLast().op("int4_ops"), table.version.asc().nullsLast().op("int4_ops")),
	index("file_versions_is_current_idx").using("btree", table.isCurrent.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.fileId],
			foreignColumns: [fileMetadata.id],
			name: "file_versions_file_id_file_metadata_id_fk"
		}).onDelete("cascade"),
]);
