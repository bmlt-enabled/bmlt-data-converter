<script lang="ts">
	import { onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
	import { fetchData, exportCSV, exportKML } from './DataUtils';

	const processing = writable(false);
	const errorMessage = writable('');
	const loadingText = writable('');
	let query = '';
	let csvDownloadUrl = '';
	let kmlDownloadUrl = '';
	let interval: number | undefined;

	function startLoadingAnimation() {
		let dots = '';
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
		clearInterval(interval);
		loadingText.set('');
	}

	async function handleExport() {
		processing.set(true);
		errorMessage.set('');
		csvDownloadUrl = '';
		kmlDownloadUrl = '';
		startLoadingAnimation();

		try {
			const data = await fetchData(query);
			if (data && data.length > 0) {
				// Process data for CSV
				csvDownloadUrl = exportCSV(data);
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
</script>

<section>
	<div id="export-form">
		<h1>BMLT Data Converter</h1>
		<div id="inner-box">
			<input
				type="text"
				bind:value={query}
				on:keydown={(event) => event.key === 'Enter' && handleExport()}
				placeholder="BMLT URL query..."
			/>
			<button on:click={handleExport} disabled={$processing}>Generate Export Data</button>
			{#if $processing}
				<div class="loading">{$loadingText}</div>
			{/if}

			{#if $errorMessage}
				<p class="error" id="errorMessages">{$errorMessage}</p>
			{/if}

			{#if csvDownloadUrl}
				<a href={csvDownloadUrl} class="download-links" download="BMLT_data.csv">Download CSV</a><br
				/>
			{/if}
			{#if kmlDownloadUrl}
				<a href={kmlDownloadUrl} class="download-links" download="BMLT_data.kml">Download KML</a>
			{/if}
			<div id="description">Converts BMLT data from JSON to CSV or KML</div>
		</div>
		<div id="footer">
			<a
				href="https://github.com/bmlt-enabled/bmlt-data-converter/issues"
				class="footer-link"
				target="_blank">Issues?</a
			>
		</div>
	</div>
</section>

<style>
	.error {
		color: red;
	}

	h1 {
		text-align: center;
	}

	#export-form {
		font-family: Arial, sans-serif;
		max-width: 800px;
		margin: 20px auto 0;
		padding: 1px 20px 20px;
		background-color: #f7f7f7;
		border: 1px solid #ccc;
		border-radius: 5px;
		box-sizing: border-box;
	}

	#errorMessages {
		color: red;
		text-align: center;
		padding-top: 15px;
	}

	input[type='text'] {
		width: 100%;
		padding: 10px;
		margin-bottom: 10px;
		border: 1px solid #ccc;
		border-radius: 3px;
		box-sizing: border-box;
	}

	button {
		background-color: #007bff;
		width: 100%;
		color: #fff;
		border: none;
		padding: 10px 20px;
		margin-bottom: 15px;
		border-radius: 3px;
		cursor: pointer;
	}

	button:hover {
		background-color: #0056b3;
	}

	.download-links {
		text-align: center;
		text-decoration: none;
		color: #007bff;
	}

	.footer-link {
		display: block;
		text-align: center;
		text-decoration: none;
		color: #007bff;
	}

	a:hover {
		text-decoration: underline;
	}

	#inner-box {
		padding: 20px;
		background-color: #fff;
		border: 1px solid #ddd;
		border-radius: 3px;
		box-sizing: border-box;
		text-align: center;
		margin-bottom: 20px;
	}

	#description {
		text-align: center;
		margin-top: 20px;
		font-size: 1em;
		color: #333;
	}

	#footer {
		padding: 10px;
		background-color: #e0d8d8;
		border: 1px solid #e0d8d8;
		border-radius: 3px;
		box-sizing: border-box;
		text-align: center;
	}

	.loading {
		color: #007bff;
		text-align: center;
		padding: 10px;
		font-weight: bold;
	}
</style>
