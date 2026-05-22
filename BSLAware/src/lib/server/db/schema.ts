import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const task = sqliteTable('task', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export * from './auth.schema';

export const lessons = sqliteTable('lessons', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	description: text('description').notNull(),
	order: integer('order').notNull() // controls display order
});

export const lessonVideos = sqliteTable('lesson_videos', {
	id: text('id').primaryKey(),
	lessonId: text('lesson_id')
		.notNull()
		.references(() => lessons.id),
	title: text('title').notNull(),
	youtubeId: text('youtube_id').notNull(), // just the video ID e.g. "dQw4w9WgXcQ"
	order: integer('order').notNull()
});

export const quizQuestions = sqliteTable('quiz_questions', {
	id: text('id').primaryKey(),
	lessonId: text('lesson_id')
		.notNull()
		.references(() => lessons.id),
	question: text('question').notNull(),
	options: text('options').notNull(), // JSON string: ["A","B","C","D"]
	correctAnswer: integer('correct_answer').notNull(), // index of correct option
	order: integer('order').notNull()
});

// Track user progress per lesson
export const userLessonProgress = sqliteTable('user_lesson_progress', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	lessonId: text('lesson_id')
		.notNull()
		.references(() => lessons.id),
	quizPassed: integer('quiz_passed', { mode: 'boolean' }).default(false),
	bestScore: integer('best_score').default(0),
	completedAt: text('completed_at')
});

// Comments on quizzes
export const comments = sqliteTable('comments', {
	id: text('id').primaryKey(),
	lessonId: text('lesson_id')
		.notNull()
		.references(() => lessons.id),
	userId: text('user_id').notNull(),
	userName: text('user_name').notNull(),
	body: text('body').notNull(),
	createdAt: text('created_at').notNull()
});

// FOrum

export const forumPosts = sqliteTable('forum_posts', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	userName: text('user_name').notNull(),
	title: text('title').notNull(),
	body: text('body').notNull(),
	createdAt: text('created_at').notNull()
});

export const forumComments = sqliteTable('forum_comments', {
	id: text('id').primaryKey(),
	postId: text('post_id')
		.notNull()
		.references(() => forumPosts.id),
	userId: text('user_id').notNull(),
	userName: text('user_name').notNull(),
	body: text('body').notNull(),
	createdAt: text('created_at').notNull()
});

export const forumReactions = sqliteTable('forum_reactions', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	emoji: text('emoji').notNull(),
	targetId: text('target_id').notNull(), // post or comment id
	targetType: text('target_type').notNull() // 'post' | 'comment'
});

// Dictionary
export const dictionaryEntries = sqliteTable('dictionary_entries', {
	id: text('id').primaryKey(),
	word: text('word').notNull(), // e.g. "Hello"
	category: text('category').notNull(), // e.g. "Greetings"
	description: text('description').notNull(), // text description of the sign
	videoId: text('video_id'), // YouTube video ID
	tags: text('tags').notNull().default('[]') // JSON array e.g. ["beginner","common"]
});
