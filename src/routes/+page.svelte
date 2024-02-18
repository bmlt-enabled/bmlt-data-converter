<script>
	import DataConverter from '$lib/DataConverter.svelte';
	import './main.scss';
</script>

<svelte:head>
	<link rel="manifest" href="manifest.json" />
	<link rel="apple-touch-icon" href="apple-icon-180.png" />
	<meta name="mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<link rel="icon" href="favicon.png" />
	<title>BMLT Data Converter</title>
</svelte:head>

<DataConverter />
