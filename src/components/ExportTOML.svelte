<script lang="ts">
	import { processExportData } from '../utils/DataUtils';
	import json2toml from 'json2toml';

	interface Props {
		data: any[];
	}

	let { data }: Props = $props();
	let downloadUrl: string = $derived(exportTOML(data));

	function exportTOML(data: any[]): string {
		const processedData = processExportData(data);
		const tomlString = json2toml(processedData, {
			indent: 2,
			newlineAfterSection: true
		});
		const blob = new Blob([tomlString], { type: 'application/x-yaml' });
		return URL.createObjectURL(blob);
	}
</script>

<a href={downloadUrl} class="download-links" download="BMLT_data.toml">Download TOML</a>
