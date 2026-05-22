import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import {
	comments,
	lessons,
	lessonVideos,
	quizQuestions,
	userLessonProgress
} from '$lib/server/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const allLessons = await db.select().from(lessons).orderBy(lessons.order);

	// We load all lessions with everything needed to display them to user.
	// We return user progress in response.
	const lessonsWithContent = await Promise.all(
		allLessons.map(async (lesson) => {
			const videos = await db
				.select()
				.from(lessonVideos)
				.where(eq(lessonVideos.lessonId, lesson.id))
				.orderBy(lessonVideos.order);

			const questions = await db
				.select()
				.from(quizQuestions)
				.where(eq(quizQuestions.lessonId, lesson.id))
				.orderBy(quizQuestions.order);

			let progress = null;
			if (event.locals.user) {
				progress = await db
					.select()
					.from(userLessonProgress)
					.where(
						and(
							eq(userLessonProgress.userId, event.locals.user.id),
							eq(userLessonProgress.lessonId, lesson.id)
						)
					)
					.get();
			}

			const lessonComments = await db
				.select()
				.from(comments)
				.where(eq(comments.lessonId, lesson.id))
				.orderBy(desc(comments.createdAt));

			return {
				...lesson,
				videos,
				questions: questions.map((q) => ({
					...q,
					options: JSON.parse(q.options) as string[]
				})),
				progress,
				comments: lessonComments
			};
		})
	);

	console.log('returning lessons to user:', lessonsWithContent);

	return { lessons: lessonsWithContent };
};

export const actions: Actions = {
	saveProgress: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) return fail(401, { error: 'Not logged in' });

		const data = await request.formData();
		const lessonId = data.get('lessonId') as string;
		const score = parseInt(data.get('score') as string);
		const total = parseInt(data.get('total') as string);
		const passed = score / total >= 0.7; // 70% pass mark

		console.log('saveProgress called with:', {
			lessonId: data.get('lessonId'),
			score: data.get('score'),
			total: data.get('total')
		});

		const existing = await db
			.select()
			.from(userLessonProgress)
			.where(and(eq(userLessonProgress.lessonId, lessonId), eq(userLessonProgress.userId, user.id)))
			.get();

		if (existing) {
			await db
				.update(userLessonProgress)
				.set({
					quizPassed: passed,
					bestScore: Math.max(existing.bestScore ?? 0, score),
					completedAt: passed ? new Date().toISOString() : existing.completedAt
				})
				.where(eq(userLessonProgress.id, existing.id));
		} else {
			await db.insert(userLessonProgress).values({
				id: randomUUID(),
				userId: user.id,
				lessonId,
				quizPassed: passed,
				bestScore: score,
				completedAt: passed ? new Date().toISOString() : null
			});
		}

		return { success: true, passed, score, total };
	},

	addComment: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) return fail(401, { error: 'Not logged in' });

		const data = await request.formData();
		const body = (data.get('body') as string)?.trim();
		const lessonId = data.get('lessonId') as string;

		if (!body || body.length < 2) return fail(400, { commentError: 'Comment is too short.' });
		if (body.length > 500) return fail(400, { commentError: 'Comment is too long.' });

		const comment = {
			id: randomUUID(),
			lessonId,
			userId: user.id,
			userName: user.name ?? 'Anonymous',
			body,
			createdAt: new Date().toISOString()
		};

		await db.insert(comments).values(comment);

		return { comment };
	},

	deleteComment: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) return fail(401, { error: 'Not logged in' });

		const data = await request.formData();
		const id = data.get('id') as string;

		const comment = await db.select().from(comments).where(eq(comments.id, id)).get();
		if (!comment || comment.userId !== user.id) return fail(403, { error: 'Not allowed.' });

		await db.delete(comments).where(and(eq(comments.id, id), eq(comments.userId, user.id)));
		return { deleteSuccess: true };
	}
};
