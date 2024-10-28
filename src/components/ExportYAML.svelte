<script lang="ts">
	import { processExportData } from '../utils/DataUtils';
	import * as yaml from 'js-yaml';

	interface Props {
		data: any[];
	}

	let { data }: Props = $props();
	let downloadUrl: string = $derived(exportYAML(data));

	function exportYAML(data: any[]): string {
		const processedData = processExportData(data);
		const yamlString = yaml.dump(processedData);
		const blob = new Blob([yamlString], { type: 'application/x-yaml' });
		return URL.createObjectURL(blob);
	}
</script>

<a href={downloadUrl} class="download-links" download="BMLT_data.yaml">Download YAML</a>
