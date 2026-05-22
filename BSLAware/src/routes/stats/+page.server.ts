import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { lessons, quizQuestions, userLessonProgress } from '$lib/server/db/schema';
import { eq, and, count } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user;

	if (!user) redirect(302, '/login');

	// All lessons with their question counts
	const allLessons = await db.select().from(lessons).orderBy(lessons.order);

	const lessonsWithStats = await Promise.all(
		allLessons.map(async (lesson) => {
			const questionCount = await db
				.select({ count: count() })
				.from(quizQuestions)
				.where(eq(quizQuestions.lessonId, lesson.id))
				.get();

			const progress = await db
				.select()
				.from(userLessonProgress)
				.where(
					and(eq(userLessonProgress.userId, user.id), eq(userLessonProgress.lessonId, lesson.id))
				)
				.get();

			return {
				...lesson,
				totalQuestions: questionCount?.count ?? 0,
				progress: progress ?? null
			};
		})
	);

	const completedLessons = lessonsWithStats.filter((l) => l.progress?.quizPassed);
	const inProgressLessons = lessonsWithStats.filter((l) => l.progress && !l.progress.quizPassed);
	const notStartedLessons = lessonsWithStats.filter((l) => !l.progress);

	const averageScore = completedLessons.length
		? Math.round(
				completedLessons.reduce((acc, l) => {
					const pct = l.totalQuestions > 0 ? (l.progress!.bestScore! / l.totalQuestions) * 100 : 0;
					return acc + pct;
				}, 0) / completedLessons.length
			)
		: 0;

	const lastActivity =
		lessonsWithStats
			.filter((l) => l.progress?.completedAt)
			.sort(
				(a, b) =>
					new Date(b.progress!.completedAt!).getTime() -
					new Date(a.progress!.completedAt!).getTime()
			)[0]?.progress?.completedAt ?? null;

	const response = {
		totalLessons: allLessons.length,
		completedCount: completedLessons.length,
		inProgressCount: inProgressLessons.length,
		notStartedCount: notStartedLessons.length,
		averageScore,
		lastActivity,
		lessonsWithStats
	};

	console.log('stats: Returning response to user:', response);

	return response;
};
