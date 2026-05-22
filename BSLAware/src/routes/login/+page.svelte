<script>
	import { enhance } from '$app/forms';

	export let form; // receives the fail() payload
	let email = '';
	let password = '';
	let showPassword = false;
	let loading = false;
</script>

<svelte:head>
	<title>Sign In at BSL Aware</title>
</svelte:head>

<div class="page">
	<div class="left" aria-hidden="true">
		<div class="blob blob-1"></div>
		<div class="blob blob-2"></div>
		<div class="left-content">
			<a href="/" class="logo">
				<span class="logo-bsl">BSL</span><span class="logo-aware">Aware</span>
			</a>
			<blockquote class="tagline">
				"The hands speak<br />what words cannot."
			</blockquote>
			<div class="hand-emoji" aria-hidden="true">🤟</div>
		</div>
	</div>

	<div class="right">
		<div class="form-card">
			<div class="form-header">
				<a href="/" class="logo logo-mobile">
					<span class="logo-bsl">BSL</span><span class="logo-aware">Aware</span>
				</a>
				<h1>Welcome back</h1>
				<p>Sign in to continue your BSL journey.</p>
			</div>

			<form method="POST" use:enhance>
				{#if form?.error}
					<div class="error-banner" role="alert">
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line
								x1="12"
								y1="16"
								x2="12.01"
								y2="16"
							/></svg
						>
						{form.error}
					</div>
				{/if}

				<div class="field">
					<label for="email">Email address</label>
					<div class="input-wrap">
						<svg
							class="input-icon"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
							><rect x="2" y="4" width="20" height="16" rx="2" /><path
								d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
							/></svg
						>
						<input
							id="email"
							name="email"
							type="email"
							bind:value={email}
							placeholder="you@example.com"
							autocomplete="email"
							required
							disabled={loading}
						/>
					</div>
				</div>

				<div class="field">
					<div class="label-row">
						<label for="password">Password</label>
						<!-- <a href="/forgot-password" class="forgot">Forgot password?</a> -->
					</div>
					<div class="input-wrap">
						<svg
							class="input-icon"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
							><rect x="3" y="11" width="18" height="11" rx="2" /><path
								d="M7 11V7a5 5 0 0 1 10 0v4"
							/></svg
						>
						<input
							id="password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							placeholder="••••••••"
							autocomplete="current-password"
							required
							disabled={loading}
						/>
						<button
							type="button"
							class="toggle-pw"
							aria-label={showPassword ? 'Hide password' : 'Show password'}
							on:click={() => (showPassword = !showPassword)}
							tabindex="0"
						>
							{#if showPassword}
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path
										d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
									/><path
										d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
									/><line x1="1" y1="1" x2="23" y2="23" /></svg
								>
							{:else}
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle
										cx="12"
										cy="12"
										r="3"
									/></svg
								>
							{/if}
						</button>
					</div>
				</div>

				<button type="submit" class="submit-btn" disabled={loading}>
					{#if loading}
						<span class="spinner" aria-hidden="true"></span>
						<span>Signing in…</span>
					{:else}
						<span>Sign In</span>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg
						>
					{/if}
				</button>
			</form>

			<p class="register-link">
				Don't have an account? <a href="/register">Create one free</a>
			</p>
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		background: #faf8f4;
	}

	.page {
		font-family: sans-serif;
		min-height: 100vh;
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	/* ── Left panel ─────────────────────────────────── */
	.left {
		position: relative;
		background: #0e1c2e;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.blob {
		position: absolute;
		border-radius: 50%;
		filter: blur(80px);
		opacity: 0.3;
	}
	.blob-1 {
		width: 60%;
		height: 60%;
		background: #1b4f8c;
		top: -10%;
		left: -10%;
		animation: drift 14s ease-in-out infinite alternate;
	}
	.blob-2 {
		width: 45%;
		height: 45%;
		background: #c95f2a;
		bottom: -5%;
		right: -5%;
		animation: drift 18s ease-in-out infinite alternate-reverse;
	}
	@keyframes drift {
		from {
			transform: translate(0, 0) scale(1);
		}
		to {
			transform: translate(5%, 5%) scale(1.08);
		}
	}

	.left-content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: 3rem;
	}

	.tagline {
		font-family: 'Playfair Display', serif;
		font-size: clamp(1.6rem, 2.5vw, 2.4rem);
		font-style: italic;
		font-weight: 700;
		color: #faf8f4;
		line-height: 1.4;
		margin: 3rem 0 0;
		border: none;
		padding: 0;
	}

	.hand-emoji {
		font-size: 6rem;
		margin-top: auto;
		opacity: 0.12;
		padding-top: 4rem;
		filter: grayscale(1);
		animation: float 6s ease-in-out infinite;
	}
	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-12px);
		}
	}

	/* ── Logo ───────────────────────────────────────── */
	.logo {
		text-decoration: none;
		display: inline-flex;
		align-items: baseline;
		gap: 1px;
	}
	.logo-bsl {
		font-family: 'Playfair Display', serif;
		font-size: 1.5rem;
		font-weight: 900;
		color: #f4a96a;
	}
	.logo-aware {
		font-family: sans-serif;
		font-size: 1.1rem;
		font-weight: 300;
		color: #faf8f4;
	}
	.logo-mobile {
		display: none;
	}

	/* ── Right panel ────────────────────────────────── */
	.right {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background: #faf8f4;
	}

	.form-card {
		width: 100%;
		max-width: 400px;
	}

	.form-header {
		margin-bottom: 2.25rem;
	}
	.form-header h1 {
		font-family: 'Playfair Display', serif;
		font-size: 2rem;
		font-weight: 900;
		color: #0e1c2e;
		margin: 0 0 0.4rem;
	}
	.form-header p {
		font-size: 0.95rem;
		color: #7a7a6e;
		margin: 0;
		font-weight: 300;
	}

	/* ── Error banner ───────────────────────────────── */
	.error-banner {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: #fef0eb;
		border: 1px solid #f4a96a;
		color: #c95f2a;
		font-size: 0.875rem;
		padding: 0.75rem 1rem;
		border-radius: 6px;
		margin-bottom: 1.5rem;
	}

	/* ── Fields ─────────────────────────────────────── */
	.field {
		margin-bottom: 1.25rem;
	}

	label {
		display: block;
		font-size: 0.8rem;
		font-weight: 500;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: #4a4a42;
		margin-bottom: 0.5rem;
	}

	.label-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}
	.label-row label {
		margin-bottom: 0;
	}

	.forgot {
		font-size: 0.8rem;
		color: #f4a96a;
		text-decoration: none;
		font-weight: 400;
		transition: color 0.2s;
	}
	.forgot:hover {
		color: #c95f2a;
	}

	.input-wrap {
		position: relative;
		display: flex;
		align-items: center;
	}

	.input-icon {
		position: absolute;
		left: 0.875rem;
		color: #a0a090;
		pointer-events: none;
		flex-shrink: 0;
	}

	input {
		width: 100%;
		font-family: sans-serif;
		font-size: 0.95rem;
		font-weight: 400;
		color: #0e1c2e;
		background: #fff;
		border: 1.5px solid #ddd8cc;
		border-radius: 6px;
		padding: 0.75rem 2.75rem 0.75rem 2.6rem;
		outline: none;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
		box-sizing: border-box;
	}
	input::placeholder {
		color: #b8b8a8;
	}
	input:focus {
		border-color: #f4a96a;
		box-shadow: 0 0 0 3px rgba(244, 169, 106, 0.15);
	}
	input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.toggle-pw {
		position: absolute;
		right: 0.75rem;
		background: none;
		border: none;
		cursor: pointer;
		color: #a0a090;
		padding: 4px;
		display: flex;
		align-items: center;
		border-radius: 4px;
		transition: color 0.2s;
	}
	.toggle-pw:hover {
		color: #0e1c2e;
	}

	/* ── Submit ─────────────────────────────────────── */
	.submit-btn {
		width: 100%;
		margin-top: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		background: #0e1c2e;
		color: #faf8f4;
		font-family: sans-serif;
		font-size: 0.95rem;
		font-weight: 500;
		padding: 0.875rem;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition:
			background 0.2s,
			transform 0.15s;
	}
	.submit-btn:hover:not(:disabled) {
		background: #1b3050;
		transform: translateY(-1px);
	}
	.submit-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.spinner {
		width: 15px;
		height: 15px;
		border: 2px solid rgba(250, 248, 244, 0.3);
		border-top-color: #faf8f4;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
		flex-shrink: 0;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* ── Register link ──────────────────────────────── */
	.register-link {
		text-align: center;
		font-size: 0.875rem;
		color: #7a7a6e;
		margin-top: 1.75rem;
	}
	.register-link a {
		color: #f4a96a;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s;
	}
	.register-link a:hover {
		color: #c95f2a;
	}

	/* ── Responsive ─────────────────────────────────── */
	@media (max-width: 720px) {
		.page {
			grid-template-columns: 1fr;
		}
		.left {
			display: none;
		}
		.logo-mobile {
			display: inline-flex;
			margin-bottom: 1.5rem;
		}
		.logo-mobile .logo-aware {
			color: #0e1c2e;
		}
		.right {
			align-items: flex-start;
			padding: 3rem 1.5rem;
		}
	}
</style>
