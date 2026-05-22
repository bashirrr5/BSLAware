<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { invalidate, invalidateAll } from '$app/navigation';
	import { tick } from 'svelte';
	import Icon from '$lib/Icon.svelte';

	export let data;
	export let form;

	$: user = $page.data.user;

	type Lesson = (typeof data.lessons)[number];

	let showLanding = true;
	let activeLessonId: string | null = data.lessons[0]?.id ?? null;
	let stage: 'videos' | 'quiz' | 'result' = 'videos';
	let currentVideoIndex = 0;
	let currentQuestionIndex = 0;
	let answers: (number | null)[] = [];
	let score = 0;
	// Store result so reactive updates don't clear values mid-save
	let resultSnapshot: { lessonId: string; score: number; total: number } | null = null;
	let commentBody = '';
	let progressSaved = false;

	$: hasStarted = data.lessons.some((l) => l.progress);
	$: allCompleted = data.lessons.every((l) => l.progress?.quizPassed);
	$: activeLesson = data.lessons.find((l) => l.id === activeLessonId) ?? null;
	$: activeComments = activeLesson?.comments ?? []; // Active lesson comments

	let progressForm: HTMLFormElement;

	// // Watch for stage changing to 'result' and auto-submit
	// $: if (stage === 'result' && progressForm && user) {
	// 	console.log('Submitting progress...', {
	// 		lessonId: activeLessonId,
	// 		score,
	// 		total: activeLesson?.questions.length
	// 	});
	// 	progressForm.requestSubmit();
	// }

	function startLearning() {
		const nextLesson = data.lessons.find((l) => !l.progress?.quizPassed);
		activeLessonId = nextLesson?.id ?? data.lessons[0]?.id ?? null;
		showLanding = false;
	}

	function resetLesson() {
		stage = 'videos';
		currentVideoIndex = 0;
		currentQuestionIndex = 0;
		answers = [];
		score = 0;
	}

	function selectLesson(lesson: Lesson) {
		if (activeLessonId === lesson.id) return;
		activeLessonId = lesson.id;
		resetLesson();
	}

	function nextVideo() {
		if (!activeLesson) return;
		if (currentVideoIndex < activeLesson.videos.length - 1) {
			currentVideoIndex++;
		} else {
			stage = 'quiz';
			answers = new Array(activeLesson.questions.length).fill(null);
		}
	}

	function prevVideo() {
		if (currentVideoIndex > 0) currentVideoIndex--;
	}

	function selectAnswer(optionIndex: number) {
		if (!activeLesson) return;
		answers[currentQuestionIndex] = optionIndex;
	}

	function nextQuestion() {
		if (!activeLesson) return;
		if (currentQuestionIndex < activeLesson.questions.length - 1) {
			currentQuestionIndex++;
		}
	}

	function prevQuestion() {
		if (currentQuestionIndex > 0) currentQuestionIndex--;
	}

	async function submitQuiz() {
		if (!activeLesson) return;
		score = activeLesson.questions.reduce((acc, q, i) => {
			return answers[i] === q.correctAnswer ? acc + 1 : acc;
		}, 0);

		// Capture before stage change triggers reactive recalculations
		resultSnapshot = {
			lessonId: activeLesson.id,
			score,
			total: activeLesson.questions.length
		};

		progressSaved = false;
		stage = 'result';

		if (user && !progressSaved) {
			await tick(); // wait for the form to render
			progressSaved = true;
			progressForm?.requestSubmit();
		}
	}

	function retryQuiz() {
		if (!activeLesson) return;
		stage = 'quiz';
		currentQuestionIndex = 0;
		answers = new Array(activeLesson.questions.length).fill(null);
		score = 0;
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	$: currentVideo = activeLesson?.videos[currentVideoIndex];
	$: currentQuestion = activeLesson?.questions[currentQuestionIndex];
	$: allAnswered = answers.every((a) => a !== null);
	$: passed = activeLesson ? score / activeLesson.questions.length >= 0.7 : false;
</script>

<svelte:head>
	<title>Learn BSL</title>
</svelte:head>

{#if showLanding}
	<div class="landing">
		<div class="landing-banner">
			<div class="banner-inner">
				<div class="banner-left">
					<span class="banner-logo">🤟</span>
					<div>
						<h1 class="banner-title">BSL Lessons</h1>
						<p class="banner-sub">
							{#if hasStarted}
								{#if data.lessons.every((l) => l.progress?.quizPassed)}
									All {data.lessons.length} lessons completed!
								{:else}
									{@const next = data.lessons.find((l) => !l.progress?.quizPassed)}
									Up next: {next?.title}
								{/if}
							{:else}
								{data.lessons.length} lessons · Videos + quizzes · Learn at your own pace
							{/if}
						</p>
					</div>
				</div>
				<button class="cta-btn" on:click={startLearning}>
					{#if allCompleted}
						Review Lessons
					{:else if hasStarted}
						Continue
					{:else}
						Start Learning
					{/if}
					<Icon name="arrow-right" />
				</button>
			</div>

			{#if hasStarted}
				<div class="banner-progress-track">
					<div
						class="banner-progress-fill"
						style="width: {Math.round(
							(data.lessons.filter((l) => l.progress?.quizPassed).length / data.lessons.length) *
								100
						)}%"
					></div>
				</div>
			{/if}
		</div>

		<!-- How it works -->
		<div class="how-it-works">
			<div class="eyebrow">How It Works</div>
			<h2>Three simple steps</h2>
			<div class="steps">
				<div class="step">
					<div class="step-num">01</div>
					<h3>Watch</h3>
					<p>
						Each lesson includes one or more short videos taught by experienced BSL tutors. Watch
						them as many times as you need.
					</p>
				</div>
				<div class="step">
					<div class="step-num">02</div>
					<h3>Quiz</h3>
					<p>
						After the videos, take a short multiple choice quiz. You need 70% or more to pass and
						unlock the next lesson.
					</p>
				</div>
				<div class="step">
					<div class="step-num">03</div>
					<h3>Progress</h3>
					<p>
						Your scores and completed lessons are saved automatically so you can pick up where you
						left off.
					</p>
				</div>
			</div>
		</div>

		<!-- Lessons preview -->
		<div class="lessons-preview">
			<div class="eyebrow">What You'll Learn</div>
			<h2>{data.lessons.length} lessons available</h2>
			<div class="preview-list">
				{#each data.lessons as lesson, i}
					<div class="preview-item">
						<span class="preview-num">{String(i + 1).padStart(2, '0')}</span>
						<div class="preview-meta">
							<span class="preview-title">{lesson.title}</span>
							<span class="preview-sub"
								>{lesson.videos.length} video{lesson.videos.length !== 1 ? 's' : ''} · {lesson
									.questions.length} questions</span
							>
						</div>
						{#if lesson.progress?.quizPassed}
							<span class="preview-badge passed">Passed ✓</span>
						{:else if lesson.progress}
							<span class="preview-badge attempted">In Progress</span>
						{:else}
							<span class="preview-badge locked">Not Started</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<!-- Sign in nudge — only show if not logged in -->
		{#if !user}
			<div class="signin-nudge">
				<div class="nudge-inner">
					<span class="nudge-icon">🔒</span>
					<div class="nudge-body">
						<strong>Sign in to track your progress</strong>
						<p>
							Your quiz scores and completed lessons are saved to your account so you never lose
							your place.
						</p>
					</div>
					<div class="nudge-actions">
						<a href="/login" class="cta-btn cta-dark">Sign In</a>
						<a href="/register" class="cta-btn cta-outline">Register Free</a>
					</div>
				</div>
			</div>
		{/if}

		<div class="landing-cta">
			<button class="cta-btn cta-large" on:click={startLearning}>
				{#if allCompleted}
					Review All Lessons
				{:else if hasStarted}
					Continue Where You Left Off
				{:else}
					Start Your First Lesson
				{/if}
				<Icon name="arrow-right" />
			</button>
		</div>
	</div>
{:else}
	<div class="page">
		<!-- Sidebar -->
		<aside class="sidebar">
			<div class="sidebar-header">
				<div class="eyebrow">Lessons</div>
				<h2>Your Learning Path</h2>
				{#if !user}
					<span>Sign in to save progress.</span>
				{/if}
			</div>
			<nav class="lesson-list">
				{#each data.lessons as lesson, i}
					<button
						class="lesson-item"
						class:active={activeLessonId === lesson.id}
						on:click={() => selectLesson(lesson)}
					>
						<div class="lesson-num">{String(i + 1).padStart(2, '0')}</div>
						<div class="lesson-meta">
							<span class="lesson-title">{lesson.title}</span>
							<span class="lesson-sub"
								>{lesson.videos.length} video{lesson.videos.length !== 1 ? 's' : ''} · {lesson
									.questions.length} questions</span
							>
						</div>
						{#if lesson.progress?.quizPassed}
							<span class="badge-complete" title="Completed">✓</span>
						{/if}
					</button>
				{/each}
			</nav>
		</aside>

		<!-- Main content -->
		<main class="content">
			{#if !activeLesson}
				<div class="empty">Select a lesson to begin.</div>
			{:else if stage === 'videos'}
				<div class="stage-header">
					<div class="eyebrow">Step 1 of 2 — Watch</div>
					<h1>{activeLesson.title}</h1>
					<p>{activeLesson.description}</p>
				</div>

				<!-- Video progress dots -->
				<div class="video-dots">
					{#each activeLesson.videos as v, i}
						<button
							class="dot"
							class:active={i === currentVideoIndex}
							class:watched={i < currentVideoIndex}
							on:click={() => (currentVideoIndex = i)}
							aria-label="Video {i + 1}"
						></button>
					{/each}
				</div>

				{#if currentVideo}
					<div class="video-card">
						<div class="video-title-row">
							<span class="video-index">{currentVideoIndex + 1} / {activeLesson.videos.length}</span
							>
							<h2 class="video-title">{currentVideo.title}</h2>
						</div>
						<div class="embed-wrap">
							<iframe
								src="https://www.youtube.com/embed/{currentVideo.youtubeId}?rel=0"
								title={currentVideo.title}
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowfullscreen
							></iframe>
						</div>
					</div>

					<div class="video-nav">
						<button
							class="nav-btn secondary"
							on:click={prevVideo}
							disabled={currentVideoIndex === 0}
						>
							<Icon name="arrow-left" /> Previous
						</button>
						<button class="nav-btn primary" on:click={nextVideo}>
							{currentVideoIndex < activeLesson.videos.length - 1 ? 'Next Video' : 'Start Quiz'}
							<Icon name="arrow-right" />
						</button>
					</div>
				{/if}
			{:else if stage === 'quiz'}
				<div class="stage-header">
					<div class="eyebrow">Step 2 of 2 — Quiz</div>
					<h1>{activeLesson.title}</h1>
					<p>Answer all questions — you need 70% to pass.</p>
				</div>

				<!-- Question progress -->
				<div class="quiz-progress">
					{#each activeLesson.questions as _, i}
						<div
							class="progress-seg"
							class:answered={answers[i] !== null}
							class:current={i === currentQuestionIndex}
						></div>
					{/each}
				</div>

				{#if currentQuestion}
					<div class="question-card">
						<div class="question-counter">
							Question {currentQuestionIndex + 1} of {activeLesson.questions.length}
						</div>
						<h2 class="question-text">{currentQuestion.question}</h2>

						<div class="options">
							{#each currentQuestion.options as option, i}
								<button
									class="option"
									class:selected={answers[currentQuestionIndex] === i}
									on:click={() => selectAnswer(i)}
								>
									<span class="option-letter">{String.fromCharCode(65 + i)}</span>
									<span>{option}</span>
								</button>
							{/each}
						</div>
					</div>

					<div class="video-nav">
						<button
							class="nav-btn secondary"
							on:click={prevQuestion}
							disabled={currentQuestionIndex === 0}
						>
							<Icon name="arrow-left" /> Previous
						</button>
						{#if currentQuestionIndex < activeLesson.questions.length - 1}
							<button
								class="nav-btn primary"
								on:click={nextQuestion}
								disabled={answers[currentQuestionIndex] === null}
							>
								Next <Icon name="arrow-right" />
							</button>
						{:else}
							<button class="nav-btn primary" on:click={submitQuiz} disabled={!allAnswered}>
								Submit Quiz <Icon name="arrow-right" />
							</button>
						{/if}
					</div>
				{/if}
			{:else if stage === 'result'}
				<div class="result-card" class:result-pass={passed} class:result-fail={!passed}>
					<div class="result-icon">{passed ? '🏆' : '📚'}</div>
					<h1 class="result-title">{passed ? 'Well done!' : 'Keep practising!'}</h1>
					<p class="result-score">
						You scored <strong>{score} / {activeLesson.questions.length}</strong>
					</p>
					<p class="result-sub">
						{passed
							? 'You passed this lesson. Move on to the next one!'
							: 'You need 70% to pass. Watch the videos again and try once more.'}
					</p>

					<!-- Review answers -->
					<div class="review">
						{#each activeLesson.questions as q, i}
							<div
								class="review-item"
								class:correct={answers[i] === q.correctAnswer}
								class:incorrect={answers[i] !== q.correctAnswer}
							>
								<span class="review-icon">{answers[i] === q.correctAnswer ? '✓' : '✗'}</span>
								<div class="review-body">
									<p class="review-q">{q.question}</p>
									<p class="review-answer">
										Your answer: <strong>{q.options[answers[i] ?? 0]}</strong>
										{#if answers[i] !== q.correctAnswer}
											· Correct: <strong>{q.options[q.correctAnswer]}</strong>
										{/if}
									</p>
								</div>
							</div>
						{/each}
					</div>

					<div class="result-actions">
						<button class="nav-btn secondary" on:click={retryQuiz}>Retry Quiz</button>
						{#if passed}
							<button
								class="nav-btn primary"
								on:click={() => {
									const idx = data.lessons.findIndex((l) => l.id === activeLessonId);
									if (idx < data.lessons.length - 1) selectLesson(data.lessons[idx + 1]);
								}}
							>
								Next Lesson <Icon name="arrow-right" />
							</button>
						{:else}
							<button
								class="nav-btn primary"
								on:click={() => {
									stage = 'videos';
									currentVideoIndex = 0;
								}}
							>
								Rewatch Videos
							</button>
						{/if}
					</div>

					{#if activeLesson}
						<div class="discussion">
							<h3 class="discussion-title">Discussion</h3>

							<!-- Comment form -->
							{#if user}
								<form
									method="POST"
									action="?/addComment"
									use:enhance={() => {
										return async ({ result }) => {
											if (result.type === 'success' && result.data?.comment && activeLesson) {
												const lesson = data.lessons.find((l) => l.id === activeLesson!.id);
												if (lesson) {
													// adding our comment to the list
													lesson.comments = [result.data.comment, ...lesson.comments];
													data.lessons = data.lessons;
												}
												commentBody = '';
											}
										};
									}}
								>
									<input type="hidden" name="lessonId" value={activeLesson.id} />
									<div class="comment-input-row">
										<div class="comment-avatar">{user.name?.charAt(0).toUpperCase()}</div>
										<textarea
											name="body"
											bind:value={commentBody}
											placeholder="Share how you found this lesson, or ask a question…"
											rows="2"
											maxlength="500"
										></textarea>
									</div>
									{#if form?.commentError}
										<p class="comment-error">{form.commentError}</p>
									{/if}
									<div class="comment-submit-row">
										<span class="char-count">{commentBody.length}/500</span>
										<button
											type="submit"
											class="comment-btn"
											disabled={commentBody.trim().length < 2}
										>
											Post Comment
										</button>
									</div>
								</form>
							{:else}
								<p class="sign-in-prompt">
									<a href="/login">Sign in</a> to join the discussion.
								</p>
							{/if}

							<!-- Comments list -->
							<div class="comments-list">
								{#if activeComments.length === 0}
									<p class="no-comments">No comments yet — be the first!</p>
								{:else}
									{#each activeComments as comment}
										<div class="comment">
											<div class="comment-avatar">{comment.userName.charAt(0).toUpperCase()}</div>
											<div class="comment-body">
												<div class="comment-meta">
													<strong>{comment.userName}</strong>
													<span>{formatDate(comment.createdAt)}</span>
												</div>
												<p>{comment.body}</p>

												{#if data.user?.id === comment.userId}
													<form method="POST" action="?/deleteComment" use:enhance>
														<input type="hidden" name="id" value={comment.id} />
														<button type="submit" class="delete-btn">Delete</button>
													</form>
												{/if}
											</div>
										</div>
									{/each}
								{/if}
							</div>
						</div>
					{/if}

					<!-- Save progress if logged in -->
					{#if user && resultSnapshot}
						<form
							method="POST"
							action="?/saveProgress"
							bind:this={progressForm}
							use:enhance={({ formData }) => {
								console.log('Sending:', Object.fromEntries(formData));
								return async ({ result }) => {
									console.log('Response:', result);
									if (result.type === 'success' && resultSnapshot) {
										// Manually patch local data so the sidebar badge updates
										// without triggering any server reload
										const lesson = data.lessons.find((l) => l.id === resultSnapshot!.lessonId);
										if (lesson) {
											lesson.progress = {
												...lesson.progress,
												quizPassed: resultSnapshot.score / resultSnapshot.total >= 0.7,
												bestScore: resultSnapshot.score
											};
											data.lessons = data.lessons; // trigger Svelte reactivity
										}
									}
								};
							}}
						>
							<input type="hidden" name="lessonId" value={resultSnapshot.lessonId} />
							<input type="hidden" name="score" value={resultSnapshot.score} />
							<input type="hidden" name="total" value={resultSnapshot.total} />
						</form>
					{/if}
				</div>
			{/if}
		</main>
	</div>
{/if}

<style>
	:global(body) {
		margin: 0;
		background: #faf8f4;
	}

	/* ── Landing ─────────────────────────────────────── */
	.landing {
		font-family: 'DM Sans', sans-serif;
	}

	.landing-banner {
		background: #0e1c2e;
		border-bottom: 1px solid rgba(255, 255, 255, 0.07);
		overflow: hidden;
	}

	.banner-inner {
		max-width: 1100px;
		margin: 0 auto;
		padding: 1.75rem 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
	}

	.banner-left {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.banner-logo {
		font-size: 2rem;
		opacity: 0.9;
		flex-shrink: 0;
	}

	.banner-title {
		font-family: 'Playfair Display', serif;
		font-size: 1.3rem;
		font-weight: 900;
		color: #faf8f4;
		margin: 0 0 0.2rem;
	}

	.banner-sub {
		font-size: 0.85rem;
		font-weight: 300;
		color: #7a94ae;
		margin: 0;
	}

	.banner-progress-track {
		height: 3px;
		background: rgba(255, 255, 255, 0.07);
	}

	.banner-progress-fill {
		height: 100%;
		background: #f4a96a;
		transition: width 0.6s ease;
	}

	.eyebrow {
		font-size: 0.7rem;
		font-weight: 500;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: #f4a96a;
		margin-bottom: 1rem;
	}

	/* ── CTA buttons ─────────────────────────────────── */
	.cta-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: #f4a96a;
		color: #0e1c2e;
		font-family: 'DM Sans', sans-serif;
		font-size: 0.95rem;
		font-weight: 500;
		padding: 0.875rem 1.75rem;
		border-radius: 4px;
		border: none;
		cursor: pointer;
		text-decoration: none;
		transition:
			background 0.2s,
			transform 0.15s;
	}
	.cta-btn:hover {
		background: #e8924e;
		transform: translateY(-2px);
	}

	.cta-dark {
		background: #0e1c2e;
		color: #faf8f4;
	}
	.cta-dark:hover {
		background: #1b3050;
	}

	.cta-outline {
		background: transparent;
		color: #faf8f4;
		border: 1.5px solid rgba(255, 255, 255, 0.25);
	}
	.cta-outline:hover {
		border-color: #f4a96a;
		color: #f4a96a;
		background: transparent;
	}

	.cta-large {
		font-size: 1.05rem;
		padding: 1rem 2.25rem;
	}

	/* ── How it works ────────────────────────────────── */
	.how-it-works {
		padding: 6rem 2rem;
		background: #faf8f4;
		max-width: 1100px;
		margin: 0 auto;
	}
	.how-it-works h2 {
		font-family: 'Playfair Display', serif;
		font-size: clamp(1.8rem, 3vw, 2.5rem);
		font-weight: 700;
		color: #0e1c2e;
		margin: 0.25rem 0 2.5rem;
	}

	.steps {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1.5px;
		background: #ddd8cc;
		border: 1.5px solid #ddd8cc;
	}

	.step {
		background: #faf8f4;
		padding: 2.25rem 2rem;
		position: relative;
		transition: background 0.2s;
	}
	.step:hover {
		background: #f0ece4;
	}

	.step-num {
		font-family: 'Playfair Display', serif;
		font-size: 3rem;
		font-weight: 900;
		color: #e8cdb5;
		line-height: 1;
		margin-bottom: 0.75rem;
	}
	.step h3 {
		font-family: 'Playfair Display', serif;
		font-size: 1.2rem;
		font-weight: 700;
		color: #0e1c2e;
		margin: 0 0 0.5rem;
	}
	.step p {
		font-size: 0.9rem;
		line-height: 1.7;
		color: #5a5a50;
		margin: 0;
	}

	/* ── Lessons preview ─────────────────────────────── */
	.lessons-preview {
		padding: 0 2rem 6rem;
		max-width: 1100px;
		margin: 0 auto;
	}
	.lessons-preview h2 {
		font-family: 'Playfair Display', serif;
		font-size: clamp(1.8rem, 3vw, 2.5rem);
		font-weight: 700;
		color: #0e1c2e;
		margin: 0.25rem 0 1.5rem;
	}

	.preview-list {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.preview-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.25rem;
		background: #fff;
		border: 1.5px solid #e8e2d8;
		border-radius: 6px;
		transition: border-color 0.2s;
	}
	.preview-item:hover {
		border-color: #f4a96a;
	}

	.preview-num {
		font-family: 'Playfair Display', serif;
		font-size: 1.1rem;
		font-weight: 900;
		color: #e8cdb5;
		flex-shrink: 0;
		width: 2rem;
	}

	.preview-meta {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.preview-title {
		font-size: 0.95rem;
		font-weight: 500;
		color: #0e1c2e;
	}
	.preview-sub {
		font-size: 0.775rem;
		color: #a09880;
	}

	.preview-badge {
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.2rem 0.65rem;
		border-radius: 20px;
		flex-shrink: 0;
	}
	.preview-badge.passed {
		background: rgba(58, 140, 106, 0.1);
		color: #3a8c6a;
	}
	.preview-badge.attempted {
		background: rgba(244, 169, 106, 0.15);
		color: #c95f2a;
	}
	.preview-badge.locked {
		background: #f0ece4;
		color: #a09880;
	}

	/* ── Sign in nudge ───────────────────────────────── */
	.signin-nudge {
		background: #0e1c2e;
		padding: 3rem 2rem;
	}
	.nudge-inner {
		max-width: 1100px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		gap: 1.5rem;
		flex-wrap: wrap;
	}
	.nudge-icon {
		font-size: 2rem;
		flex-shrink: 0;
	}
	.nudge-body {
		flex: 1;
		min-width: 200px;
	}
	.nudge-body strong {
		color: #faf8f4;
		font-size: 1rem;
	}
	.nudge-body p {
		color: #8ca0b8;
		font-size: 0.875rem;
		margin: 0.25rem 0 0;
		font-weight: 300;
	}
	.nudge-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	/* ── Bottom CTA ──────────────────────────────────── */
	.landing-cta {
		padding: 5rem 2rem;
		background: #f0ece4;
		text-align: center;
	}

	/* ── Responsive ──────────────────────────────────── */
	@media (max-width: 640px) {
		.how-it-works,
		.lessons-preview {
			padding-left: 1.25rem;
			padding-right: 1.25rem;
		}
		.nudge-inner {
			flex-direction: column;
			align-items: flex-start;
		}
	}

	.page {
		font-family: sans-serif;
		display: grid;
		grid-template-columns: 300px 1fr;
		min-height: 100vh;
	}

	.eyebrow {
		font-size: 0.7rem;
		font-weight: 500;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: #c95f2a;
		margin-bottom: 0.4rem;
	}

	/* ── Sidebar ─────────────────────────────────────── */
	.sidebar {
		background: #0e1c2e;
		display: flex;
		flex-direction: column;
		position: sticky;
		top: 0;
		height: 100vh;
		overflow-y: auto;
	}

	.sidebar-header {
		padding: 2rem 1.5rem 1.25rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.07);
		color: #faf8f4;
	}
	.sidebar-header h2 {
		font-family: 'Playfair Display', serif;
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0;
	}
	.sidebar-header span {
		font-size: 0.9rem;
	}

	.lesson-list {
		padding: 0.75rem 0;
	}

	.lesson-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding: 0.875rem 1.5rem;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		transition: background 0.2s;
		border-left: 3px solid transparent;
	}
	.lesson-item:hover {
		background: rgba(255, 255, 255, 0.04);
	}
	.lesson-item.active {
		background: rgba(244, 169, 106, 0.08);
		border-left-color: #f4a96a;
	}

	.lesson-num {
		font-family: 'Playfair Display', serif;
		font-size: 1.1rem;
		font-weight: 900;
		color: #f4a96a;
		opacity: 0.5;
		flex-shrink: 0;
		transition: opacity 0.2s;
	}
	.lesson-item.active .lesson-num {
		opacity: 1;
	}

	.lesson-meta {
		flex: 1;
		min-width: 0;
	}
	.lesson-title {
		display: block;
		font-size: 0.9rem;
		font-weight: 500;
		color: #b8c8dc;
		margin-bottom: 0.2rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.lesson-item.active .lesson-title {
		color: #faf8f4;
	}
	.lesson-sub {
		font-size: 0.75rem;
		color: #5a6e82;
		font-weight: 300;
	}

	.badge-complete {
		font-size: 0.7rem;
		background: #3a8c6a;
		color: #fff;
		border-radius: 50%;
		width: 18px;
		height: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	/* ── Content ─────────────────────────────────────── */
	.content {
		padding: 3rem 3rem 5rem;
		max-width: 780px;
	}

	.stage-header {
		margin-bottom: 2rem;
	}
	.stage-header h1 {
		font-family: 'Playfair Display', serif;
		font-size: clamp(1.8rem, 3vw, 2.5rem);
		font-weight: 900;
		color: #0e1c2e;
		margin: 0.25rem 0 0.5rem;
	}
	.stage-header p {
		font-size: 1rem;
		color: #6a6a60;
		margin: 0;
		font-weight: 300;
	}

	/* ── Video dots ──────────────────────────────────── */
	.video-dots {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}
	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		border: none;
		cursor: pointer;
		background: #ddd8cc;
		transition:
			background 0.2s,
			transform 0.15s;
		padding: 0;
	}
	.dot.watched {
		background: #6aab8e;
	}
	.dot.active {
		background: #f4a96a;
		transform: scale(1.3);
	}

	/* ── Video card ──────────────────────────────────── */
	.video-card {
		background: #fff;
		border: 1.5px solid #e8e2d8;
		border-radius: 8px;
		overflow: hidden;
		margin-bottom: 1.5rem;
	}

	.video-title-row {
		padding: 1rem 1.25rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		border-bottom: 1px solid #f0ece4;
	}
	.video-index {
		font-size: 0.75rem;
		font-weight: 500;
		color: #a09880;
		letter-spacing: 0.05em;
		flex-shrink: 0;
	}
	.video-title {
		font-family: 'Playfair Display', serif;
		font-size: 1rem;
		font-weight: 700;
		color: #0e1c2e;
		margin: 0;
	}

	.embed-wrap {
		position: relative;
		padding-bottom: 56.25%;
		height: 0;
		background: #0e1c2e;
	}
	.embed-wrap iframe {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		border: none;
	}

	/* ── Navigation buttons ──────────────────────────── */
	.video-nav {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
	}

	.nav-btn {
		font-family: sans-serif;
		font-size: 0.9rem;
		font-weight: 500;
		padding: 0.7rem 1.4rem;
		border-radius: 5px;
		cursor: pointer;
		transition:
			background 0.2s,
			transform 0.15s,
			opacity 0.2s;
		border: none;
	}
	.nav-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}
	.nav-btn:not(:disabled):hover {
		transform: translateY(-1px);
	}

	.nav-btn.primary {
		background: #0e1c2e;
		color: #faf8f4;
	}
	.nav-btn.primary:not(:disabled):hover {
		background: #1b3050;
	}

	.nav-btn.secondary {
		background: #f0ece4;
		color: #0e1c2e;
	}
	.nav-btn.secondary:not(:disabled):hover {
		background: #e8e2d8;
	}

	/* ── Quiz progress bar ───────────────────────────── */
	.quiz-progress {
		display: flex;
		gap: 4px;
		margin-bottom: 1.75rem;
	}
	.progress-seg {
		flex: 1;
		height: 4px;
		border-radius: 2px;
		background: #e8e2d8;
		transition: background 0.3s;
	}
	.progress-seg.answered {
		background: #6aab8e;
	}
	.progress-seg.current {
		background: #f4a96a;
	}

	/* ── Question card ───────────────────────────────── */
	.question-card {
		background: #fff;
		border: 1.5px solid #e8e2d8;
		border-radius: 8px;
		padding: 2rem;
		margin-bottom: 1.5rem;
	}

	.question-counter {
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #a09880;
		margin-bottom: 0.75rem;
	}

	.question-text {
		font-family: 'Playfair Display', serif;
		font-size: 1.3rem;
		font-weight: 700;
		color: #0e1c2e;
		margin: 0 0 1.5rem;
		line-height: 1.4;
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.option {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding: 0.875rem 1rem;
		border: 1.5px solid #e8e2d8;
		border-radius: 6px;
		background: #faf8f4;
		cursor: pointer;
		text-align: left;
		font-family: sans-serif;
		font-size: 0.95rem;
		color: #2a2a22;
		transition:
			border-color 0.2s,
			background 0.2s;
	}
	.option:hover {
		border-color: #f4a96a;
		background: #fff;
	}
	.option.selected {
		border-color: #f4a96a;
		background: rgba(244, 169, 106, 0.08);
	}

	.option-letter {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: #e8e2d8;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.8rem;
		font-weight: 700;
		color: #6a6a60;
		flex-shrink: 0;
		transition:
			background 0.2s,
			color 0.2s;
	}
	.option.selected .option-letter {
		background: #f4a96a;
		color: #0e1c2e;
	}

	/* ── Result card ─────────────────────────────────── */
	.result-card {
		background: #fff;
		border: 1.5px solid #e8e2d8;
		border-radius: 8px;
		padding: 2.5rem 2rem;
	}
	.result-pass {
		border-color: #6aab8e;
	}
	.result-fail {
		border-color: #f4a96a;
	}

	.result-icon {
		font-size: 3rem;
		margin-bottom: 0.75rem;
	}
	.result-title {
		font-family: 'Playfair Display', serif;
		font-size: 2rem;
		font-weight: 900;
		color: #0e1c2e;
		margin: 0 0 0.5rem;
	}
	.result-score {
		font-size: 1.1rem;
		color: #2a2a22;
		margin: 0 0 0.5rem;
	}
	.result-sub {
		font-size: 0.95rem;
		color: #6a6a60;
		margin: 0 0 2rem;
		font-weight: 300;
	}

	.review {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 2rem;
	}

	.review-item {
		display: flex;
		gap: 0.875rem;
		padding: 0.875rem 1rem;
		border-radius: 6px;
		border: 1px solid #e8e2d8;
	}
	.review-item.correct {
		background: rgba(106, 171, 142, 0.08);
		border-color: #6aab8e;
	}
	.review-item.incorrect {
		background: rgba(224, 92, 58, 0.06);
		border-color: #e8a090;
	}

	.review-icon {
		font-size: 0.9rem;
		font-weight: 700;
		flex-shrink: 0;
		margin-top: 2px;
	}
	.review-item.correct .review-icon {
		color: #3a8c6a;
	}
	.review-item.incorrect .review-icon {
		color: #e05c3a;
	}

	.review-q {
		font-size: 0.875rem;
		font-weight: 500;
		color: #0e1c2e;
		margin: 0 0 0.25rem;
	}
	.review-answer {
		font-size: 0.825rem;
		color: #6a6a60;
		margin: 0;
	}

	.result-actions {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.empty {
		color: #a09880;
		font-size: 1rem;
		padding: 4rem 0;
		text-align: center;
	}

	/* ── Responsive ──────────────────────────────────── */
	@media (max-width: 768px) {
		.page {
			grid-template-columns: 1fr;
		}
		.sidebar {
			position: static;
			height: auto;
		}
		.content {
			padding: 2rem 1.25rem 4rem;
		}
	}

	.discussion {
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 1.5px solid #e8e2d8;
	}

	.discussion-title {
		font-family: 'Playfair Display', serif;
		font-size: 1.2rem;
		font-weight: 700;
		color: #0e1c2e;
		margin: 0 0 1.25rem;
	}

	.comment-input-row {
		display: flex;
		gap: 0.75rem;
		align-items: flex-start;
		margin-bottom: 0.5rem;
	}

	textarea {
		flex: 1;
		font-family: 'DM Sans', sans-serif;
		font-size: 0.9rem;
		color: #0e1c2e;
		background: #fff;
		border: 1.5px solid #e8e2d8;
		border-radius: 6px;
		padding: 0.7rem 0.875rem;
		resize: vertical;
		outline: none;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
		line-height: 1.6;
	}
	textarea:focus {
		border-color: #f4a96a;
		box-shadow: 0 0 0 3px rgba(244, 169, 106, 0.15);
	}

	.comment-submit-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-left: 3rem;
	}

	.char-count {
		font-size: 0.75rem;
		color: #a09880;
	}

	.comment-btn {
		font-family: 'DM Sans', sans-serif;
		font-size: 0.85rem;
		font-weight: 500;
		background: #0e1c2e;
		color: #faf8f4;
		border: none;
		border-radius: 4px;
		padding: 0.5rem 1.1rem;
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

	.comment-error {
		font-size: 0.8rem;
		color: #e05c3a;
		margin: 0 0 0.5rem;
		padding-left: 3rem;
	}

	.sign-in-prompt {
		font-size: 0.9rem;
		color: #7a7a6e;
		margin: 0 0 1.25rem;
	}
	.sign-in-prompt a {
		color: #f4a96a;
		text-decoration: none;
	}
	.sign-in-prompt a:hover {
		color: #c95f2a;
	}

	.comments-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1.25rem;
	}

	.no-comments {
		font-size: 0.875rem;
		color: #a09880;
		text-align: center;
		padding: 1.5rem 0;
	}

	.comment {
		display: flex;
		gap: 0.75rem;
		align-items: flex-start;
	}

	.comment-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: #f4a96a;
		color: #0e1c2e;
		font-size: 0.8rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.comment-body {
		flex: 1;
	}

	.comment-meta {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		margin-bottom: 0.3rem;
	}
	.comment-meta strong {
		font-size: 0.875rem;
		color: #0e1c2e;
	}
	.comment-meta span {
		font-size: 0.75rem;
		color: #a09880;
	}

	.comment-body p {
		font-size: 0.9rem;
		color: #3a3a32;
		margin: 0 0 0.35rem;
		line-height: 1.6;
	}

	.delete-btn {
		background: none;
		border: none;
		font-size: 0.75rem;
		color: #c09080;
		cursor: pointer;
		padding: 0;
		font-family: 'DM Sans', sans-serif;
		transition: color 0.2s;
	}
	.delete-btn:hover {
		color: #e05c3a;
	}
</style>
