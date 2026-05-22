import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { forumPosts, forumComments, forumReactions } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import { randomUUID } from 'crypto';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) redirect(302, '/login');

	const posts = await db.select().from(forumPosts).orderBy(desc(forumPosts.createdAt));

	const postsWithData = await Promise.all(
		posts.map(async (post) => {
			const comments = await db
				.select()
				.from(forumComments)
				.where(eq(forumComments.postId, post.id))
				.orderBy(forumComments.createdAt);

			const reactions = await db
				.select()
				.from(forumReactions)
				.where(eq(forumReactions.targetId, post.id));

			const commentReactions = await Promise.all(
				comments.map(async (comment) => {
					const r = await db
						.select()
						.from(forumReactions)
						.where(eq(forumReactions.targetId, comment.id));
					return { ...comment, reactions: r };
				})
			);

			return { ...post, comments: commentReactions, reactions };
		})
	);

	return { posts: postsWithData, user };
};

export const actions: Actions = {
	createPost: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) return fail(401, { error: 'Not logged in' });

		const data = await request.formData();
		const title = (data.get('title') as string)?.trim();
		const body = (data.get('body') as string)?.trim();

		if (!title || title.length < 3) return fail(400, { postError: 'Title is too short.' });
		if (!body || body.length < 3) return fail(400, { postError: 'Post body is too short.' });

		const post = {
			id: randomUUID(),
			userId: user.id,
			userName: user.name ?? 'Anonymous',
			title,
			body,
			createdAt: new Date().toISOString()
		};

		await db.insert(forumPosts).values(post);
		console.log('created a post:', post);
		return { post };
	},

	createComment: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) return fail(401, { error: 'Not logged in' });

		const data = await request.formData();
		const postId = data.get('postId') as string;
		const body = (data.get('body') as string)?.trim();

		if (!body || body.length < 2) return fail(400, { commentError: 'Comment is too short.' });

		const comment = {
			id: randomUUID(),
			postId,
			userId: user.id,
			userName: user.name ?? 'Anonymous',
			body,
			createdAt: new Date().toISOString()
		};

		await db.insert(forumComments).values(comment);
		console.log('created a post comment:', comment);
		return { comment };
	},

	react: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) return fail(401, { error: 'Not logged in' });

		const data = await request.formData();
		const targetId = data.get('targetId') as string;
		const targetType = data.get('targetType') as string;
		const emoji = data.get('emoji') as string;

		// Toggle — remove if already reacted with same emoji
		const existing = await db
			.select()
			.from(forumReactions)
			.where(eq(forumReactions.targetId, targetId))
			.all();

		const mine = existing.find((r) => r.userId === user.id && r.emoji === emoji);

		if (mine) {
			await db.delete(forumReactions).where(eq(forumReactions.id, mine.id));
			return { removed: true, targetId, emoji };
		}

		await db.insert(forumReactions).values({
			id: randomUUID(),
			userId: user.id,
			emoji,
			targetId,
			targetType
		});

		console.log('reaction created:', targetId, emoji);

		return { added: true, targetId, emoji, userId: user.id };
	},

	deletePost: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) return fail(401, { error: 'Not logged in' });

		const data = await request.formData();
		const id = data.get('id') as string;

		const post = await db.select().from(forumPosts).where(eq(forumPosts.id, id)).get();
		if (!post || post.userId !== user.id) return fail(403, { error: 'Not allowed.' });

		await db.delete(forumReactions).where(eq(forumReactions.targetId, id));
		await db.delete(forumComments).where(eq(forumComments.postId, id));
		await db.delete(forumPosts).where(eq(forumPosts.id, id));
		console.log('post deleted:', id);
		return { deleted: true, id };
	},

	deleteComment: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) return fail(401, { error: 'Not logged in' });

		const data = await request.formData();
		const id = data.get('id') as string;

		const comment = await db.select().from(forumComments).where(eq(forumComments.id, id)).get();
		if (!comment || comment.userId !== user.id) return fail(403, { error: 'Not allowed.' });

		await db.delete(forumReactions).where(eq(forumReactions.targetId, id));
		await db.delete(forumComments).where(eq(forumComments.id, id));
		console.log('comment deleted:', id);
		return { deleted: true, id };
	}
};
