<script lang="ts">
	import { theme } from '../stores/themeStore';
	import ThemeSwitcher from '../components/ThemeSwitcher.svelte';
	import ExportForm from '../components/ExportForm.svelte';

	if (typeof window !== 'undefined') {
		const savedTheme = window.localStorage.getItem('theme');
		if (savedTheme) {
			theme.set(savedTheme);
		}
	}
</script>

<section class={$theme}>
	<div id="export-form">
		<h1>BMLT Data Converter</h1>
		<ExportForm />
		<div id="footer">
			<a href="https://github.com/bmlt-enabled/bmlt-data-converter/issues" class="footer-link" target="_blank">Issues?</a>
		</div>
		<ThemeSwitcher />
	</div>
</section>
