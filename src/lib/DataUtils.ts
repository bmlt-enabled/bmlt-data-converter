import fetchJsonp from 'fetch-jsonp';
import * as XLSX from 'xlsx';

interface Meeting {
	meeting_name: string;
	longitude: string;
	latitude: string;
	weekday_tinyint: string;
	start_time: string;
	location_text: string;
	location_street: string;
	location_city_subsection: string;
	location_municipality: string;
	location_neighborhood: string;
	location_province: string;
	location_postal_code_1: string;
	location_nation: string;
	location_info: string;
}

export async function fetchData(query: string): Promise<any[]> {
	try {
		if (!query.includes('/client_interface/json')) {
			throw new Error('Query does not contain a valid json endpoint.');
		}
		const updatedQuery = query.replace('/client_interface/json/', '/client_interface/jsonp/');
		const response = await fetchJsonp(updatedQuery, {
			jsonpCallback: 'callback',
			timeout: 10000 // 10 seconds timeout
		});
		const data = await response.json();
		if (!Array.isArray(data) || data.length === 0) {
			throw new Error('No data found');
		}
		return data;
	} catch (error) {
		throw new Error(error instanceof Error ? error.message : 'Error loading data');
	}
}

export function exportCSV(data: any[]): string {
	const processedData = processExportData(data);
	const wb = XLSX.utils.book_new();
	const ws = XLSX.utils.json_to_sheet(processedData);
	XLSX.utils.book_append_sheet(wb, ws, 'Data');
	const csvString = XLSX.write(wb, { bookType: 'csv', type: 'string' });
	const blob = new Blob([csvString], { type: 'text/csv' });
	return URL.createObjectURL(blob);
}

export function exportXLSX(data: any[]): string {
	const processedData = processExportData(data);
	const wb = XLSX.utils.book_new();
	const ws = XLSX.utils.json_to_sheet(processedData);
	XLSX.utils.book_append_sheet(wb, ws, 'Data');
	const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
	function s2ab(s: string): ArrayBuffer {
		const buf = new ArrayBuffer(s.length);
		const view = new Uint8Array(buf);
		for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
		return buf;
	}
	const blob = new Blob([s2ab(wbout)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
	return URL.createObjectURL(blob);
}

export function exportKML(data: Meeting[]): string {
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

// This is for Bus/Train/Custom fields
function processExportData(data: any[]): any[] {
	return data.map((row) =>
		Object.keys(row).reduce((acc, key) => {
			let value: string | number = row[key];
			if (typeof value === 'string' && value.includes('#@-@#')) {
				[, value] = value.split('#@-@#');
			}
			acc[key] = value;
			return acc;
		}, {} as any)
	);
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

function prepareSimpleLine(meeting: Meeting, withDate = true): string {
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
		const weekday_strings = ['All', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		const weekday = parseInt(meeting.weekday_tinyint?.trim() ?? '0');
		const weekdayString = weekday_strings[weekday];

		const startTime = `2000-01-01 ${meeting.start_time}`;
		const time = new Date(startTime);

		if (weekdayString && withDate) {
			let dateString = weekdayString;

			if (!isNaN(time.getTime())) {
				dateString += `, ${time.toLocaleTimeString('en-US', {
					hour: 'numeric',
					minute: 'numeric',
					hour12: true
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
