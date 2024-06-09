<script lang="ts">
	import { processExportData, s2ab } from '../utils/DataUtils';
	import * as XLSX from 'xlsx';

	export let data: any[];
	let downloadUrl: string = '';

	$: downloadUrl = exportXLSX(data);

	function exportXLSX(data: any[]): string {
		const processedData = processExportData(data);
		const wb = XLSX.utils.book_new();
		const ws = XLSX.utils.json_to_sheet(processedData);
		XLSX.utils.book_append_sheet(wb, ws, 'Data');
		const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
		const blob = new Blob([s2ab(wbout)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
		return URL.createObjectURL(blob);
	}
</script>

<a href={downloadUrl} class="download-links" download="BMLT_data.xlsx">Download XLSX</a>
