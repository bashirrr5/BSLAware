<script>
	import Icon from '$lib/Icon.svelte';
	import { onMount } from 'svelte';

	let visible = false;
	let statsVisible = false;
	let statsSection;

	const stats = [
		{ value: '151,000', label: 'BSL users in the UK' },
		{ value: '87,000', label: 'Deaf people use BSL as their first language' },
		{ value: '1 in 6', label: 'People in the UK are affected by hearing loss' },
		{ value: '2002', label: 'BSL became officially recognised' }
	];

	const quizFeatures = [
		{
			title: 'Fingerspelling',
			description: 'Learn the BSL alphabet and how to spell names and words letter by letter.'
		},
		{
			title: 'Everyday Signs',
			description: 'Master common greetings, emotions and phrases used in daily life.'
		},
		{
			title: 'Numbers & Colours',
			description: 'Build a strong foundation with essential vocabulary quizzes.'
		}
	];

	const reasons = [
		{
			title: 'Break Down Barriers',
			body: 'Around 151,000 people in the UK use BSL. When hearing people learn even basic signs, it opens doors to genuine human connection and breaks down the isolation many Deaf people experience.'
		},
		{
			title: "It's a Living Language",
			body: 'BSL is not a simplified version of English — it is a rich, expressive language with its own grammar, structure, and culture. Recognising this is the first step to true inclusion.'
		},
		{
			title: 'Workplace & Community Inclusion',
			body: "From hospitals to schools to coffee shops, BSL awareness makes public spaces genuinely accessible. Even knowing a handful of signs can transform someone's day."
		}
	];

	onMount(() => {
		visible = true;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) statsVisible = true;
				});
			},
			{ threshold: 0.2 }
		);

		if (statsSection) observer.observe(statsSection);
		return () => observer.disconnect();
	});
</script>

<svelte:head>
	<title>BSL Aware</title>
</svelte:head>

