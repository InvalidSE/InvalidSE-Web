<script lang="ts">
	import { renderMarkdown } from '$lib/markdown';

	export let source = '';

	$: html = renderMarkdown(source);
</script>

{@html html}
