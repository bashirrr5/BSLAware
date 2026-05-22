<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/Icon.svelte';

	export let data;

	const EMOJIS = ['👍', '❤️', '😂', '😮', '👏', '🤟'];

	let posts = data.posts;
	let showNewPost = false;
	let expandedPost: string | null = null;
	let postTitle = '';
	let postBody = '';
	let commentBodies: Record<string, string> = {};

	function formatDate(iso: string) {
		const date = new Date(iso);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 1000 / 60);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
		if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
		if (diffDays === 1) return 'Yesterday';

		return date.toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function groupReactions(reactions: { emoji: string; userId: string }[]) {
		const map: Record<string, { count: number; userIds: string[] }> = {};
		for (const r of reactions) {
			if (!map[r.emoji]) map[r.emoji] = { count: 0, userIds: [] };
			map[r.emoji].count++;
			map[r.emoji].userIds.push(r.userId);
		}
		return map;
	}

	function hasReacted(reactions: { emoji: string; userId: string }[], emoji: string) {
		return reactions.some((r) => r.userId === data.user.id && r.emoji === emoji);
	}
</script>

<svelte:head>
	<title>Forum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<div class="eyebrow">Community</div>
			<h1>Forum</h1>
			<p>Ask questions, share tips, and connect with other BSL learners.</p>
		</div>
		<button class="cta-btn" on:click={() => (showNewPost = !showNewPost)}>
			{#if showNewPost}
				Cancel
			{:else}
				New Post <Icon name="plus" size={15} />
			{/if}
		</button>
	</div>

	<!-- New post form -->
	{#if showNewPost}
		<form
			class="new-post-form"
			method="POST"
			action="?/createPost"
			use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success' && result.data?.post) {
						posts = [{ ...result.data.post, comments: [], reactions: [] }, ...posts];
						postTitle = '';
						postBody = '';
						showNewPost = false;
					}
				};
			}}
		>
			<h2>New Post</h2>
			<div class="field">
				<label for="title">Title</label>
				<input
					id="title"
					name="title"
					type="text"
					bind:value={postTitle}
					placeholder="What's on your mind?"
					maxlength="120"
				/>
			</div>
			<div class="field">
				<label for="body">Body</label>
				<textarea
					id="body"
					name="body"
					bind:value={postBody}
					placeholder="Share more detail…"
					rows="4"
					maxlength="1000"
				></textarea>
			</div>
			<div class="form-footer">
				<span class="char-count">{postBody.length}/1000</span>
				<button
					type="submit"
					class="cta-btn"
					disabled={postTitle.trim().length < 3 || postBody.trim().length < 3}
				>
					Post <Icon name="arrow-right" size={15} />
				</button>
			</div>
		</form>
	{/if}

	<!-- Posts -->
	<div class="posts">
		{#if posts.length === 0}
			<div class="empty">No posts yet — be the first to start a discussion!</div>
		{:else}
			{#each posts as post}
				{@const postReactionMap = groupReactions(post.reactions)}
				<article class="post-card">
					<!-- Post header -->
					<div class="post-header">
						<div class="avatar">{post.userName.charAt(0).toUpperCase()}</div>
						<div class="post-meta">
							<strong>{post.userName}</strong>
							<span>{formatDate(post.createdAt)}</span>
						</div>
						{#if post.userId === data.user.id}
							<form
								method="POST"
								action="?/deletePost"
								use:enhance={() => {
									return async ({ result }) => {
										if (result.type === 'success' && result.data?.id) {
											posts = posts.filter((p) => p.id !== result.data.id);
										}
									};
								}}
							>
								<input type="hidden" name="id" value={post.id} />
								<button type="submit" class="delete-btn">Delete</button>
							</form>
						{/if}
					</div>

					<!-- Post body -->
					<h2 class="post-title">{post.title}</h2>
					<p class="post-body">{post.body}</p>

					<!-- Post reactions -->
					<div class="reactions">
						{#each Object.entries(postReactionMap) as [emoji, { count, userIds }]}
							<form
								method="POST"
								action="?/react"
								use:enhance={() => {
									return async ({ result }) => {
										if (result.type === 'success') {
											const d = result.data;
											const p = posts.find((p) => p.id === post.id);
											if (!p) return;
											if (d?.removed) {
												p.reactions = p.reactions.filter(
													(r) => !(r.userId === data.user.id && r.emoji === d.emoji)
												);
											} else if (d?.added) {
												p.reactions = [
													...p.reactions,
													{
														id: '',
														userId: d.userId,
														emoji: d.emoji,
														targetId: post.id,
														targetType: 'post'
													}
												];
											}
											posts = posts;
										}
									};
								}}
							>
								<input type="hidden" name="targetId" value={post.id} />
								<input type="hidden" name="targetType" value="post" />
								<input type="hidden" name="emoji" value={emoji} />
								<button
									type="submit"
									class="reaction-btn"
									class:reacted={userIds.includes(data.user.id)}
								>
									{emoji} <span>{count}</span>
								</button>
							</form>
						{/each}

						<!-- Add reaction picker -->
						<div class="emoji-picker-wrap">
							<button type="button" class="add-reaction-btn"><Icon name="plus"></Icon></button>
							<div class="emoji-picker">
								{#each EMOJIS as emoji}
									<form
										method="POST"
										action="?/react"
										use:enhance={() => {
											return async ({ result }) => {
												if (result.type === 'success') {
													const d = result.data;
													const p = posts.find((p) => p.id === post.id);
													if (!p) return;
													if (d?.removed) {
														p.reactions = p.reactions.filter(
															(r) => !(r.userId === data.user.id && r.emoji === d.emoji)
														);
													} else if (d?.added) {
														p.reactions = [
															...p.reactions,
															{
																id: '',
																userId: d.userId,
																emoji: d.emoji,
																targetId: post.id,
																targetType: 'post'
															}
														];
													}
													posts = posts;
												}
											};
										}}
									>
										<input type="hidden" name="targetId" value={post.id} />
										<input type="hidden" name="targetType" value="post" />
										<input type="hidden" name="emoji" value={emoji} />
										<button
											type="submit"
											class="emoji-opt"
											class:active={hasReacted(post.reactions, emoji)}
										>
											{emoji}
										</button>
									</form>
								{/each}
							</div>
						</div>
					</div>

					<!-- Toggle comments -->
					<button
						class="comments-toggle"
						on:click={() => (expandedPost = expandedPost === post.id ? null : post.id)}
					>
						{#if expandedPost === post.id}
							<Icon name="chevron-left" size={14} /> Hide comments
						{:else}
							<Icon name="chevron-right" size={14} />
							{post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
						{/if}
					</button>

					{#if expandedPost === post.id}
						<div class="comments-section">
							<!-- Existing comments -->
							{#each post.comments as comment}
								{@const commentReactionMap = groupReactions(comment.reactions)}
								<div class="comment">
									<div class="avatar avatar-sm">{comment.userName.charAt(0).toUpperCase()}</div>
									<div class="comment-inner">
										<div class="comment-meta">
											<strong>{comment.userName}</strong>
											<span>{formatDate(comment.createdAt)}</span>
											{#if comment.userId === data.user.id}
												<form
													method="POST"
													action="?/deleteComment"
													use:enhance={() => {
														return async ({ result }) => {
															if (result.type === 'success' && result.data?.id) {
																const p = posts.find((p) => p.id === post.id);
																if (p) {
																	p.comments = p.comments.filter((c) => c.id !== result.data.id);
																	posts = posts;
																}
															}
														};
													}}
												>
													<input type="hidden" name="id" value={comment.id} />
													<button type="submit" class="delete-btn">Delete</button>
												</form>
											{/if}
										</div>
										<p>{comment.body}</p>

										<!-- Comment reactions -->
										<div class="reactions reactions-sm">
											{#each Object.entries(commentReactionMap) as [emoji, { count, userIds }]}
												<form
													method="POST"
													action="?/react"
													use:enhance={() => {
														return async ({ result }) => {
															if (result.type === 'success') {
																const d = result.data;
																const p = posts.find((p) => p.id === post.id);
																const c = p?.comments.find((c) => c.id === comment.id);
																if (!c) return;
																if (d?.removed) {
																	c.reactions = c.reactions.filter(
																		(r) => !(r.userId === data.user.id && r.emoji === d.emoji)
																	);
																} else if (d?.added) {
																	c.reactions = [
																		...c.reactions,
																		{
																			id: '',
																			userId: d.userId,
																			emoji: d.emoji,
																			targetId: comment.id,
																			targetType: 'comment'
																		}
																	];
																}
																posts = posts;
															}
														};
													}}
												>
													<input type="hidden" name="targetId" value={comment.id} />
													<input type="hidden" name="targetType" value="comment" />
													<input type="hidden" name="emoji" value={emoji} />
													<button
														type="submit"
														class="reaction-btn"
														class:reacted={userIds.includes(data.user.id)}
													>
														{emoji} <span>{count}</span>
													</button>
												</form>
											{/each}

											<div class="emoji-picker-wrap">
												<button type="button" class="add-reaction-btn">＋</button>
												<div class="emoji-picker">
													{#each EMOJIS as emoji}
														<form
															method="POST"
															action="?/react"
															use:enhance={() => {
																return async ({ result }) => {
																	if (result.type === 'success') {
																		const d = result.data;
																		const p = posts.find((p) => p.id === post.id);
																		const c = p?.comments.find((c) => c.id === comment.id);
																		if (!c) return;
																		if (d?.removed) {
																			c.reactions = c.reactions.filter(
																				(r) => !(r.userId === data.user.id && r.emoji === d.emoji)
																			);
																		} else if (d?.added) {
																			c.reactions = [
																				...c.reactions,
																				{
																					id: '',
																					userId: d.userId,
																					emoji: d.emoji,
																					targetId: comment.id,
																					targetType: 'comment'
																				}
																			];
																		}
																		posts = posts;
																	}
																};
															}}
														>
															<input type="hidden" name="targetId" value={comment.id} />
															<input type="hidden" name="targetType" value="comment" />
															<input type="hidden" name="emoji" value={emoji} />
															<button
																type="submit"
																class="emoji-opt"
																class:active={hasReacted(comment.reactions, emoji)}
															>
																{emoji}
															</button>
														</form>
													{/each}
												</div>
											</div>
										</div>
									</div>
								</div>
							{/each}

							<!-- Add comment -->
							<form
								class="comment-form"
								method="POST"
								action="?/createComment"
								use:enhance={() => {
									return async ({ result }) => {
										if (result.type === 'success' && result.data?.comment) {
											const p = posts.find((p) => p.id === post.id);
											if (p) {
												p.comments = [...p.comments, { ...result.data.comment, reactions: [] }];
												posts = posts;
											}
											commentBodies[post.id] = '';
										}
									};
								}}
							>
								<input type="hidden" name="postId" value={post.id} />
								<div class="comment-input-row">
									<div class="avatar avatar-sm">{data.user.name?.charAt(0).toUpperCase()}</div>
									<textarea
										name="body"
										bind:value={commentBodies[post.id]}
										placeholder="Write a comment…"
										rows="2"
										maxlength="500"
									></textarea>
								</div>
								<div class="comment-submit-row">
									<button
										type="submit"
										class="comment-btn"
										disabled={!commentBodies[post.id] || commentBodies[post.id]?.trim().length < 2}
									>
										Reply <Icon name="arrow-right" size={14} />
									</button>
								</div>
							</form>
						</div>
					{/if}
				</article>
			{/each}
		{/if}
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		background: #faf8f4;
	}

	.page {
		font-family: 'DM Sans', sans-serif;
		max-width: 780px;
		margin: 0 auto;
		padding: 4rem 2rem 6rem;
	}

	.eyebrow {
		font-size: 0.7rem;
		font-weight: 500;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: #c95f2a;
		margin-bottom: 0.4rem;
	}

	.page-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 2.5rem;
	}
	.page-header h1 {
		font-family: 'Playfair Display', serif;
		font-size: clamp(2rem, 4vw, 3rem);
		font-weight: 900;
		color: #0e1c2e;
		margin: 0.25rem 0 0.5rem;
	}
	.page-header p {
		font-size: 0.95rem;
		color: #6a6a60;
		margin: 0;
		font-weight: 300;
	}

	/* ── New post form ───────────────────────────────── */
	.new-post-form {
		background: #fff;
		border: 1.5px solid #e8e2d8;
		border-radius: 8px;
		padding: 1.75rem;
		margin-bottom: 2rem;
	}
	.new-post-form h2 {
		font-family: 'Playfair Display', serif;
		font-size: 1.2rem;
		font-weight: 700;
		color: #0e1c2e;
		margin: 0 0 1.25rem;
	}

	.field {
		margin-bottom: 1rem;
	}
	label {
		display: block;
		font-size: 0.78rem;
		font-weight: 500;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: #4a4a42;
		margin-bottom: 0.4rem;
	}

	input[type='text'],
	textarea {
		width: 100%;
		font-family: 'DM Sans', sans-serif;
		font-size: 0.95rem;
		color: #0e1c2e;
		background: #faf8f4;
		border: 1.5px solid #e8e2d8;
		border-radius: 6px;
		padding: 0.7rem 0.875rem;
		outline: none;
		box-sizing: border-box;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
		resize: vertical;
	}
	input[type='text']:focus,
	textarea:focus {
		border-color: #f4a96a;
		box-shadow: 0 0 0 3px rgba(244, 169, 106, 0.15);
	}

	.form-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 0.75rem;
	}
	.char-count {
		font-size: 0.75rem;
		color: #a09880;
	}

	/* ── CTA ─────────────────────────────────────────── */
	.cta-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		background: #0e1c2e;
		color: #faf8f4;
		font-family: 'DM Sans', sans-serif;
		font-size: 0.9rem;
		font-weight: 500;
		padding: 0.7rem 1.4rem;
		border-radius: 5px;
		border: none;
		cursor: pointer;
		text-decoration: none;
		transition:
			background 0.2s,
			transform 0.15s;
		flex-shrink: 0;
	}
	.cta-btn:hover:not(:disabled) {
		background: #1b3050;
		transform: translateY(-1px);
	}
	.cta-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* ── Posts ───────────────────────────────────────── */
	.posts {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.post-card {
		background: #fff;
		border: 1.5px solid #e8e2d8;
		border-radius: 8px;
		padding: 1.5rem;
		transition: border-color 0.2s;
	}
	.post-card:hover {
		border-color: #d8d2c8;
	}

	.post-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: #f4a96a;
		color: #0e1c2e;
		font-size: 0.9rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.avatar-sm {
		width: 28px;
		height: 28px;
		font-size: 0.75rem;
	}

	.post-meta {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.post-meta strong {
		font-size: 0.875rem;
		color: #0e1c2e;
	}
	.post-meta span {
		font-size: 0.75rem;
		color: #a09880;
	}

	.post-title {
		font-family: 'Playfair Display', serif;
		font-size: 1.15rem;
		font-weight: 700;
		color: #0e1c2e;
		margin: 0 0 0.5rem;
	}
	.post-body {
		font-size: 0.925rem;
		line-height: 1.7;
		color: #3a3a32;
		margin: 0 0 1.1rem;
		white-space: pre-wrap;
	}

	/* ── Reactions ───────────────────────────────────── */
	.reactions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.375rem;
		margin-bottom: 1rem;
	}
	.reactions-sm {
		margin-bottom: 0;
		margin-top: 0.5rem;
	}

	.reaction-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.85rem;
		padding: 0.25rem 0.6rem;
		border-radius: 20px;
		border: 1.5px solid #e8e2d8;
		background: #faf8f4;
		cursor: pointer;
		transition:
			border-color 0.2s,
			background 0.2s;
		font-family: 'DM Sans', sans-serif;
		color: #3a3a32;
	}
	.reaction-btn span {
		font-size: 0.75rem;
		color: #6a6a60;
	}
	.reaction-btn:hover {
		border-color: #f4a96a;
		background: #fff;
	}
	.reaction-btn.reacted {
		border-color: #f4a96a;
		background: rgba(244, 169, 106, 0.1);
	}

	.emoji-picker-wrap {
		position: relative;
		display: inline-flex;
	}
	.add-reaction-btn {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		border: 1.5px dashed #d8d2c8;
		background: none;
		cursor: pointer;
		font-size: 0.85rem;
		color: #a09880;
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			border-color 0.2s,
			color 0.2s;
		padding: 0;
	}
	.add-reaction-btn:hover {
		border-color: #f4a96a;
		color: #c95f2a;
	}

	.emoji-picker {
		display: none;
		position: absolute;
		bottom: calc(100% + 6px);
		left: 0;
		background: #fff;
		border: 1.5px solid #e8e2d8;
		border-radius: 8px;
		padding: 0.4rem;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
		flex-direction: row;
		gap: 0.2rem;
		z-index: 10;
		white-space: nowrap;
	}
	.emoji-picker-wrap:hover .emoji-picker,
	.emoji-picker-wrap:focus-within .emoji-picker {
		display: flex;
	}

	.emoji-opt {
		background: none;
		border: 1.5px solid transparent;
		border-radius: 6px;
		font-size: 1.1rem;
		padding: 0.25rem;
		cursor: pointer;
		transition:
			background 0.15s,
			border-color 0.15s;
		line-height: 1;
	}
	.emoji-opt:hover {
		background: #f0ece4;
	}
	.emoji-opt.active {
		border-color: #f4a96a;
		background: rgba(244, 169, 106, 0.1);
	}

	/* ── Comments toggle ─────────────────────────────── */
	.comments-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		background: none;
		border: none;
		font-family: 'DM Sans', sans-serif;
		font-size: 0.825rem;
		font-weight: 500;
		color: #7a7a6e;
		cursor: pointer;
		padding: 0;
		transition: color 0.2s;
	}
	.comments-toggle:hover {
		color: #0e1c2e;
	}

	/* ── Comments section ────────────────────────────── */
	.comments-section {
		margin-top: 1.25rem;
		padding-top: 1.25rem;
		border-top: 1px solid #f0ece4;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.comment {
		display: flex;
		gap: 0.625rem;
		align-items: flex-start;
	}
	.comment-inner {
		flex: 1;
	}
	.comment-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.2rem;
		flex-wrap: wrap;
	}
	.comment-meta strong {
		font-size: 0.825rem;
		color: #0e1c2e;
	}
	.comment-meta span {
		font-size: 0.75rem;
		color: #a09880;
	}
	.comment-inner p {
		font-size: 0.875rem;
		line-height: 1.65;
		color: #3a3a32;
		margin: 0;
		white-space: pre-wrap;
	}

	.comment-form {
		padding-top: 0.5rem;
	}
	.comment-input-row {
		display: flex;
		gap: 0.625rem;
		align-items: flex-start;
		margin-bottom: 0.5rem;
	}
	.comment-input-row textarea {
		flex: 1;
	}

	.comment-submit-row {
		display: flex;
		justify-content: flex-end;
	}
	.comment-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		background: #0e1c2e;
		color: #faf8f4;
		font-family: 'DM Sans', sans-serif;
		font-size: 0.825rem;
		font-weight: 500;
		padding: 0.45rem 1rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: background 0.2s;
	}
	.comment-btn:hover:not(:disabled) {
		background: #1b3050;
	}
	.comment-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* ── Delete ──────────────────────────────────────── */
	.delete-btn {
		background: none;
		border: none;
		font-size: 0.75rem;
		color: #c09080;
		cursor: pointer;
		padding: 0;
		font-family: 'DM Sans', sans-serif;
		margin-left: auto;
		transition: color 0.2s;
	}
	.delete-btn:hover {
		color: #e05c3a;
	}

	.empty {
		text-align: center;
		color: #a09880;
		font-size: 0.95rem;
		padding: 4rem 0;
	}

	/* ── Responsive ──────────────────────────────────── */
	@media (max-width: 600px) {
		.page {
			padding: 2.5rem 1.25rem 4rem;
		}
		.page-header {
			flex-direction: column;
		}
	}
</style>
