<script lang="ts">
	import { processExportData } from '../utils/DataUtils';
	import * as XLSX from 'xlsx';

	interface Props {
		data: any[];
	}

	let { data }: Props = $props();
	let downloadUrl: string = $derived(exportCSV(data));

	function exportCSV(data: any[]): string {
		const processedData = processExportData(data);
		const wb = XLSX.utils.book_new();
		const ws = XLSX.utils.json_to_sheet(processedData);
		XLSX.utils.book_append_sheet(wb, ws, 'Data');
		const csvString = XLSX.write(wb, { bookType: 'csv', type: 'string' });
		const blob = new Blob([csvString], { type: 'text/csv' });
		return URL.createObjectURL(blob);
	}
</script>

<a href={downloadUrl} class="download-links" download="BMLT_data.csv">Download CSV</a>
