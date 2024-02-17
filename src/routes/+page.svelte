<script>
	import DataConverter from '$lib/DataConverter.svelte';
</script>

<svelte:head>
	<link rel="manifest" href="manifest.json" />
	<link rel="apple-touch-icon" href="apple-icon-180.png" />
	<meta name="mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<title>BMLT Data Converter</title>
	<script src="https://use.fontawesome.com/releases/v6.5.1/js/all.js" data-auto-a11y="true"></script>
</svelte:head>

<DataConverter />
