<script lang="ts">
	import { page } from '$app/stores';
	import Icon from '$lib/Icon.svelte';

	export let data;

	$: user = $page.data.user;

	const completionPct = data.totalLessons
		? Math.round((data.completedCount / data.totalLessons) * 100)
		: 0;

	function formatDate(iso: string | null) {
		if (!iso) return 'Never';
		return new Date(iso).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	function scoreColour(pct: number) {
		if (pct >= 80) return 'good';
		if (pct >= 60) return 'fair';
		return 'weak';
	}
</script>

<svelte:head>
	<title>Your Stats</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div class="eyebrow">Your Progress</div>
		<h1>Learning Stats</h1>
		<p>Keep going, {user.name?.split(' ')[0]}. Every sign counts.</p>
	</div>

	<!-- Top stat cards -->
	<div class="stat-grid">
		<div class="stat-card">
			<div class="stat-value">
				{data.completedCount}<span class="stat-of">/{data.totalLessons}</span>
			</div>
			<div class="stat-label">Lessons Completed</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">
				{data.averageScore}<span class="stat-unit">%</span>
			</div>
			<div class="stat-label">Average Quiz Score</div>
		</div>
		<!-- Not doing this. <div class="stat-card">
			<div class="stat-value">{data.inProgressCount}</div>
			<div class="stat-label">In Progress</div>
		</div> -->
		<div class="stat-card">
			<div class="stat-value">{data.notStartedCount}</div>
			<div class="stat-label">Not Started</div>
		</div>
	</div>

	<!-- Overall progress bar -->
	<div class="progress-section">
		<div class="progress-header">
			<span>Overall completion</span>
			<span class="progress-pct">{completionPct}%</span>
		</div>
		<div class="progress-track">
			<div class="progress-fill" style="width: {completionPct}%"></div>
		</div>
		<div class="last-activity">Last activity: {formatDate(data.lastActivity)}</div>
	</div>

	<!-- Per-lesson breakdown -->
	<div class="lessons-section">
		<h2>Lesson Breakdown</h2>
		<div class="lesson-rows">
			{#each data.lessonsWithStats as lesson, i}
				{@const scorePct =
					lesson.totalQuestions > 0 && lesson.progress?.bestScore != null
						? Math.round((lesson.progress.bestScore / lesson.totalQuestions) * 100)
						: null}
				<div class="lesson-row">
					<div class="lesson-left">
						<span class="lesson-num">{String(i + 1).padStart(2, '0')}</span>
						<div class="lesson-info">
							<span class="lesson-name">{lesson.title}</span>
							<span class="lesson-sub">{lesson.totalQuestions} questions</span>
						</div>
					</div>

					<div class="lesson-right">
						{#if lesson.progress?.quizPassed}
							<div class="score-pill {scoreColour(scorePct ?? 0)}">
								{scorePct}%
							</div>
							<span class="status-badge passed">Passed ✓</span>
						{:else if lesson.progress}
							<div class="score-pill {scoreColour(scorePct ?? 0)}">
								{scorePct}%
							</div>
							<span class="status-badge attempted">Attempted</span>
						{:else}
							<span class="status-badge not-started">Not started</span>
						{/if}
					</div>

					<!-- Row progress bar -->
					<div class="row-track">
						<div
							class="row-fill {lesson.progress?.quizPassed ? 'fill-pass' : 'fill-attempt'}"
							style="width: {scorePct ?? 0}%"
						></div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="cta-row">
		<a href="/learn" class="cta-btn">Continue Learning <Icon name="arrow-right" /></a>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		background: #faf8f4;
	}

	.page {
		font-family: sans-serif;
		max-width: 820px;
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

	.header {
		margin-bottom: 2.5rem;
	}
	.header h1 {
		font-family: serif;
		font-size: clamp(2rem, 4vw, 3rem);
		font-weight: 900;
		color: #0e1c2e;
		margin: 0.25rem 0 0.5rem;
	}
	.header p {
		font-size: 1rem;
		color: #6a6a60;
		margin: 0;
		font-weight: 300;
	}

	/* ── Stat cards ──────────────────────────────────── */
	.stat-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		background: #fff;
		border: 1.5px solid #e8e2d8;
		border-radius: 8px;
		padding: 1.5rem 1.25rem;
		transition:
			border-color 0.2s,
			transform 0.2s;
	}
	.stat-card:hover {
		border-color: #f4a96a;
		transform: translateY(-2px);
	}

	.stat-value {
		font-family: 'Playfair Display', serif;
		font-size: 2.25rem;
		font-weight: 900;
		color: #0e1c2e;
		line-height: 1;
		margin-bottom: 0.4rem;
	}
	.stat-of,
	.stat-unit {
		font-size: 1.1rem;
		color: #a09880;
		font-weight: 400;
	}
	.stat-label {
		font-size: 0.8rem;
		color: #7a7a6e;
		font-weight: 400;
	}

	/* ── Progress bar ────────────────────────────────── */
	.progress-section {
		background: #fff;
		border: 1.5px solid #e8e2d8;
		border-radius: 8px;
		padding: 1.5rem;
		margin-bottom: 2.5rem;
	}

	.progress-header {
		display: flex;
		justify-content: space-between;
		font-size: 0.875rem;
		font-weight: 500;
		color: #4a4a42;
		margin-bottom: 0.75rem;
	}
	.progress-pct {
		color: #f4a96a;
		font-weight: 700;
	}

	.progress-track {
		height: 8px;
		background: #f0ece4;
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 0.75rem;
	}
	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #f4a96a, #c95f2a);
		border-radius: 4px;
		transition: width 0.6s ease;
	}

	.last-activity {
		font-size: 0.8rem;
		color: #a09880;
	}

	/* ── Lesson breakdown ────────────────────────────── */
	.lessons-section h2 {
		font-family: 'Playfair Display', serif;
		font-size: 1.4rem;
		font-weight: 700;
		color: #0e1c2e;
		margin: 0 0 1rem;
	}

	.lesson-rows {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.lesson-row {
		background: #fff;
		border: 1.5px solid #e8e2d8;
		border-radius: 8px;
		padding: 1rem 1.25rem 0.75rem;
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-rows: auto auto;
		align-items: center;
		gap: 0.5rem 1rem;
		transition: border-color 0.2s;
	}
	.lesson-row:hover {
		border-color: #d8d2c8;
	}

	.lesson-left {
		display: flex;
		align-items: center;
		gap: 0.875rem;
	}

	.lesson-num {
		font-family: 'Playfair Display', serif;
		font-size: 1.1rem;
		font-weight: 900;
		color: #e8cdb5;
		flex-shrink: 0;
	}

	.lesson-info {
		display: flex;
		flex-direction: column;
	}
	.lesson-name {
		font-size: 0.95rem;
		font-weight: 500;
		color: #0e1c2e;
	}
	.lesson-sub {
		font-size: 0.775rem;
		color: #a09880;
	}

	.lesson-right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.score-pill {
		font-size: 0.8rem;
		font-weight: 700;
		padding: 0.2rem 0.6rem;
		border-radius: 20px;
	}
	.score-pill.good {
		background: rgba(58, 140, 106, 0.12);
		color: #3a8c6a;
	}
	.score-pill.fair {
		background: rgba(244, 169, 106, 0.15);
		color: #c95f2a;
	}
	.score-pill.weak {
		background: rgba(224, 92, 58, 0.1);
		color: #e05c3a;
	}

	.status-badge {
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.2rem 0.65rem;
		border-radius: 20px;
	}
	.status-badge.passed {
		background: rgba(58, 140, 106, 0.1);
		color: #3a8c6a;
	}
	.status-badge.attempted {
		background: rgba(244, 169, 106, 0.15);
		color: #c95f2a;
	}
	.status-badge.not-started {
		background: #f0ece4;
		color: #a09880;
	}

	.row-track {
		grid-column: 1 / -1;
		height: 3px;
		background: #f0ece4;
		border-radius: 2px;
		overflow: hidden;
	}
	.row-fill {
		height: 100%;
		border-radius: 2px;
		transition: width 0.5s ease;
	}
	.fill-pass {
		background: #3a8c6a;
	}
	.fill-attempt {
		background: #f4a96a;
	}

	/* ── CTA ─────────────────────────────────────────── */
	.cta-row {
		margin-top: 2.5rem;
		text-align: center;
	}

	.cta-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: #0e1c2e;
		color: #faf8f4;
		font-family: sans-serif;
		font-size: 0.95rem;
		font-weight: 500;
		padding: 0.875rem 1.75rem;
		border-radius: 5px;
		text-decoration: none;
		transition:
			background 0.2s,
			transform 0.15s;
	}
	.cta-btn:hover {
		background: #1b3050;
		transform: translateY(-1px);
	}

	/* ── Responsive ──────────────────────────────────── */
	@media (max-width: 600px) {
		.page {
			padding: 2.5rem 1.25rem 4rem;
		}
		.stat-grid {
			grid-template-columns: 1fr 1fr;
		}
		.lesson-row {
			grid-template-columns: 1fr;
		}
		.lesson-right {
			justify-content: flex-start;
		}
	}
</style>
