<script lang="ts">
	import { onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
	import { fetchData, exportCSV, exportXLS, exportKML } from './DataUtils';

	const processing = writable<boolean>(false);
	const errorMessage = writable<string>('');
	const loadingText = writable<string>('');
	let query: string = '';
	let csvDownloadUrl: string = '';
	let xlsDownloadUrl: string = '';
	let kmlDownloadUrl: string = '';
	let interval: number | undefined;

	function startLoadingAnimation() {
		let dots: string = '';
		interval = setInterval(() => {
			if (dots.length < 4) {
				dots += '.';
			} else {
				dots = '.';
			}
			loadingText.set(`Processing${dots}`);
		}, 500); // 500 milliseconds
	}

	function stopLoadingAnimation() {
		if (interval !== undefined) {
			clearInterval(interval);
		}
		loadingText.set('');
	}

	async function handleExport() {
		if (query.trim() === '') {
			return;
		}
		processing.set(true);
		errorMessage.set('');
		loadingText.set('Processing');
		csvDownloadUrl = '';
		xlsDownloadUrl = '';
		kmlDownloadUrl = '';
		startLoadingAnimation();

		try {
			const data = await fetchData(query);
			if (data && data.length > 0) {
				// Process data for CSV
				csvDownloadUrl = exportCSV(data);
				// Process data for XLS
				xlsDownloadUrl = exportXLS(data);
				// Process data for KML
				kmlDownloadUrl = query.includes('GetSearchResults') ? exportKML(data) : '';
			} else {
				throw new Error('No data available for export.');
			}
		} catch (error) {
			if (error instanceof Error) {
				errorMessage.set(error.message || 'Failed to export data.');
			} else {
				errorMessage.set('Failed to export data.');
			}
		} finally {
			processing.set(false);
			stopLoadingAnimation();
		}
	}

	onDestroy(() => {
		if (interval) {
			clearInterval(interval);
		}
	});

	$: if (query === '') {
		errorMessage.set('');
	}
</script>

<section>
	<div id="export-form">
		<h1>BMLT Data Converter</h1>
		<div id="inner-box">
			<input type="text" bind:value={query} on:keydown={(event) => event.key === 'Enter' && handleExport()} placeholder="BMLT URL query..." />
			<button on:click={handleExport} disabled={$processing}>{$processing ? $loadingText : 'Generate Export Data'}</button>
			{#if $errorMessage}
				<p class="error" id="errorMessages">{$errorMessage}</p>
			{/if}

			{#if csvDownloadUrl}
				<a href={csvDownloadUrl} class="download-links" download="BMLT_data.csv">Download CSV</a><br />
			{/if}
			{#if xlsDownloadUrl}
				<a href={xlsDownloadUrl} class="download-links" download="BMLT_data.xls">Download XLS</a><br />
			{/if}
			{#if kmlDownloadUrl}
				<a href={kmlDownloadUrl} class="download-links" download="BMLT_data.kml">Download KML</a>
			{/if}
			<div id="description">Converts BMLT data from JSON to CSV, XLS or KML</div>
		</div>
		<div id="footer">
			<a href="https://github.com/bmlt-enabled/bmlt-data-converter/issues" class="footer-link" target="_blank">Issues?</a>
		</div>
	</div>
</section>

<style>
	:root {
		--error-color: red;
		--button-bg-color: #007bff;
		--button-hover-bg-color: #0056b3;
		--border-color: #ccc;
		--border-radius: 3px;
		--font-family-default: Arial, sans-serif;
		--link-color: #007bff;
		--background-light: #f7f7f7;
		--background-dark: #e0d8d8;
		--background-white: #fff;
		--text-color-dark: #333;
	}

	.error,
	#errorMessages {
		color: var(--error-color);
	}

	#errorMessages,
	#description,
	h1,
	.download-links,
	.footer-link,
	#footer,
	#inner-box {
		text-align: center;
	}

	#export-form,
	input[type='text'],
	button,
	#inner-box,
	#footer {
		border-radius: var(--border-radius);
		box-sizing: border-box;
	}

	#export-form,
	#inner-box {
		border: 1px solid var(--border-color);
	}

	#inner-box {
		padding: 20px;
		margin-bottom: 20px;
		background-color: var(--background-white);
	}

	#export-form {
		font-family: var(--font-family-default);
		background-color: var(--background-light);
		max-width: 800px;
		margin: 20px auto 0;
		padding: 1px 20px 20px;
	}

	input[type='text'],
	button {
		width: 100%;
		padding: 10px;
		margin-bottom: 10px;
	}

	input[type='text'] {
		border: 1px solid var(--border-color);
	}

	button {
		background-color: var(--button-bg-color);
		color: #fff;
		border: none;
		padding: 10px 20px;
		margin-bottom: 15px;
		height: 40px;
		cursor: pointer;
		transition: background-color 0.3s; /* Smooth transition for hover effect */
	}

	button:hover {
		background-color: var(--button-hover-bg-color);
	}

	.download-links,
	.footer-link,
	a:hover {
		color: var(--link-color);
	}

	.download-links,
	.footer-link {
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}

	#footer {
		padding: 10px;
		background-color: var(--background-dark);
		border: 1px solid var(--background-dark);
	}

	#description {
		margin-top: 20px;
		font-size: 1em;
		color: var(--text-color-dark);
	}
</style>
