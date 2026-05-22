<script>
	import { page } from '$app/stores';
	import Icon from './Icon.svelte';

	$: user = $page.data.user;

	let scrolled = false;
	let menuOpen = false;

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/learn', label: 'Learn' },
		{ href: '/dictionary', label: 'Dictionary' }
	];

	// Shown only when logged in — add after the main links
	$: authedLinks = user
		? [
				{ href: '/stats', label: 'Stats' },
				{ href: '/forum', label: 'Forum' }
			]
		: [];
	$: allLinks = [...links, ...authedLinks];

	function handleScroll() {
		scrolled = window.scrollY > 20;
	}

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
	}
</script>

<svelte:window on:scroll={handleScroll} />

<header class="navbar" class:scrolled class:menu-open={menuOpen}>
	<div class="nav-inner">
		<!-- Logo -->
		<a href="/" class="logo" on:click={closeMenu}>
			<span class="logo-bsl">BSL</span><span class="logo-aware">Aware</span>
		</a>

		<!-- Desktop Links -->
		<nav class="nav-links" aria-label="Main navigation">
			{#each allLinks as link}
				<a href={link.href} class="nav-link" class:active={$page.url.pathname === link.href}>
					{link.label}
				</a>
			{/each}
		</nav>

		<!-- Right side -->
		<div class="nav-right">
			{#if user}
				<div class="user-menu">
					<div class="avatar" aria-label={user.name}>
						{user.name?.charAt(0).toUpperCase()}
					</div>
					<span class="user-name">{user.name}</span>
					<form method="POST" action="/logout">
						<button type="submit" class="logout-btn">Sign Out</button>
					</form>
				</div>
			{:else}
				<a href="/login" class="login-btn">
					<Icon name="sign-in" />
					<span>Sign In</span>
				</a>
			{/if}

			<!-- Mobile hamburger -->
			<button
				class="hamburger"
				aria-label={menuOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={menuOpen}
				on:click={toggleMenu}
			>
				<span class="bar bar-1"></span>
				<span class="bar bar-2"></span>
				<span class="bar bar-3"></span>
			</button>
		</div>
	</div>

	<!-- Mobile menu -->
	<div class="mobile-menu" aria-hidden={!menuOpen}>
		<nav class="mobile-links">
			{#each allLinks as link}
				<a
					href={link.href}
					class="mobile-link"
					class:active={$page.url.pathname === link.href}
					on:click={closeMenu}
				>
					{link.label}
				</a>
			{/each}
			{#if !user}
				<a href="/login" class="mobile-login" on:click={closeMenu}>Sign In</a>
			{/if}
		</nav>
	</div>
</header>

<!-- Spacer so content doesn't sit under the fixed navbar -->
<div class="nav-spacer"></div>

<style>
	.navbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		font-family: sans-serif;
		transition:
			background 0.3s ease,
			box-shadow 0.3s ease,
			border-color 0.3s ease;
		background: rgba(14, 28, 46, 0.96);
		border-bottom: 1px solid transparent;
	}

	.navbar.scrolled,
	.navbar.menu-open {
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-bottom-color: rgba(255, 255, 255, 0.07);
		box-shadow: 0 4px 32px rgba(0, 0, 0, 0.25);
	}

	.nav-inner {
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 2rem;
		height: 68px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
	}

	/* ── Logo ───────────────────────────────────────── */
	.logo {
		text-decoration: none;
		display: flex;
		align-items: baseline;
		gap: 1px;
		flex-shrink: 0;
	}
	.logo-bsl {
		font-family: serif;
		font-size: 1.35rem;
		font-weight: 900;
		color: #f4a96a;
		letter-spacing: -0.02em;
	}
	.logo-aware {
		font-family: sans-serif;
		font-size: 1.05rem;
		font-weight: 300;
		color: #faf8f4;
		letter-spacing: 0.01em;
	}

	/* ── Desktop Nav Links ──────────────────────────── */
	.nav-links {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		flex: 1;
		justify-content: center;
	}

	.nav-link {
		position: relative;
		font-size: 0.9rem;
		font-weight: 400;
		color: #b8c8dc;
		text-decoration: none;
		padding: 0.4rem 0.85rem;
		border-radius: 4px;
		transition: color 0.2s;
	}
	.nav-link::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 50%;
		transform: translateX(-50%) scaleX(0);
		width: 60%;
		height: 1.5px;
		background: #f4a96a;
		border-radius: 2px;
		transition: transform 0.25s ease;
	}
	.nav-link:hover {
		color: #faf8f4;
	}
	.nav-link:hover::after,
	.nav-link.active::after {
		transform: translateX(-50%) scaleX(1);
	}
	.nav-link.active {
		color: #faf8f4;
	}

	/* ── Right side ─────────────────────────────────── */
	.nav-right {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-shrink: 0;
	}

	.login-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		background: #f4a96a;
		color: #0e1c2e;
		font-size: 0.875rem;
		font-weight: 500;
		padding: 0.5rem 1.2rem;
		border-radius: 4px;
		text-decoration: none;
		transition:
			background 0.2s,
			transform 0.15s;
		white-space: nowrap;
	}
	.login-btn:hover {
		background: #e8924e;
		transform: translateY(-1px);
	}

	/* ── Hamburger ──────────────────────────────────── */
	.hamburger {
		display: none;
		flex-direction: column;
		justify-content: center;
		gap: 5px;
		width: 36px;
		height: 36px;
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;
	}
	.bar {
		display: block;
		width: 22px;
		height: 1.5px;
		background: #faf8f4;
		border-radius: 2px;
		transition:
			transform 0.3s ease,
			opacity 0.3s ease;
	}
	.menu-open .bar-1 {
		transform: translateY(6.5px) rotate(45deg);
	}
	.menu-open .bar-2 {
		opacity: 0;
		transform: scaleX(0);
	}
	.menu-open .bar-3 {
		transform: translateY(-6.5px) rotate(-45deg);
	}

	/* ── Mobile menu ────────────────────────────────── */
	.mobile-menu {
		overflow: hidden;
		max-height: 0;
		transition: max-height 0.35s ease;
		border-top: 1px solid transparent;
	}
	.menu-open .mobile-menu {
		max-height: 360px;
		border-top-color: rgba(255, 255, 255, 0.07);
	}

	.mobile-links {
		display: flex;
		flex-direction: column;
		padding: 1rem 2rem 1.5rem;
		gap: 0.25rem;
	}

	.mobile-link {
		font-size: 1rem;
		font-weight: 400;
		color: #b8c8dc;
		text-decoration: none;
		padding: 0.6rem 0.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		transition: color 0.2s;
	}
	.mobile-link:hover,
	.mobile-link.active {
		color: #faf8f4;
	}
	.mobile-link.active {
		color: #f4a96a;
	}

	.mobile-login {
		display: inline-flex;
		align-self: flex-start;
		margin-top: 0.75rem;
		background: #f4a96a;
		color: #0e1c2e;
		font-size: 0.9rem;
		font-weight: 500;
		padding: 0.6rem 1.4rem;
		border-radius: 4px;
		text-decoration: none;
		transition: background 0.2s;
	}
	.mobile-login:hover {
		background: #e8924e;
	}

	/* ── Spacer ─────────────────────────────────────── */
	.nav-spacer {
		height: 68px;
	}

	/* ── Responsive ─────────────────────────────────── */
	@media (max-width: 750px) {
		.nav-links {
			display: none;
		}
		.login-btn {
			display: none;
		}
		.hamburger {
			display: flex;
		}
	}

	.user-menu {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}

	.avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: #f4a96a;
		color: #0e1c2e;
		font-size: 0.875rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.user-name {
		font-size: 0.875rem;
		color: #b8c8dc;
		font-weight: 400;
	}

	.logout-btn {
		background: none;
		border: 1.5px solid rgba(255, 255, 255, 0.15);
		color: #b8c8dc;
		font-family: sans-serif;
		font-size: 0.875rem;
		padding: 0.4rem 0.875rem;
		border-radius: 4px;
		cursor: pointer;
		transition:
			border-color 0.2s,
			color 0.2s;
	}
	.logout-btn:hover {
		border-color: #f4a96a;
		color: #faf8f4;
	}
</style>
