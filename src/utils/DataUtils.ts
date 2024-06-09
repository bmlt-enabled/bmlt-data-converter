import fetchJsonp from 'fetch-jsonp';

export interface Meeting {
	meeting_name: string;
	longitude: string;
	latitude: string;
	weekday_tinyint: string;
	start_time: string;
	lang_enum: string;
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
			return Promise.reject(new Error('Query does not contain a valid json endpoint.'));
		}
		const updatedQuery = query.replace('/client_interface/json/', '/client_interface/jsonp/');
		const response = await fetchJsonp(updatedQuery, {
			jsonpCallback: 'callback',
			timeout: 10000 // 10 seconds timeout
		});
		const data = await response.json();
		if (!Array.isArray(data) || data.length === 0) {
			return Promise.reject(new Error('No data found'));
		}
		return data;
	} catch (error) {
		throw new Error(error instanceof Error ? error.message : 'Error loading data');
	}
}

export function processExportData(data: any[]): any[] {
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

export function s2ab(s: string): ArrayBuffer {
	const buf = new ArrayBuffer(s.length);
	const view = new Uint8Array(buf);
	for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
	return buf;
}
