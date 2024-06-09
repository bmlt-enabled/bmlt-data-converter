<script lang="ts">
	export let csvDownloadUrl: string;
	export let xlsxDownloadUrl: string;
	export let xmlDownloadUrl: string;
	export let kmlDownloadUrl: string;
	export let yamlDownloadUrl: string;
</script>

{#if csvDownloadUrl}
	<a href={csvDownloadUrl} class="download-links" download="BMLT_data.csv">Download CSV</a><br />
{/if}
{#if xlsxDownloadUrl}
	<a href={xlsxDownloadUrl} class="download-links" download="BMLT_data.xlsx">Download XLSX</a><br />
{/if}
{#if xmlDownloadUrl}
	<a href={xmlDownloadUrl} class="download-links" download="BMLT_data.xml">Download XML</a><br />
{/if}
{#if kmlDownloadUrl}
	<a href={kmlDownloadUrl} class="download-links" download="BMLT_data.kml">Download KML</a><br />
{/if}
{#if yamlDownloadUrl}
	<a href={yamlDownloadUrl} class="download-links" download="BMLT_data.yaml">Download YAML</a>
{/if}
