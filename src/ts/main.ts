class MeetingDataProcessor {
  private isProcessingCSV: boolean;
  private isProcessingKML: boolean;
  constructor() {
    this.isProcessingCSV = false;
    this.isProcessingKML = false;
  }

  // Load JSONP data
  fetchData(query: string, isCSV: boolean, isKML: boolean): Promise<any> {
    this.prepareForDataFetch();
    return new Promise(
      (resolve: (value: any) => void, reject: (reason?: any) => void) => {
        const callbackName = this.setupJSONPCallback(resolve, reject);
        this.loadJSONPData(query, callbackName, reject);
        this.isProcessingCSV = isCSV;
        this.isProcessingKML = isKML;
      },
    );
  }

  private prepareForDataFetch(): void {
    MeetingDataProcessor.clearError();
    MeetingDataProcessor.hideLinks();
  }

  private setupJSONPCallback(
    resolve: (value: any) => void,
    reject: (reason?: any) => void,
  ): string {
    const callbackName = `jsonpCallback_${Date.now()}`;
    const timeoutId = this.setupTimeout(callbackName, reject);

    (window as any)[callbackName] = (data: any) => {
      clearTimeout(timeoutId);
      this.cleanupJSONP(callbackName);

      if (Array.isArray(data) && data.length === 0) {
        this.handleNoDataFound(reject);
      } else {
        this.handleMeetingsData(
          data,
          this.isProcessingCSV,
          this.isProcessingKML,
        );
        resolve(data);
      }
    };

    return callbackName;
  }

  private setupTimeout(
    callbackName: string,
    reject: (reason?: any) => void,
  ): number {
    return window.setTimeout(() => {
      const errorMsg = "Timeout: No response from server";
      MeetingDataProcessor.displayError(errorMsg);
      this.cleanupJSONP(callbackName);
      reject(new Error(errorMsg));
    }, 10000); // 10 seconds timeout
  }

  private cleanupJSONP(callbackName: string): void {
    const script = document.querySelector(`script[src*="${callbackName}"]`);
    if (script) document.body.removeChild(script);
    delete window[callbackName as keyof Window];
  }

  private handleNoDataFound(reject: (reason?: any) => void): void {
    const errorMsg = "No data found";
    MeetingDataProcessor.displayError(errorMsg);
    reject(new Error(errorMsg));
  }

  private loadJSONPData(
    query: string,
    callbackName: string,
    reject: (reason?: any) => void,
  ): void {
    const script = document.createElement("script");
    script.src = `${query}&callback=${callbackName}`;
    script.onerror = () => {
      const errorMsg = "Error loading data";
      MeetingDataProcessor.displayError(errorMsg);
      reject(new Error(errorMsg));
    };
    document.body.appendChild(script);
  }

  static displayError(message: string | null): void {
    const errorContainer = document.getElementById("errorMessages");
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.style.display = "block";
    } else {
      console.error("Error container not found in the document.");
    }
  }

  static clearError(): void {
    const errorContainer = document.getElementById("errorMessages");
    if (errorContainer) {
      errorContainer.style.display = "none";
      errorContainer.textContent = "";
    } else {
      console.error("Error container not found in the document.");
    }
  }

  // Handle data once it's fetched
  handleMeetingsData(meetings: any, isCSV: boolean, isKML: boolean): void {
    if (isCSV) {
      this.exportCSV(meetings);
    }
    if (isKML) {
      this.exportKML(meetings);
    }
  }

  // CSV export functionality
  exportCSV(meetings: any): void {
    const convertedCSV = MeetingDataProcessor.convertToCSV(meetings);
    const csvContent = MeetingDataProcessor.createDownloadLink(
      convertedCSV,
      "text/csv",
    );
    const csvDownloadLink = document.getElementById("csvDownloadLink");
    if (csvDownloadLink) {
      (csvDownloadLink as HTMLAnchorElement).href = csvContent;
      csvDownloadLink.style.display = "block";
    }
  }

  // KML export functionality
  exportKML(meetings: any): void {
    const convertedKML = MeetingDataProcessor.convertToKML(meetings);
    const kmlContent = MeetingDataProcessor.createDownloadLink(
      convertedKML,
      "application/vnd.google-earth.kml+xml",
    );
    const kmlDownloadLink = document.getElementById("kmlDownloadLink");
    if (kmlDownloadLink) {
      (kmlDownloadLink as HTMLAnchorElement).href = kmlContent;
      kmlDownloadLink.style.display = "block";
    }
  }

  static createDownloadLink(data: BlobPart, type: string): string {
    const blob = new Blob([data], { type });
    return URL.createObjectURL(blob);
  }

  static hideLinks() {
    const csvDownloadLink = document.getElementById("csvDownloadLink");
    if (csvDownloadLink) {
      csvDownloadLink.style.display = "none";
    }
    const kmlDownloadLink = document.getElementById("kmlDownloadLink");
    if (kmlDownloadLink) {
      kmlDownloadLink.style.display = "none";
    }
  }

  // Convert data to CSV
  static convertToCSV(data: any[]): string {
    if (!Array.isArray(data) || data.length === 0) {
      MeetingDataProcessor.displayError("No data found");
      throw new Error("No data found");
    }
    const csvRows = [];
    const keys = Object.keys(data[0]);
    csvRows.push(keys.join(","));

    data.forEach((row) => {
      const values = keys.map((key) => {
        let value = row[key] === null ? "" : row[key];
        if (
          typeof value === "string" &&
          (value.includes(",") ||
            value.includes('"') ||
            value.includes("\n") ||
            value.includes("\r"))
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
  static convertToKML(data: any[]): string {
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
  static prepareSimpleLine(
    meeting: { [x: string]: any },
    withDate = true,
  ): string {
    const getLocationInfo = () => {
      const locationInfo: any[] = [];
      const addInfo = (property: string) => {
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

        if (!isNaN(time.getTime())) {
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
  exportData(query: string | URL) {
    let queryUrl: string;
    if (query instanceof URL) {
      queryUrl = query.href;
    } else {
      queryUrl = query;
    }
    try {
      new URL(queryUrl);
      if (!queryUrl.includes("/client_interface/json")) {
        throw new Error("Query does not contain a valid endpoint.");
      }
    } catch (error) {
      MeetingDataProcessor.hideLinks();
      MeetingDataProcessor.displayError(
        `Invalid query URL: ${(error as Error).message}`,
      );
      return;
    }
    const updatedQuery = queryUrl.replace(
      "/client_interface/json/",
      "/client_interface/jsonp/",
    );
    const isCSV = true;
    const isKML = updatedQuery.includes("GetSearchResults");
    this.fetchData(updatedQuery, isCSV, isKML).catch((error) =>
      console.error("Error fetching meetings:", error),
    );
  }
}

// Triggers data export process, bound to button click event
function exportData(): void {
  const queryElement = document.getElementById("query");
  if (queryElement instanceof HTMLInputElement) {
    const query = queryElement.value;
    const processor = new MeetingDataProcessor();
    processor.exportData(query);
  }
}

document
  .getElementById("query")
  ?.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      exportData();
    }
  });
