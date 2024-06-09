<script lang="ts">
	import { processExportData } from '../utils/DataUtils';
	import * as js2xmlparser from 'js2xmlparser';

	export let data: any[];
	let downloadUrl: string = '';

	$: downloadUrl = exportXML(data);

	function exportXML(data: any[]): string {
		const processedData = processExportData(data);
		const xmlResult = js2xmlparser.parse('root', processedData);
		const blob = new Blob([xmlResult], { type: 'text/xml' });
		return URL.createObjectURL(blob);
	}
</script>

<a href={downloadUrl} class="download-links" download="BMLT_data.xml">Download XML</a>
