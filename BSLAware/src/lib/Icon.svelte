<script lang="ts">
	export let name: 'arrow-right' | 'arrow-left' | 'sign-in' | 'check' | 'plus';
	export let size: number = 16;
	export let strokeWidth: number = 2;
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width={strokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#if name === 'arrow-right'}
		<path d="M5 12h14M12 5l7 7-7 7" />
	{:else if name === 'arrow-left'}
		<path d="M19 12H5M12 19l-7-7 7-7" />
	{:else if name === 'sign-in'}
		<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
		<polyline points="10 17 15 12 10 7" />
		<line x1="15" y1="12" x2="3" y2="12" />
	{:else if name === 'check'}
		<polyline points="20 6 9 17 4 12" />
	{:else if name === 'plus'}
		<line x1="12" y1="5" x2="12" y2="19" />
		<line x1="5" y1="12" x2="19" y2="12" />
	{/if}
</svg>
