<script lang="ts">
	import type { Meeting } from '../utils/DataUtils';

	interface Props {
		data: Meeting[];
	}

	let { data }: Props = $props();
	let downloadUrl: string = $derived(exportKML(data));

	function exportKML(data: Meeting[]): string {
		const placemarks = data.map(createPlacemark).filter(Boolean).join('\n');
		const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    ${placemarks}
  </Document>
</kml>`;
		const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
		return URL.createObjectURL(blob);
	}

	function createPlacemark(meeting: Meeting): string {
		const name = meeting.meeting_name.trim() || 'NA Meeting';
		const lng = parseFloat(meeting.longitude);
		const lat = parseFloat(meeting.latitude);
		if (!lng || !lat) return '';
		const description = prepareSimpleLine(meeting);
		const address = prepareSimpleLine(meeting, false);
		return `
    <Placemark>
      <name>${name}</name>
      ${address ? `<address>${address}</address>` : ''}
      ${description ? `<description>${description}</description>` : ''}
      <Point>
        <coordinates>${lng},${lat}</coordinates>
      </Point>
    </Placemark>
  `.trim();
	}

	function prepareSimpleLine(meeting: Meeting, withDate: boolean = true): string {
		const getLocationInfo = () => {
			const locationInfo: string[] = [];
			const addInfo = (property: keyof Meeting) => {
				const value = meeting[property]?.trim() ?? '';
				if (value) locationInfo.push(value);
			};
			addInfo('location_text');
			addInfo('location_street');
			addInfo('location_city_subsection');
			addInfo('location_municipality');
			addInfo('location_neighborhood');
			addInfo('location_province');
			addInfo('location_postal_code_1');
			addInfo('location_nation');
			addInfo('location_info');
			return locationInfo.join(', ');
		};

		const getDateString = () => {
			const dayOfWeekInt = parseInt(meeting.weekday_tinyint?.trim() ?? '0');
			const adjustedDay = dayOfWeekInt % 7;
			// January 1, 2023, was a Sunday.
			const baseDate = new Date('2023-01-01');
			baseDate.setDate(baseDate.getDate() + adjustedDay);
			const lang = meeting.lang_enum ? (meeting.lang_enum === 'dk' ? 'da' : meeting.lang_enum) : window.navigator.language;
			const twelveHrLangs: string[] = ['en', 'es'];
			if (dayOfWeekInt && withDate) {
				let dateString = baseDate.toLocaleDateString(lang, { weekday: 'long' });
				if (!isNaN(baseDate.getTime())) {
					dateString += `, ${baseDate.toLocaleTimeString(lang, {
						hour: 'numeric',
						minute: 'numeric',
						hour12: twelveHrLangs.includes(lang)
					})}`;
				}
				return dateString;
			}
			return '';
		};
		const locationInfo = getLocationInfo();
		const dateString = getDateString();
		if (withDate && dateString && locationInfo) {
			return `${dateString}, ${locationInfo}`;
		} else if (dateString) {
			return dateString;
		} else {
			return locationInfo;
		}
	}
</script>

<a href={downloadUrl} class="download-links" download="BMLT_data.kml">Download KML</a>
