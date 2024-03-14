<script lang="ts">
	import { writable } from 'svelte/store';
	import { fetchData, exportCSV, exportXLSX, exportKML, exportYAML } from './DataUtils';

	const processing = writable<boolean>(false);
	const errorMessage = writable<string>('');
	let query: string = '';
	let csvDownloadUrl: string = '';
	let xlsxDownloadUrl: string = '';
	let kmlDownloadUrl: string = '';
	let yamlDownloadUrl: string = '';

	async function handleExport() {
		if (query.trim() === '') return;
		errorMessage.set('');
		csvDownloadUrl = '';
		xlsxDownloadUrl = '';
		kmlDownloadUrl = '';
		yamlDownloadUrl = '';

		try {
			processing.set(true);
			const data = await fetchData(query);
			csvDownloadUrl = exportCSV(data);
			xlsxDownloadUrl = exportXLSX(data);
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

<section>
	<div id="export-form">
		<h1>BMLT Data Converter</h1>
		<div id="inner-box">
			<input type="text" bind:value={query} on:keydown={(event) => event.key === 'Enter' && handleExport()} placeholder="BMLT URL query..." />
			<button on:click={handleExport} disabled={$processing} class={$processing ? 'generateButtonProcessing' : 'generateButton'}></button>
			{#if $errorMessage}
				<p class="error" id="errorMessages">{$errorMessage}</p>
			{/if}
			{#if csvDownloadUrl}
				<a href={csvDownloadUrl} class="download-links" download="BMLT_data.csv">Download CSV</a><br />
			{/if}
			{#if xlsxDownloadUrl}
				<a href={xlsxDownloadUrl} class="download-links" download="BMLT_data.xlsx">Download XLSX</a><br />
			{/if}
			{#if kmlDownloadUrl}
				<a href={kmlDownloadUrl} class="download-links" download="BMLT_data.kml">Download KML</a><br />
			{/if}
			{#if yamlDownloadUrl}
				<a href={yamlDownloadUrl} class="download-links" download="BMLT_data.yaml">Download YAML</a>
			{/if}
			<div id="description">Converts BMLT data from JSON to CSV, XLSX, KML or YAML</div>
		</div>
		<div id="footer">
			<a href="https://github.com/bmlt-enabled/bmlt-data-converter/issues" class="footer-link" target="_blank">Issues?</a>
		</div>
	</div>
</section>

<style>
</style>
