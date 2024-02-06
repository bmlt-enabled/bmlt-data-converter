class MeetingDataProcessor {
  constructor() {
    this.isProcessingCSV = false;
    this.isProcessingKML = false;
  }

  // Load JSONP data
  fetchMeetings(query, isCSV, isKML) {
    MeetingDataProcessor.clearError();
    MeetingDataProcessor.hideLinks();
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const callbackName = `jsonpCallback_${Date.now()}`;

      window[callbackName] = (data) => {
        document.body.removeChild(script);
        delete window[callbackName];

        // check for empty array
        if (Array.isArray(data) && data.length === 0) {
          const errorMsg = "No data found";
          MeetingDataProcessor.displayError(errorMsg);
          reject(new Error(errorMsg));
        } else {
          this.handleMeetingsData(data, isCSV, isKML);
          resolve(data);
        }
      };

      script.src = `${query}&callback=${callbackName}`;
      script.onerror = () => {
        const errorMsg = "Error loading data";
        MeetingDataProcessor.displayError(errorMsg);
        reject(new Error(errorMsg));
      };
      document.body.appendChild(script);

      this.isProcessingCSV = isCSV;
      this.isProcessingKML = isKML;
    });
  }

  static displayError(message) {
    const errorContainer = document.getElementById("errorMessages");
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.style.display = "block";
    } else {
      console.error("Error container not found in the document.");
    }
  }

  static clearError() {
    const errorContainer = document.getElementById("errorMessages");
    if (errorContainer) {
      errorContainer.style.display = "none";
      errorContainer.textContent = "";
    } else {
      console.error("Error container not found in the document.");
    }
  }

  // Handle data once it's fetched
  handleMeetingsData(meetings, isCSV, isKML) {
    if (isCSV) {
      this.exportCSV(meetings);
    }
    if (isKML) {
      this.exportKML(meetings);
    }
  }

  // CSV export functionality
  exportCSV(meetings) {
    const csvContent = `data:text/csv;charset=utf-8,${encodeURIComponent(
      this.constructor.convertToCSV(meetings)
    )}`;
    const downloadLink = document.getElementById("downloadLink");
    downloadLink.href = csvContent;
    downloadLink.style.display = "block";
  }

  // KML export functionality
  exportKML(meetings) {
    const kmlContent = `data:text/xml;charset=utf-8,${encodeURIComponent(
      this.constructor.convertToKML(meetings)
    )}`;
    const kmlDownloadLink = document.getElementById("kmlDownloadLink");
    kmlDownloadLink.href = kmlContent;
    kmlDownloadLink.style.display = "block";
  }

  static hideLinks() {
    const downloadLink = document.getElementById("downloadLink");
    downloadLink.style.display = "none";
    const kmlDownloadLink = document.getElementById("kmlDownloadLink");
    kmlDownloadLink.style.display = "none";
  }

  // Convert data to CSV
  static convertToCSV(data) {
    const csvRows = [];
    const keys = Object.keys(data[0]);
    csvRows.push(keys.join(","));

    data.forEach((row) => {
      const values = keys.map((key) => {
        let value = row[key];
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"'))
        ) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(","));
    });

    return csvRows.join("\n");
  }

  // Convert data to KML
  static convertToKML(data) {
    let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>`;

    const placemarks = data
      .map((meeting) => {
        const name = meeting["meeting_name"].trim() || "NA Meeting";
        const lng = parseFloat(meeting["longitude"]);
        const lat = parseFloat(meeting["latitude"]);
        if (!lng || !lat) return "";

        const description = MeetingDataProcessor.prepareSimpleLine(meeting);
        const address = MeetingDataProcessor.prepareSimpleLine(meeting, false);

        return `    <Placemark>
      <name>${name}</name>
      ${address ? `<address>${address}</address>` : ""}
      ${description ? `<description>${description}</description>` : ""}
      <Point>
        <coordinates>${lng},${lat}</coordinates>
      </Point>
    </Placemark>`;
      })
      .join("\n");

    kmlContent +=
      placemarks +
      `
  </Document>
</kml>`;

    return kmlContent;
  }

  // KML and CSV data preparation
  static prepareSimpleLine(meeting, withDate = true) {
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
  }

  // start the export process
  exportData(query) {
    if (!query.includes("/client_interface/jsonp")) {
      MeetingDataProcessor.displayError(
        "Invalid BMLT query URL, must use jsonp endpoint."
      );
      return;
    }
    const isCSV = true;
    const isKML = query.includes("GetSearchResults");
    this.fetchMeetings(query, isCSV, isKML).catch((error) =>
      console.error("Error fetching meetings:", error)
    );
  }
}

// Triggers data export process, bound to button click event
function exportData() {
  const query = document.getElementById("query").value;
  const processor = new MeetingDataProcessor();
  processor.exportData(query);
}
