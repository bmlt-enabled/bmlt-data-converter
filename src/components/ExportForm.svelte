<script lang="ts">
	import { writable } from 'svelte/store';
	import { fetchData, exportCSV, exportXLSX, exportXML, exportKML, exportYAML } from '$lib/DataUtils';
	import DownloadLinks from './DownloadLinks.svelte';

	const processing = writable<boolean>(false);
	const errorMessage = writable<string>('');
	let query: string = '';
	let csvDownloadUrl: string = '';
	let xlsxDownloadUrl: string = '';
	let xmlDownloadUrl: string = '';
	let kmlDownloadUrl: string = '';
	let yamlDownloadUrl: string = '';

	async function handleExport() {
		if (query.trim() === '') return;
		errorMessage.set('');
		csvDownloadUrl = '';
		xlsxDownloadUrl = '';
		xmlDownloadUrl = '';
		kmlDownloadUrl = '';
		yamlDownloadUrl = '';

		try {
			processing.set(true);
			const data = await fetchData(query);
			csvDownloadUrl = exportCSV(data);
			xlsxDownloadUrl = exportXLSX(data);
			xmlDownloadUrl = exportXML(data);
			yamlDownloadUrl = exportYAML(data);
			kmlDownloadUrl = query.includes('GetSearchResults') ? exportKML(data) : '';
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
	<DownloadLinks {csvDownloadUrl} {xlsxDownloadUrl} {xmlDownloadUrl} {kmlDownloadUrl} {yamlDownloadUrl} />
	<div id="description">Converts BMLT data from JSON to CSV, XLSX, XML, KML or YAML</div>
</div>
