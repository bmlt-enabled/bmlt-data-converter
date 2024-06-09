<script lang="ts">
	import { writable } from 'svelte/store';
	import { fetchData } from '../utils/DataUtils';
	import ExportCSV from './ExportCSV.svelte';
	import ExportYAML from './ExportYAML.svelte';
	import ExportXML from './ExportXML.svelte';
	import ExportXLSX from './ExportXLSX.svelte';
	import ExportKML from './ExportKML.svelte';

	const processing = writable<boolean>(false);
	const errorMessage = writable<string>('');
	let query: string = '';
	let data: any[] = [];
	let includeKML: boolean = false;

	async function handleExport() {
		if (query.trim() === '') return;
		errorMessage.set('');
		data = [];
		includeKML = query.includes('GetSearchResults');

		try {
			processing.set(true);
			data = await fetchData(query);
		} catch (error) {
			errorMessage.set(error instanceof Error ? error.message : 'Failed to export data.');
		} finally {
			processing.set(false);
		}
	}

	$: if (query.trim() === '') {
		errorMessage.set('');
	}
</script>

<div id="inner-box">
	<input type="text" bind:value={query} on:keydown={(event) => event.key === 'Enter' && handleExport()} placeholder="BMLT URL query..." />
	<button disabled={$processing} on:click={handleExport} class={$processing ? 'button is-fullwidth generateButtonProcessing' : 'button is-fullwidth generateButton'}></button>
	{#if $errorMessage}
		<p class="error" id="errorMessages">{$errorMessage}</p>
	{/if}
	{#if data.length}
		<ExportCSV {data} />
		<br />
		<ExportYAML {data} />
		<br />
		<ExportXML {data} />
		<br />
		<ExportXLSX {data} />
		<br />
		{#if includeKML}
			<ExportKML {data} />
		{/if}
	{/if}
	<div id="description">Converts BMLT data from JSON to CSV, XLSX, XML, KML or YAML</div>
</div>