<div class="page" class:loaded={visible}>
	<!-- Hero -->
	<section class="hero">
		<div class="hero-bg">
			<div class="blob blob-1"></div>
			<div class="blob blob-2"></div>
			<div class="grain"></div>
		</div>
		<div class="hero-inner">
			<div class="eyebrow">British Sign Language</div>
			<h1 class="hero-title">
				<span class="line">Hands that</span>
				<em class="line accent">speak</em>
				<span class="line">volumes.</span>
			</h1>
			<p class="hero-sub">
				BSL is the language of over 150,000 people across the UK. This is your starting point for
				understanding it, respecting it, and learning it.
			</p>
			<a href="/learn" class="cta-btn">
				<span>Start Learning</span>
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg
				>
			</a>
		</div>
		<div class="hero-hand" aria-hidden="true">🤟</div>
	</section>

	<!-- Why It Matters -->
	<section class="why">
		<div class="container">
			<div class="section-label">Why It Matters</div>
			<h2 class="section-title">Awareness <br />changes everything</h2>
			<div class="reasons-grid">
				{#each reasons as reason, i}
					<article class="reason-card" style="--delay: {i * 120}ms">
						<div class="reason-num">{String(i + 1).padStart(2, '0')}</div>
						<div class="reason-body">
							<h3>{reason.title}</h3>
							<p>{reason.body}</p>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- Stats -->
	<section class="stats-section" bind:this={statsSection}>
		<div class="stats-inner" class:stats-animate={statsVisible}>
			{#each stats as stat, i}
				<div class="stat" style="--i: {i}">
					<div class="stat-value">{stat.value}</div>
					<div class="stat-label">{stat.label}</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Quizzes -->
	<section class="quizzes">
		<div class="container">
			<div class="quiz-intro">
				<div class="section-label">Our Quizzes</div>
				<h2 class="section-title">Learn by doing</h2>
				<p class="quiz-sub">
					No textbooks. No memorisation drills. Our interactive quizzes meet you where you are and
					guide you forward at your own pace — from your very first sign to full conversations.
				</p>
			</div>
			<div class="features-grid">
				{#each quizFeatures as feature, i}
					<div class="feature-card" style="--delay: {i * 80}ms">
						<h3 class="feature-title">{feature.title}</h3>
						<p class="feature-desc">{feature.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Closing CTA -->
	<section class="closing">
		<div class="closing-inner">
			<p class="closing-quote">
				"Language is the road map of a culture. It tells you where its people come from and where
				they are going."
			</p>
			<p class="closing-attr">— Rita Mae Brown</p>
			<p class="closing-body">
				BSL is that road map for hundreds of thousands of people in Britain. You don't need to be
				fluent to make a difference — you just need to start.
			</p>
			<a href="/learn" class="cta-btn">Take your first quiz <Icon name="arrow-right" /></a>
		</div>
	</section>
</div>

<style>
	/* ── Tokens ─────────────────────────────────────────── */
	:global(body) {
		margin: 0;
		background: #faf8f4;
		color: #1a1a18;
	}

	.page {
		font-family: sans-serif;
		opacity: 0;
		transform: translateY(10px);
		transition:
			opacity 0.7s ease,
			transform 0.7s ease;
	}
	.page.loaded {
		opacity: 1;
		transform: none;
	}

	/* ── Hero ────────────────────────────────────────────── */
	.hero {
		position: relative;
		min-height: 92vh;
		display: flex;
		align-items: center;
		overflow: hidden;
		padding: 5rem 2rem 4rem;
	}

	.hero-bg {
		position: absolute;
		inset: 0;
		background: #0e1c2e;
		z-index: 0;
	}

	.blob {
		position: absolute;
		border-radius: 50%;
		filter: blur(90px);
		opacity: 0.35;
	}
	.blob-1 {
		width: 55vw;
		height: 55vw;
		background: #1b4f8c;
		top: -15%;
		left: -10%;
		animation: drift 14s ease-in-out infinite alternate;
	}
	.blob-2 {
		width: 40vw;
		height: 40vw;
		background: #c95f2a;
		bottom: -10%;
		right: -5%;
		animation: drift 18s ease-in-out infinite alternate-reverse;
	}
	@keyframes drift {
		from {
			transform: translate(0, 0) scale(1);
		}
		to {
			transform: translate(4%, 4%) scale(1.06);
		}
	}

	.grain {
		position: absolute;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
		opacity: 0.5;
		pointer-events: none;
	}

	.hero-inner {
		position: relative;
		z-index: 1;
		max-width: 720px;
	}

	.eyebrow {
		font-family: sans-serif;
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: #f4a96a;
		margin-bottom: 1.25rem;
	}

	.hero-title {
		font-family: 'Playfair Display', serif;
		font-size: clamp(3.5rem, 8vw, 6.5rem);
		font-weight: 900;
		line-height: 1;
		color: #faf8f4;
		margin: 0 0 1.5rem;
	}
	.hero-title .line {
		display: block;
	}
	.hero-title .accent {
		color: #f4a96a;
		font-style: italic;
	}

	.hero-sub {
		font-size: 1.15rem;
		font-weight: 300;
		line-height: 1.75;
		color: #b8c8dc;
		max-width: 520px;
		margin: 0 0 2.5rem;
	}

	.hero-hand {
		position: absolute;
		right: 4vw;
		bottom: 6vh;
		font-size: clamp(8rem, 18vw, 18rem);
		opacity: 0.07;
		user-select: none;
		z-index: 1;
		filter: grayscale(1);
		animation: float 6s ease-in-out infinite;
	}
	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-16px);
		}
	}

	/* ── CTA Button ──────────────────────────────────────── */
	.cta-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: #f4a96a;
		color: #0e1c2e;
		font-family: sans-serif;
		font-size: 0.95rem;
		font-weight: 500;
		padding: 0.875rem 1.75rem;
		border-radius: 4px;
		text-decoration: none;
		transition:
			background 0.2s,
			transform 0.15s;
	}
	.cta-btn:hover {
		background: #e8924e;
		transform: translateY(-2px);
	}

	/* ── Sections shared ─────────────────────────────────── */
	.container {
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.section-label {
		font-size: 0.7rem;
		font-weight: 500;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: #c95f2a;
		margin-bottom: 0.75rem;
	}

	.section-title {
		font-family: 'Playfair Display', serif;
		font-size: clamp(2.2rem, 5vw, 3.5rem);
		font-weight: 700;
		line-height: 1.15;
		color: #0e1c2e;
		margin: 0 0 2.5rem;
	}

	/* ── Why Section ─────────────────────────────────────── */
	.why {
		padding: 7rem 2rem;
		background: #faf8f4;
	}

	.reasons-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5px;
		background: #ddd8cc;
		border: 1.5px solid #ddd8cc;
	}

	.reason-card {
		background: #faf8f4;
		padding: 2.5rem 2rem;
		display: flex;
		gap: 1.5rem;
		transition: background 0.25s;
	}
	.reason-card:hover {
		background: #f0ece4;
	}

	.reason-num {
		font-family: 'Playfair Display', serif;
		font-size: 2.5rem;
		font-weight: 900;
		color: #e8cdb5;
		line-height: 1;
		flex-shrink: 0;
	}

	.reason-body h3 {
		font-family: 'Playfair Display', serif;
		font-size: 1.2rem;
		font-weight: 700;
		margin: 0 0 0.75rem;
		color: #0e1c2e;
	}
	.reason-body p {
		font-size: 0.95rem;
		line-height: 1.75;
		color: #5a5a50;
		margin: 0;
	}

	/* ── Stats ───────────────────────────────────────────── */
	.stats-section {
		background: #0e1c2e;
		padding: 5rem 2rem;
		overflow: hidden;
	}

	.stats-inner {
		max-width: 1100px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 3rem;
	}

	.stat {
		text-align: center;
		opacity: 0;
		transform: translateY(24px);
		transition:
			opacity 0.55s ease calc(var(--i) * 120ms),
			transform 0.55s ease calc(var(--i) * 120ms);
	}
	.stats-animate .stat {
		opacity: 1;
		transform: none;
	}

	.stat-value {
		font-family: 'Playfair Display', serif;
		font-size: clamp(2rem, 4vw, 3rem);
		font-weight: 900;
		color: #f4a96a;
		line-height: 1;
		margin-bottom: 0.5rem;
	}
	.stat-label {
		font-size: 0.875rem;
		font-weight: 300;
		color: #8ca0b8;
		line-height: 1.5;
	}

	/* ── Quizzes ─────────────────────────────────────────── */
	.quizzes {
		padding: 7rem 2rem;
		background: #faf8f4;
	}

	.quiz-intro {
		max-width: 600px;
		margin-bottom: 3.5rem;
	}
	.quiz-sub {
		font-size: 1rem;
		line-height: 1.8;
		color: #5a5a50;
		margin: 0;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1.25rem;
		margin-bottom: 3.5rem;
	}

	.feature-card {
		background: #fff;
		border: 1.5px solid #e8e2d8;
		border-radius: 6px;
		padding: 2rem 1.75rem;
		transition:
			border-color 0.2s,
			box-shadow 0.2s,
			transform 0.2s;
	}
	.feature-card:hover {
		border-color: #f4a96a;
		box-shadow: 0 8px 28px rgba(200, 100, 40, 0.1);
		transform: translateY(-4px);
	}

	.feature-title {
		font-family: 'Playfair Display', serif;
		font-size: 1.15rem;
		font-weight: 700;
		margin: 0 0 0.6rem;
		color: #0e1c2e;
	}
	.feature-desc {
		font-size: 0.9rem;
		line-height: 1.7;
		color: #6a6a60;
		margin: 0;
	}

	/* ── Closing ─────────────────────────────────────────── */
	.closing {
		background: #f0ece4;
		padding: 6rem 2rem;
		text-align: center;
	}
	.closing-inner {
		max-width: 680px;
		margin: 0 auto;
	}
	.closing-quote {
		font-family: 'Playfair Display', serif;
		font-size: clamp(1.3rem, 2.5vw, 1.75rem);
		font-style: italic;
		color: #0e1c2e;
		line-height: 1.55;
		margin: 0 0 0.75rem;
	}
	.closing-attr {
		font-size: 0.8rem;
		letter-spacing: 0.1em;
		color: #a09880;
		text-transform: uppercase;
		margin: 0 0 2rem;
	}
	.closing-body {
		font-size: 1rem;
		line-height: 1.8;
		color: #5a5a50;
		margin: 0 0 2.5rem;
	}

	/* ── Responsive ──────────────────────────────────────── */
	@media (max-width: 640px) {
		.hero {
			padding: 4rem 1.25rem 3rem;
			min-height: auto;
		}
		.why,
		.quizzes {
			padding: 5rem 1.25rem;
		}
		.reason-card {
			flex-direction: column;
			gap: 0.75rem;
		}
		.reason-num {
			font-size: 1.5rem;
		}
		.hero-hand {
			display: none;
		}
	}
</style>
