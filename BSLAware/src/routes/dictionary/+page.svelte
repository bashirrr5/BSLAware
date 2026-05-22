<script lang="ts">
	import { goto } from '$app/navigation';

	export let data;

	let search = data.search;
	let category = data.category;
	let selected: (typeof data.entries)[number] | null = null;
	let debounceTimer: ReturnType<typeof setTimeout>;

	function onSearch() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => updateUrl(), 300);
	}

	function updateUrl() {
		const params = new URLSearchParams();
		if (search) params.set('q', search);
		if (category) params.set('category', category);
		goto(`/dictionary?${params.toString()}`, { keepFocus: true });
	}
</script>

<svelte:head>
	<title>Sign Dictionary</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div class="eyebrow">BSL Reference</div>
		<h1>Sign Dictionary</h1>
		<p>{data.total} signs and growing — search by word, category or keyword.</p>
	</div>

	<!-- Search & filter bar -->
	<div class="search-bar">
		<div class="search-input-wrap">
			<svg
				class="search-icon"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
			</svg>
			<input type="text" placeholder="Search signs…" bind:value={search} on:input={onSearch} />
			{#if search}
				<button
					class="clear-btn"
					on:click={() => {
						search = '';
						updateUrl();
					}}>✕</button
				>
			{/if}
		</div>

		<select bind:value={category} on:change={updateUrl}>
			<option value="">All categories</option>
			{#each data.categories as cat}
				<option value={cat}>{cat}</option>
			{/each}
		</select>
	</div>

	<!-- Results count -->
	<div class="results-meta">
		{#if search || category}
			{data.entries.length} result{data.entries.length !== 1 ? 's' : ''}
			{search ? ` for "${search}"` : ''}
			{category ? ` in ${category}` : ''}
		{:else}
			Showing all {data.entries.length} signs
		{/if}
	</div>

	<!-- Grid -->
	{#if data.entries.length === 0}
		<div class="empty">
			No signs found for "{search}". Try a different search term.
		</div>
	{:else}
		<div class="grid">
			{#each data.entries as entry}
				<button class="entry-card" on:click={() => (selected = entry)}>
					<div class="entry-letter">{entry.word.charAt(0).toUpperCase()}</div>
					<div class="entry-body">
						<h3>{entry.word}</h3>
						<span class="entry-category">{entry.category}</span>
						<p>{entry.description}</p>
					</div>
					<div class="entry-tags">
						{#each entry.tags.slice(0, 2) as tag}
							<span class="tag">{tag}</span>
						{/each}
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<!-- Detail modal -->
{#if selected}
	<div
		class="modal-backdrop"
		on:click={() => (selected = null)}
		role="button"
		tabindex="-1"
		on:keydown={(e) => e.key === 'Escape' && (selected = null)}
	>
		<div class="modal" on:click|stopPropagation role="dialog" aria-modal="true">
			<div class="modal-header">
				<div>
					<span class="entry-category">{selected.category}</span>
					<h2>{selected.word}</h2>
				</div>
				<button class="close-btn" on:click={() => (selected = null)}>✕</button>
			</div>

			{#if selected.videoId}
				<div class="embed-wrap">
					<iframe
						src="https://www.youtube.com/embed/{selected.videoId}?rel=0"
						title="BSL sign for {selected.word}"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowfullscreen
					></iframe>
				</div>
			{:else}
				<div class="no-video">No video available for this sign yet.</div>
			{/if}

			<p class="modal-description">{selected.description}</p>

			<div class="modal-tags">
				{#each selected.tags as tag}
					<span class="tag">{tag}</span>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	:global(body) {
		margin: 0;
		background: #faf8f4;
	}

	.page {
		font-family: 'DM Sans', sans-serif;
		max-width: 1100px;
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

	/* ── Search bar ──────────────────────────────────── */
	.search-bar {
		display: flex;
		gap: 0.875rem;
		margin-bottom: 1rem;
	}

	.search-input-wrap {
		position: relative;
		flex: 1;
		display: flex;
		align-items: center;
	}
	.search-icon {
		position: absolute;
		left: 0.875rem;
		color: #a09880;
		pointer-events: none;
	}

	input[type='text'] {
		width: 100%;
		font-family: 'DM Sans', sans-serif;
		font-size: 0.95rem;
		color: #0e1c2e;
		background: #fff;
		border: 1.5px solid #e8e2d8;
		border-radius: 6px;
		padding: 0.75rem 2.5rem 0.75rem 2.5rem;
		outline: none;
		box-sizing: border-box;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}
	input[type='text']:focus {
		border-color: #f4a96a;
		box-shadow: 0 0 0 3px rgba(244, 169, 106, 0.15);
	}

	.clear-btn {
		position: absolute;
		right: 0.75rem;
		background: none;
		border: none;
		cursor: pointer;
		color: #a09880;
		font-size: 0.75rem;
		padding: 4px;
		transition: color 0.2s;
	}
	.clear-btn:hover {
		color: #0e1c2e;
	}

	select {
		font-family: 'DM Sans', sans-serif;
		font-size: 0.875rem;
		color: #0e1c2e;
		background: #fff;
		border: 1.5px solid #e8e2d8;
		border-radius: 6px;
		padding: 0.75rem 1rem;
		outline: none;
		cursor: pointer;
		transition: border-color 0.2s;
		min-width: 160px;
	}
	select:focus {
		border-color: #f4a96a;
	}

	.results-meta {
		font-size: 0.8rem;
		color: #a09880;
		margin-bottom: 1.5rem;
	}

	/* ── Grid ────────────────────────────────────────── */
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 1rem;
	}

	.entry-card {
		background: #fff;
		border: 1.5px solid #e8e2d8;
		border-radius: 8px;
		padding: 1.25rem;
		text-align: left;
		cursor: pointer;
		transition:
			border-color 0.2s,
			transform 0.2s,
			box-shadow 0.2s;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
		font-family: 'DM Sans', sans-serif;
	}
	.entry-card:hover {
		border-color: #f4a96a;
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(200, 100, 40, 0.08);
	}

	.entry-letter {
		width: 40px;
		height: 40px;
		border-radius: 8px;
		background: #0e1c2e;
		color: #f4a96a;
		font-family: 'Playfair Display', serif;
		font-size: 1.3rem;
		font-weight: 900;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.entry-body h3 {
		font-family: 'Playfair Display', serif;
		font-size: 1.05rem;
		font-weight: 700;
		color: #0e1c2e;
		margin: 0 0 0.2rem;
	}
	.entry-category {
		font-size: 0.72rem;
		font-weight: 500;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #c95f2a;
	}
	.entry-body p {
		font-size: 0.825rem;
		line-height: 1.6;
		color: #6a6a60;
		margin: 0.35rem 0 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.entry-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}
	.tag {
		font-size: 0.7rem;
		background: #f0ece4;
		color: #6a6a60;
		padding: 0.15rem 0.5rem;
		border-radius: 20px;
	}

	/* ── Modal ───────────────────────────────────────── */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(14, 28, 46, 0.6);
		backdrop-filter: blur(4px);
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
	}

	.modal {
		background: #fff;
		border-radius: 10px;
		width: 100%;
		max-width: 560px;
		max-height: 90vh;
		overflow-y: auto;
		padding: 2rem;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1.25rem;
	}
	.modal-header h2 {
		font-family: 'Playfair Display', serif;
		font-size: 1.75rem;
		font-weight: 900;
		color: #0e1c2e;
		margin: 0.2rem 0 0;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1rem;
		color: #a09880;
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;
		transition: color 0.2s;
		flex-shrink: 0;
	}
	.close-btn:hover {
		color: #0e1c2e;
	}

	.embed-wrap {
		position: relative;
		padding-bottom: 56.25%;
		height: 0;
		border-radius: 6px;
		overflow: hidden;
		background: #0e1c2e;
		margin-bottom: 1.25rem;
	}
	.embed-wrap iframe {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		border: none;
	}

	.no-video {
		background: #f0ece4;
		border-radius: 6px;
		padding: 2rem;
		text-align: center;
		font-size: 0.875rem;
		color: #a09880;
		margin-bottom: 1.25rem;
	}

	.modal-description {
		font-size: 0.95rem;
		line-height: 1.75;
		color: #3a3a32;
		margin: 0 0 1rem;
	}

	.modal-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	/* ── Empty ───────────────────────────────────────── */
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
		.search-bar {
			flex-direction: column;
		}
		select {
			min-width: unset;
		}
		.grid {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
