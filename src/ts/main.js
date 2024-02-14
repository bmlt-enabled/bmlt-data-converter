var _a;
var MeetingDataProcessor = /** @class */ (function () {
  function MeetingDataProcessor() {
    this.isProcessingCSV = false;
    this.isProcessingKML = false;
  }
  // Load JSONP data
  MeetingDataProcessor.prototype.fetchMeetings = function (
    query,
    isCSV,
    isKML,
  ) {
    var _this = this;
    MeetingDataProcessor.clearError();
    MeetingDataProcessor.hideLinks();
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      var callbackName = "jsonpCallback_" + Date.now();
      var timeoutId = setTimeout(function () {
        var errorMsg = "Timeout: No response from server";
        MeetingDataProcessor.displayError(errorMsg);
        document.body.removeChild(script);
        delete window[callbackName];
        reject(new Error(errorMsg));
      }, 10000); // 10 seconds timeout
      window[callbackName] = function (data) {
        clearTimeout(timeoutId);
        document.body.removeChild(script);
        delete window[callbackName];
        // check for empty array
        if (Array.isArray(data) && data.length === 0) {
          var errorMsg = "No data found";
          MeetingDataProcessor.displayError(errorMsg);
          reject(new Error(errorMsg));
        } else {
          _this.handleMeetingsData(data, isCSV, isKML);
          resolve(data);
        }
      };
      script.src = query + "&callback=" + callbackName;
      script.onerror = function () {
        var errorMsg = "Error loading data";
        MeetingDataProcessor.displayError(errorMsg);
        reject(new Error(errorMsg));
      };
      document.body.appendChild(script);
      _this.isProcessingCSV = isCSV;
      _this.isProcessingKML = isKML;
    });
  };
  MeetingDataProcessor.displayError = function (message) {
    var errorContainer = document.getElementById("errorMessages");
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.style.display = "block";
    } else {
      console.error("Error container not found in the document.");
    }
  };
  MeetingDataProcessor.clearError = function () {
    var errorContainer = document.getElementById("errorMessages");
    if (errorContainer) {
      errorContainer.style.display = "none";
      errorContainer.textContent = "";
    } else {
      console.error("Error container not found in the document.");
    }
  };
  // Handle data once it's fetched
  MeetingDataProcessor.prototype.handleMeetingsData = function (
    meetings,
    isCSV,
    isKML,
  ) {
    if (isCSV) {
      this.exportCSV(meetings);
    }
    if (isKML) {
      this.exportKML(meetings);
    }
  };
  // CSV export functionality
  MeetingDataProcessor.prototype.exportCSV = function (meetings) {
    var convertedCSV = MeetingDataProcessor.convertToCSV(meetings);
    var csvContent = MeetingDataProcessor.createDownloadLink(
      convertedCSV,
      "text/csv",
    );
    var csvDownloadLink = document.getElementById("csvDownloadLink");
    if (csvDownloadLink) {
      csvDownloadLink.href = csvContent;
      csvDownloadLink.style.display = "block";
    }
  };
  // KML export functionality
  MeetingDataProcessor.prototype.exportKML = function (meetings) {
    var convertedKML = MeetingDataProcessor.convertToKML(meetings);
    var kmlContent = MeetingDataProcessor.createDownloadLink(
      convertedKML,
      "application/vnd.google-earth.kml+xml",
    );
    var kmlDownloadLink = document.getElementById("kmlDownloadLink");
    if (kmlDownloadLink) {
      kmlDownloadLink.href = kmlContent;
      kmlDownloadLink.style.display = "block";
    }
  };
  MeetingDataProcessor.createDownloadLink = function (data, type) {
    var blob = new Blob([data], { type: type });
    return URL.createObjectURL(blob);
  };
  MeetingDataProcessor.hideLinks = function () {
    var csvDownloadLink = document.getElementById("csvDownloadLink");
    if (csvDownloadLink) {
      csvDownloadLink.style.display = "none";
    }
    var kmlDownloadLink = document.getElementById("kmlDownloadLink");
    if (kmlDownloadLink) {
      kmlDownloadLink.style.display = "none";
    }
  };
  // Convert data to CSV
  MeetingDataProcessor.convertToCSV = function (data) {
    if (!Array.isArray(data) || data.length === 0) {
      MeetingDataProcessor.displayError("No data found");
      throw new Error("No data found");
    }
    var csvRows = [];
    var keys = Object.keys(data[0]);
    csvRows.push(keys.join(","));
    data.forEach(function (row) {
      var values = keys.map(function (key) {
        var value = row[key] === null ? "" : row[key];
        if (
          typeof value === "string" &&
          (value.includes(",") ||
            value.includes('"') ||
            value.includes("\n") ||
            value.includes("\r"))
        ) {
          value = '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
      });
      csvRows.push(values.join(","));
    });
    return csvRows.join("\n");
  };
  // Convert data to KML
  MeetingDataProcessor.convertToKML = function (data) {
    var kmlContent =
      '<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n  <Document>';
    var placemarks = data
      .map(function (meeting) {
        var name = meeting["meeting_name"].trim() || "NA Meeting";
        var lng = parseFloat(meeting["longitude"]);
        var lat = parseFloat(meeting["latitude"]);
        if (!lng || !lat) return "";
        var description = MeetingDataProcessor.prepareSimpleLine(meeting);
        var address = MeetingDataProcessor.prepareSimpleLine(meeting, false);
        return (
          "    <Placemark>\n      <name>" +
          name +
          "</name>\n      " +
          (address ? "<address>" + address + "</address>" : "") +
          "\n      " +
          (description
            ? "<description>" + description + "</description>"
            : "") +
          "\n      <Point>\n        <coordinates>" +
          lng +
          "," +
          lat +
          "</coordinates>\n      </Point>\n    </Placemark>"
        );
      })
      .join("\n");
    kmlContent += placemarks + "\n  </Document>\n</kml>";
    return kmlContent;
  };
  // KML and CSV data preparation
  MeetingDataProcessor.prepareSimpleLine = function (meeting, withDate) {
    if (withDate === void 0) {
      withDate = true;
    }
    var getLocationInfo = function () {
      var locationInfo = [];
      var addInfo = function (property) {
        if (property in meeting) {
          var value = meeting[property].trim();
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
    var getDateString = function () {
      var weekday_strings = [
        "All",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      var weekday = parseInt(meeting["weekday_tinyint"].trim());
      var weekdayString = weekday_strings[weekday];
      var startTime = "2000-01-01 " + meeting["start_time"];
      var time = new Date(startTime);
      if (weekdayString && withDate) {
        var dateString_1 = weekdayString;
        if (!isNaN(time.getTime())) {
          dateString_1 +=
            ", " +
            time.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            });
        }
        return dateString_1;
      }
      return "";
    };
    var locationInfo = getLocationInfo();
    var dateString = getDateString();
    if (withDate && dateString && locationInfo) {
      return dateString + ", " + locationInfo;
    } else if (dateString) {
      return dateString;
    } else {
      return locationInfo;
    }
  };
  // start the export process
  MeetingDataProcessor.prototype.exportData = function (query) {
    var queryUrl;
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
      MeetingDataProcessor.displayError("Invalid query URL: " + error.message);
      return;
    }
    var updatedQuery = queryUrl.replace(
      "/client_interface/json/",
      "/client_interface/jsonp/",
    );
    var isCSV = true;
    var isKML = updatedQuery.includes("GetSearchResults");
    this.fetchMeetings(updatedQuery, isCSV, isKML)["catch"](function (error) {
      return console.error("Error fetching meetings:", error);
    });
  };
  return MeetingDataProcessor;
})();
// Triggers data export process, bound to button click event
function exportData() {
  var queryElement = document.getElementById("query");
  if (queryElement instanceof HTMLInputElement) {
    var query = queryElement.value;
    var processor = new MeetingDataProcessor();
    processor.exportData(query);
  }
}
(_a = document.getElementById("query")) === null || _a === void 0
  ? void 0
  : _a.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        exportData();
      }
    });
