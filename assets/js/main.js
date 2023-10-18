let isProcessingCSV = false;
let isProcessingKML = false;

const fetchMeetings = (query, callback, isCSV, isKML) => {
  const script = document.createElement("script");
  script.src = `${query}&callback=${callback.name}`;
  document.body.appendChild(script);
  isProcessingCSV = isCSV;
  isProcessingKML = isKML;
};

const handleMeetingsData = (meetings) => {
  if (isProcessingCSV) {
    const csvContent = `data:text/csv;charset=utf-8,${encodeURIComponent(
      convertToCSV(meetings)
    )}`;
    const downloadLink = document.getElementById("downloadLink");
    downloadLink.href = csvContent;
    downloadLink.style.display = "block";
  }

  if (isProcessingKML) {
    const kmlContent = `data:text/xml;charset=utf-8,${encodeURIComponent(
      convertToKML(meetings)
    )}`;
    const kmlDownloadLink = document.getElementById("kmlDownloadLink");
    kmlDownloadLink.href = kmlContent;
    kmlDownloadLink.style.display = "block";
  }
};

const convertToCSV = (data) => {
  const csvRows = [];
  const keys = Object.keys(data[0]);

  // header row
  csvRows.push(keys.join(","));

  data.forEach((row) => {
    const values = keys.map((key) => {
      let value = row[key];
      if (typeof value === "string") {
        // Escape double quotes and wrap in double quotes if it contains a comma
        if (value.includes(",") || value.includes('"')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
      }
      return value;
    });

    csvRows.push(values.join(","));
  });

  return csvRows.join("\n");
};

const convertToKML = (data) => {
  const kmlHeader = `
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
  `;

  const kmlFooter = `
  </Document>
</kml>`;

  const placemarks = data.map((meeting) => {
    const name = meeting["meeting_name"].trim() || "NA Meeting";
    const lng = parseFloat(meeting["longitude"]);
    const lat = parseFloat(meeting["latitude"]);

    if (lng || lat) {
      const description = prepareSimpleLine(meeting);
      const address = prepareSimpleLine(meeting, false);

      return (
        `    <Placemark>\n` +
        `      <name>${name}</name>\n` +
        (address ? `      <address>${address}</address>\n` : "") +
        (description
          ? `      <description>${description}</description>\n`
          : "") +
        `      <Point>\n` +
        `        <coordinates>${lng},${lat}</coordinates>\n` +
        `      </Point>\n` +
        `    </Placemark>\n`
      );
    }
  });

  return kmlHeader + placemarks.join("\n") + kmlFooter;
};

const exportData = () => {
  const query = document.getElementById("query").value;
  if (!query.includes("/client_interface/jsonp")) {
    alert("Invalid BMLT query URL, must use jsonp endpoint.");
    return;
  }
  // Only support GetSearchResults for KML
  const isKML = query.includes("GetSearchResults");
  fetchMeetings(query, handleMeetingsData, true, isKML);
  if (isKML) {
    fetchMeetings(query, handleMeetingsData, true, true);
  }
};

const prepareSimpleLine = (meeting, withDate = true) => {
  const getLocationInfo = () => {
    const locationInfo = [];
    const addInfo = (property) => {
      if (property in meeting) {
        const value = meeting[property].trim();
        if (value) {
          locationInfo.push(value);
        }
      }
    };

    addInfo("location_text");
    addInfo("location_street");
    addInfo("location_city_subsection");
    addInfo("location_municipality");
    addInfo("location_neighborhood");
    addInfo("location_province");
    addInfo("location_postal_code_1");
    addInfo("location_nation");
    addInfo("location_info");

    return locationInfo.join(", ");
  };

  const getDateString = () => {
    const weekday_strings = [
      "All",
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const weekday = parseInt(meeting["weekday_tinyint"].trim());
    const weekdayString = weekday_strings[weekday];

    const startTime = `2000-01-01 ${meeting["start_time"]}`;
    const time = new Date(startTime);

    if (weekdayString && withDate) {
      let dateString = weekdayString;

      if (!isNaN(time)) {
        dateString += `, ${time.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        })}`;
      }

      return dateString;
    }

    return "";
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
};
