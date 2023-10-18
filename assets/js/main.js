function fetchMeetings(query, callback) {
  const script = document.createElement('script');
  script.src = query + '&callback=' + callback.name;
  document.body.appendChild(script);
}

function handleMeetingsData(meetings) {
  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(
    convertToCSV(meetings)
  );
  const downloadLink = document.getElementById('downloadLink');
  downloadLink.href = csvContent;
  downloadLink.style.display = 'block';
}

function convertToCSV(data) {
  const csvRows = [];
  const keys = Object.keys(data[0]);

  // header row
  csvRows.push(keys.join(','));

  data.forEach((row) => {
    const values = keys.map((key) => {
      let value = row[key];
      if (typeof value === 'string') {
        // Escape double quotes and wrap in double quotes if it contains a comma
        if (value.includes(',') || value.includes('"')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
      }
      return value;
    });

    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
}

function exportToCSV() {
  const query = document.getElementById('query').value;
  if (!query.includes('/client_interface/jsonp')) {
    alert('Invalid BMLT query URL, must use jsonp endpoint.');
    return;
  }

  fetchMeetings(query, handleMeetingsData);
}
