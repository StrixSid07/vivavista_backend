const ExcelJS = require("exceljs");
const Deal = require("../models/Deal");
const Hotel = require("../models/Hotel");
const Destination = require("../models/Destination");
const Holiday = require("../models/Holiday");
const BoardBasis = require("../models/BoardBasis");
const Airport = require("../models/Airport");
const mongoose = require("mongoose");
const XLSX = require("xlsx");
const fs = require("fs");

// Helper: normalize strings
function normalize(str) {
  return typeof str === "string"
    ? str.trim().toLowerCase()
    : String(str).trim().toLowerCase();
}

function extractCellValue(cell) {
  if (!cell) return "";
  return cell.text || cell.value || cell.toString().trim();
}

// Helper to check if string is a valid ObjectId
function isValidObjectId(id) {
  return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
}

// Bomb-proof parser
function parseMultiValueField(rawValue, map, rowNumber, fieldName) {
  // Force string conversion
  const stringValue =
    typeof rawValue === "string"
      ? rawValue
      : Array.isArray(rawValue)
      ? rawValue.join("|")
      : String(rawValue);

  // Validation
  if (!stringValue || stringValue === "[object Object]") {
    console.error(`Invalid ${fieldName} at row ${rowNumber}:`, stringValue);
    return [];
  }

  // Process
  return stringValue
    .split("|")
    .map((item) => {
      const trimmed = item.trim();
      if (!trimmed) return null;

      // Try as ID first
      if (isValidObjectId(trimmed)) return trimmed;

      // Try normalized name
      const normalized = normalize(trimmed);
      const id = map[normalized];

      if (!id) {
        console.error(`No ${fieldName} match for "${trimmed}"`);
        return null;
      }
      return id;
    })
    .filter(Boolean);
}

exports.generateDealsTemplate = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const mainSheet = workbook.addWorksheet("DestinationDeals");
    const refSheet = workbook.addWorksheet("References");
    refSheet.state = "veryHidden";

    // Fetch reference data
    const [destinations, holidays, hotels, boardBasisList] = await Promise.all([
      Destination.find().lean(),
      Holiday.find().lean(),
      Hotel.find().lean(),
      BoardBasis.find().lean(),
    ]);

    // Still populate References sheet (optional)
    refSheet.getRow(1).values = ["DestinationName", "DestinationId"];
    destinations.forEach((d, i) => {
      refSheet.getCell(`A${i + 2}`).value = d.name;
      refSheet.getCell(`B${i + 2}`).value = d._id.toString();
    });

    const holidayOffset = destinations.length + 3;
    refSheet.getCell(`A${holidayOffset}`).value = "HolidayName";
    refSheet.getCell(`B${holidayOffset}`).value = "HolidayId";
    holidays.forEach((h, i) => {
      refSheet.getCell(`A${holidayOffset + i + 1}`).value = h.name;
      refSheet.getCell(`B${holidayOffset + i + 1}`).value = h._id.toString();
    });

    const hotelOffset = holidayOffset + holidays.length + 2;
    refSheet.getCell(`A${hotelOffset}`).value = "HotelName";
    refSheet.getCell(`B${hotelOffset}`).value = "HotelId";
    hotels.forEach((h, i) => {
      refSheet.getCell(`A${hotelOffset + i + 1}`).value = h.name;
      refSheet.getCell(`B${hotelOffset + i + 1}`).value = h._id.toString();
    });

    const boardOffset = hotelOffset + hotels.length + 2;
    refSheet.getCell(`A${boardOffset}`).value = "BoardBasisName";
    refSheet.getCell(`B${boardOffset}`).value = "BoardBasisId";
    boardBasisList.forEach((b, i) => {
      refSheet.getCell(`A${boardOffset + i + 1}`).value = b.name;
      refSheet.getCell(`B${boardOffset + i + 1}`).value = b._id.toString();
    });

    // Prepare hardcoded lists
    const destinationOptions = destinations.map((d) => d.name).join(",");
    const holidayOptions = holidays.map((h) => h.name).join(",");
    const hotelOptions = hotels.map((h) => h.name).join(",");
    const boardBasisOptions = boardBasisList.map((b) => b.name).join(",");
    const boolOptions = ["TRUE", "FALSE"];
    const availableCountryOptions = ["UK", "USA", "Canada"];

    // Setup main sheet columns
    mainSheet.columns = [
      { header: "Title", key: "title", width: 30 },
      { header: "Description", key: "description", width: 40 },
      {
        header: "Available Countries (| separated)",
        key: "availableCountries",
        width: 30,
      },
      { header: "Destination Name", key: "destinationName", width: 25 },
      {
        header: "Destination ID",
        key: "destinationId",
        width: 36,
        hidden: true,
      },
      {
        header: "Holiday Categories (| separated)",
        key: "holidaycategoriesName",
        width: 30,
      },
      {
        header: "Holiday Categories ID",
        key: "holidaycategoriesId",
        width: 36,
        hidden: true,
      },
      { header: "Days", key: "days", width: 10 },
      { header: "Rooms", key: "rooms", width: 10 },
      { header: "Guests", key: "guests", width: 10 },
      { header: "Hotels Name (| separated)", key: "hotelsName", width: 30 },
      { header: "Hotels ID", key: "hotelsId", width: 36, hidden: true },
      { header: "Board Basis Name", key: "boardBasisName", width: 25 },
      {
        header: "Board Basis ID",
        key: "boardBasisId",
        width: 36,
        hidden: true,
      },
      { header: "Tag", key: "tag", width: 20 },
      { header: "Low Deposit", key: "LowDeposite", width: 15 },
      { header: "Is Top Deal", key: "isTopDeal", width: 10 },
      { header: "Is Hot Deal", key: "isHotdeal", width: 10 },
      { header: "Is Featured", key: "isFeatured", width: 10 },
      { header: "Distance To Center", key: "distanceToCenter", width: 20 },
      { header: "Distance To Beach", key: "distanceToBeach", width: 20 },
      {
        header: "What's Included (| separated)",
        key: "whatsIncluded",
        width: 40,
      },
      {
        header: "Exclusive Additions (| separated)",
        key: "exclusiveAdditions",
        width: 40,
      },
      { header: "Itinerary (| separated)", key: "itinerary", width: 40 },
      {
        header: "Terms And Conditions (| separated)",
        key: "termsAndConditions",
        width: 40,
      },
    ];

    // Set formula for Destination ID (column E)
    for (let i = 2; i <= 100; i++) {
      mainSheet.getCell(`E${i}`).value = {
        formula: `IF(D${i}="","",VLOOKUP(D${i},'References'!$A$2:$B$${
          destinations.length + 1
        },2,FALSE))`,
      };
    }

    // Set formula for Holiday Categories ID (column G)
    for (let i = 2; i <= 100; i++) {
      mainSheet.getCell(`G${i}`).value = {
        formula: `IF(F${i}="","",VLOOKUP(F${i},'References'!$A$${
          holidayOffset + 1
        }:$B$${holidayOffset + holidays.length},2,FALSE))`,
      };
    }

    // Pre-create rows
    for (let i = 2; i <= 100; i++) mainSheet.getRow(i);

    // Apply validations
    for (let i = 2; i <= 100; i++) {
      // Destination dropdown
      if (destinationOptions.length > 0) {
        mainSheet.getCell(`D${i}`).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`'References'!$A$2:$A$${destinations.length + 1}`],
        };
      }

      // Holiday dropdown
      if (holidayOptions.length > 0) {
        mainSheet.getCell(`F${i}`).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [
            `'References'!$A$${holidayOffset + 1}:$A$${
              holidayOffset + holidays.length
            }`,
          ],
        };
      }

      // Hotel dropdown
      if (hotelOptions.length > 0) {
        mainSheet.getCell(`K${i}`).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`"${hotelOptions}"`],
        };
      }

      // Board Basis dropdown
      if (boardBasisOptions.length > 0) {
        mainSheet.getCell(`M${i}`).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`"${boardBasisOptions}"`],
        };
      }

      // Available countries dropdown (static)
      mainSheet.getCell(`C${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`"${availableCountryOptions.join(",")}"`],
      };

      // Boolean fields (isTopDeal, isHotdeal, isFeatured)
      ["Q", "R", "S"].forEach((col) => {
        mainSheet.getCell(`${col}${i}`).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`"${boolOptions.join(",")}"`],
        };
      });
    }

    // Send the file
    res.status(200).set({
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="destination_deals_template.xlsx"`,
    });
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating destination deals template:", error);
    res.status(500).json({ message: "Failed to generate template" });
  }
};

exports.downloadAllDeals = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const mainSheet = workbook.addWorksheet("DestinationDeals");
    const refSheet = workbook.addWorksheet("References");
    refSheet.state = "veryHidden";

    // Fetch all necessary data
    const [destinations, holidays, hotels, boardBasisList, deals] =
      await Promise.all([
        Destination.find().lean(),
        Holiday.find().lean(),
        Hotel.find().lean(),
        BoardBasis.find().lean(),
        Deal.find()
          .populate("destination holidaycategories hotels boardBasis")
          .lean(),
        ]);
        
        // Setup main sheet columns (unchanged)
        mainSheet.columns = [
          { header: "Deal ID", key: "_id", width: 36 },
          { header: "Title", key: "title", width: 30 },
          { header: "Description", key: "description", width: 40 },
          { header: "Available Countries (| separated)", key: "availableCountries", width: 30 },
          { header: "Destination Name", key: "destinationName", width: 25 },
          { header: "Holiday Categories (| separated)", key: "holidaycategoriesName", width: 30 },
          { header: "Days", key: "days", width: 10 },
          { header: "Rooms", key: "rooms", width: 10 },
          { header: "Guests", key: "guests", width: 10 },
          { header: "Hotels Name (| separated)", key: "hotelsName", width: 30 },
          { header: "Board Basis Name", key: "boardBasisName", width: 25 },
          { header: "Tag", key: "tag", width: 20 },
          { header: "Low Deposit", key: "LowDeposite", width: 15 },
          { header: "Is Top Deal", key: "isTopDeal", width: 10 },
          { header: "Is Hot Deal", key: "isHotdeal", width: 10 },
          { header: "Is Featured", key: "isFeatured", width: 10 },
          { header: "Distance To Center", key: "distanceToCenter", width: 20 },
          { header: "Distance To Beach", key: "distanceToBeach", width: 20 },
        
          { header: "What's Included (| separated)", key: "whatsIncluded", width: 40 },
          { header: "Exclusive Additions (| separated)", key: "exclusiveAdditions", width: 40 },
          { header: "Itinerary (| separated)", key: "itinerary", width: 40 },
          { header: "Terms And Conditions (| separated)", key: "termsAndConditions", width: 40 },
        ];
        
        // Populate rows with plain string values
        deals.forEach((deal) => {
          const destinationName = deal.destination?.name || "";
          const destinationId = deal.destination?._id || "";
        
          const holidaycategoriesName = Array.isArray(deal.holidaycategories)
            ? deal.holidaycategories.map((h) => h?.name || "").join("|")
            : "";
          const holidaycategoriesId = Array.isArray(deal.holidaycategories)
            ? deal.holidaycategories.map((h) => h?._id || "").join("|")
            : "";
        
          const hotelsName = Array.isArray(deal.hotels)
            ? deal.hotels.map((h) => h?.name || "").join("|")
            : "";
          const hotelsId = Array.isArray(deal.hotels)
            ? deal.hotels.map((h) => h?._id || "").join("|")
            : "";
        
          const boardBasisName = deal.boardBasis?.name || "";
          const boardBasisId = deal.boardBasis?._id || "";
        
          const itinerary = Array.isArray(deal.itinerary)
            ? deal.itinerary.map((item) => `${item?.title || ""}::${item?.description || ""}`).join("|")
            : "";
        
          mainSheet.addRow({
            _id: deal._id || "",
            title: deal.title || "",
            description: deal.description || "",
            availableCountries: deal.availableCountries?.join("|") || "",
            destinationName,
            holidaycategoriesName,
            days: deal.days || "",
            rooms: deal.rooms || "",
            guests: deal.guests || "",
            hotelsName,
            boardBasisName,
            tag: deal.tag || "",
            LowDeposite: deal.LowDeposite || "",
            isTopDeal: deal.isTopDeal ? "TRUE" : "FALSE",
            isHotdeal: deal.isHotdeal ? "TRUE" : "FALSE",
            isFeatured: deal.isFeatured ? "TRUE" : "FALSE",
            distanceToCenter: deal.distanceToCenter || "",
            distanceToBeach: deal.distanceToBeach || "",
            whatsIncluded: deal.whatsIncluded?.join("|") || "",
            exclusiveAdditions: deal.exclusiveAdditions?.join("|") || "",
            itinerary,
            termsAndConditions: deal.termsAndConditions?.join("|") || "",
          });
        });
        
        // Send file response
        res.status(200).set({
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": "attachment; filename=all-deals.xlsx",
        });
        await workbook.xlsx.write(res);
        res.end();
        
   
  } catch (error) {
    console.error("Error generating deals export:", error);
    res.status(500).json({ message: "Failed to generate deals export" });
  }
};

exports.bulkUploadDeals = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.getWorksheet("DestinationDeals");

    const headers = [];
    const jsonData = [];

    worksheet.eachRow((row, rowNumber) => {
      const values = row.values.slice(1);

      if (rowNumber === 1) {
        values.forEach(header => headers.push(header));
        return;
      }

      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index] !== undefined ? values[index] : "";
      });

      if (!rowData["Title"] || rowData["Title"].toString().trim() === "") return;

      jsonData.push(rowData);
    });

    const formattedDeals = [];

    for (const row of jsonData) {
      // Holiday Categories
      const holidayCategoryNames = row["Holiday Categories (| separated)"]
        ? row["Holiday Categories (| separated)"].split("|").map(item => item.trim())
        : [];

      const holidayCategoryIds = await Promise.all(
        holidayCategoryNames.map(async (name) => {
          const holiday = await Holiday.findOne({ name });
          return holiday ? holiday._id : null;
        })
      );

      // Hotels
      const hotelNames = row["Hotels Name (| separated)"]
        ? row["Hotels Name (| separated)"].split("|").map(item => item.trim())
        : [];

      const hotelIds = await Promise.all(
        hotelNames.map(async (name) => {
          const hotel = await Hotel.findOne({ name });
          return hotel ? hotel._id : null;
        })
      );

      // Board Basis
      const boardBasisNames = row["Board Basis Name"]
        ? row["Board Basis Name"].split("|").map(item => item.trim())
        : [];

      const boardBasisIds = await Promise.all(
        boardBasisNames.map(async (name) => {
          const basis = await BoardBasis.findOne({ name });
          return basis ? basis._id : null;
        })
      );

      const formattedDeal = {
        title: row["Title"],
        description: row["Description"],
        availableCountries: row["Available Countries (| separated)"]
          ? row["Available Countries (| separated)"].split("|").map(c => c.trim())
          : [],
        destination: row["Destination ID"]?.result || null,
        holidaycategories: holidayCategoryIds.filter(id => id !== null),
        days: Number(row["Days"]) || 0,
        rooms: Number(row["Rooms"]) || 0,
        guests: Number(row["Guests"]) || 0,
        hotels: hotelIds.filter(id => id !== null),
        boardBasis: boardBasisIds.length > 0 ? boardBasisIds[0] : null,
        tag: row["Tag"] || "",
        LowDeposite: row["Low Deposit"] || "",
        isTopDeal: Boolean(row["Is Top Deal"]),
        isHotdeal: Boolean(row["Is Hot Deal"]),
        isFeatured: Boolean(row["Is Featured"]),
        distanceToCenter: row["Distance To Center"] || "",
        distanceToBeach: row["Distance To Beach"] || "",
        whatsIncluded: row["What's Included (| separated)"]
          ? row["What's Included (| separated)"].split("|").map(item => item.trim())
          : [],
        exclusiveAdditions: row["Exclusive Additions (| separated)"]
          ? row["Exclusive Additions (| separated)"].split("|").map(item => item.trim())
          : [],
        itinerary: row["Itinerary (| separated)"]
          ? row["Itinerary (| separated)"].split("|").map((item, index) => ({
              title: `Day ${index + 1}`,
              description: item.trim(),
            }))
          : [],
        termsAndConditions: row["Terms And Conditions (| separated)"]
          ? row["Terms And Conditions (| separated)"].split("|").map(item => item.trim())
          : [],
      };

      formattedDeals.push(formattedDeal);
    }

    // Bulk insert
    const insertedDeals = await Deal.insertMany(formattedDeals);

    res.status(200).json({
      message: "Deals uploaded successfully",
      count: insertedDeals.length,
      data: insertedDeals,
    });
  } catch (err) {
    console.error("Error uploading deals:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

exports.bulkUpdateDealsByExcel = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.getWorksheet("DestinationDeals");

    const headers = [];
    const jsonData = [];

    worksheet.eachRow((row, rowNumber) => {
      const values = row.values.slice(1);

      if (rowNumber === 1) {
        values.forEach(header => headers.push(header));
        return;
      }

      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index] !== undefined ? values[index] : "";
      });

      if (!rowData["Deal ID"]) return; // Skip rows without Deal ID

      jsonData.push(rowData);
    });
console.log(jsonData);
    let updatedCount = 0;
    const failedUpdates = [];

    for (const row of jsonData) {
      const dealIdRaw = row["Deal ID"];
      const dealId = dealIdRaw.replace(/"/g, '');

      // Holiday Categories
      const holidayCategoryNames = row["Holiday Categories (| separated)"]
        ? row["Holiday Categories (| separated)"].split("|").map(item => item.trim())
        : [];

      const holidayCategoryIds = await Promise.all(
        holidayCategoryNames.map(async (name) => {
          const holiday = await Holiday.findOne({ name });
          return holiday ? holiday._id : null;
        })
      );

      // Hotels
      const hotelNames = row["Hotels Name (| separated)"]
        ? row["Hotels Name (| separated)"].split("|").map(item => item.trim())
        : [];

      const hotelIds = await Promise.all(
        hotelNames.map(async (name) => {
          const hotel = await Hotel.findOne({ name });
          return hotel ? hotel._id : null;
        })
      );

      // Board Basis
      const boardBasisNames = row["Board Basis Name"]
        ? row["Board Basis Name"].split("|").map(item => item.trim())
        : [];

      const boardBasisIds = await Promise.all(
        boardBasisNames.map(async (name) => {
          const basis = await BoardBasis.findOne({ name });
          return basis ? basis._id : null;
        })
      );
 const destinationName=row["Destination Name"];
 const destinationId= await Destination.findOne({name:destinationName});
      const updatedDealData = {
        title: row["Title"],
        description: row["Description"],
        availableCountries: row["Available Countries (| separated)"]
          ? row["Available Countries (| separated)"].split("|").map(c => c.trim())
          : [],
        destination: destinationId || null,
        holidaycategories: holidayCategoryIds.filter(id => id !== null),
        days: Number(row["Days"]) || 0,
        rooms: Number(row["Rooms"]) || 0,
        guests: Number(row["Guests"]) || 0,
        hotels: hotelIds.filter(id => id !== null),
        boardBasis: boardBasisIds.length > 0 ? boardBasisIds[0] : null,
        tag: row["Tag"] || "",
        LowDeposite: row["Low Deposit"] || "",
        isTopDeal: Boolean(row["Is Top Deal"]),
        isHotdeal: Boolean(row["Is Hot Deal"]),
        isFeatured: Boolean(row["Is Featured"]),
        distanceToCenter: row["Distance To Center"] || "",
        distanceToBeach: row["Distance To Beach"] || "",
        whatsIncluded: row["What's Included (| separated)"]
          ? row["What's Included (| separated)"].split("|").map(item => item.trim())
          : [],
        exclusiveAdditions: row["Exclusive Additions (| separated)"]
          ? row["Exclusive Additions (| separated)"].split("|").map(item => item.trim())
          : [],
        itinerary: row["Itinerary (| separated)"]
          ? row["Itinerary (| separated)"].split("|").map((item, index) => ({
              title: `Day ${index + 1}`,
              description: item.trim(),
            }))
          : [],
        termsAndConditions: row["Terms And Conditions (| separated)"]
          ? row["Terms And Conditions (| separated)"].split("|").map(item => item.trim())
          : [],
      };

      try {
        const updated = await Deal.findByIdAndUpdate(dealId, updatedDealData, { new: true });

        if (updated) {
          updatedCount++;
        } else {
          failedUpdates.push({ dealId, reason: "Deal not found" });
        }
      } catch (err) {
        failedUpdates.push({ dealId, reason: err.message });
      }
    }

    res.status(200).json({
      message: "Bulk deal update complete",
      updatedCount,
      failedCount: failedUpdates.length,
      failedUpdates,
    });
  } catch (err) {
    console.error("Error during bulk update:", err);
    res.status(500).json({ message: "Bulk update failed", error: err.message });
  }
};

exports.updateDealsFromExcel = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.getWorksheet("DestinationDeals");

    // 1. DYNAMIC COLUMN MAPPING (EXACT MATCH TO DOWNLOAD TEMPLATE)
    const headerRow = worksheet.getRow(1);
    const columnMap = {};
    headerRow.eachCell((cell, colNumber) => {
      const header = cell.value?.toString().trim();
      if (header) columnMap[header] = colNumber;
    });

    // 2. VALIDATE COLUMNS (ALL COLUMNS FROM DOWNLOAD TEMPLATE)
    const requiredColumns = [
      "Title",
      "Description",
      "Available Countries (| separated)",
      "Destination Name",
      "Destination ID",
      "Holiday Categories (| separated)",
      "Holiday Categories ID",
      "Days",
      "Rooms",
      "Guests",
      "Hotels Name (| separated)",
      "Hotels ID",
      "Board Basis Name",
      "Board Basis ID",
      "Tag",
      "Low Deposit",
      "Is Top Deal",
      "Is Hot Deal",
      "Is Featured",
      "Distance To Center",
      "Distance To Beach",
      "What's Included (| separated)",
      "Exclusive Additions (| separated)",
      "Itinerary (| separated)",
      "Terms And Conditions (| separated)",
    ];

    const missingColumns = requiredColumns.filter((col) => !columnMap[col]);
    if (missingColumns.length > 0) {
      return res.status(400).json({
        message: `Missing required columns: ${missingColumns.join(", ")}`,
        detectedHeaders: Object.keys(columnMap),
      });
    }

    // 3. FETCH REFERENCE DATA
    const [destinations, holidays, hotels, boardBases, existingDeals] =
      await Promise.all([
        Destination.find().lean(),
        Holiday.find().lean(),
        Hotel.find().lean(),
        BoardBasis.find().lean(),
        Deal.find().lean(),
      ]);

    // 4. CREATE LOOKUP MAPS
    const createLookupMap = (items) =>
      Object.fromEntries(items.map((item) => [normalize(item.name), item._id]));

    const destinationMap = createLookupMap(destinations);
    const holidayMap = createLookupMap(holidays);
    const hotelMap = createLookupMap(hotels);
    const boardBasisMap = createLookupMap(boardBases);
    const titleToDealMap = Object.fromEntries(
      existingDeals.map((deal) => [normalizeTitle(deal.title), deal])
    );

    // 5. PROCESS ROWS
    let updateCount = 0;
    let skipCount = 0;
    const errors = [];

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const getCellValue = (colName) =>
        extractCellValue(row.getCell(columnMap[colName]));

      // TITLE VALIDATION
      const title = getCellValue("Title");
      if (!title) {
        errors.push(`Missing title at row ${rowNumber}`);
        skipCount++;
        continue;
      }

      // FIND EXISTING DEAL
      const normalizedTitle = normalizeTitle(title);
      const existingDeal = titleToDealMap[normalizedTitle];
      if (!existingDeal) {
        errors.push(`Deal not found: "${title}" (row ${rowNumber})`);
        skipCount++;
        continue;
      }

      try {
        // PARSE COMPLEX FIELDS
        const parseField = (colName, map) => {
          const rawValue = getCellValue(colName);
          return parseMultiValueField(
            rawValue,
            map,
            rowNumber,
            colName.split(" ")[0]
          );
        };

        // BUILD UPDATE DATA (MATCHING SCHEMA)
        const updateData = {
          title: title,
          description: getCellValue("Description"),
          availableCountries: parseField(
            "Available Countries (| separated)",
            {}
          ),
          destination:
            getCellValue("Destination ID") ||
            destinationMap[normalize(getCellValue("Destination Name"))],
          holidaycategories: parseField(
            "Holiday Categories (| separated)",
            holidayMap
          ),
          days: parseInt(getCellValue("Days")) || 0,
          rooms: parseInt(getCellValue("Rooms")) || 0,
          guests: parseInt(getCellValue("Guests")) || 0,
          hotels: parseField("Hotels Name (| separated)", hotelMap),
          boardBasis:
            getCellValue("Board Basis ID") ||
            boardBasisMap[normalize(getCellValue("Board Basis Name"))],
          tag: getCellValue("Tag"),
          LowDeposite: getCellValue("Low Deposit"),
          isTopDeal: getCellValue("Is Top Deal") === "TRUE",
          isHotdeal: getCellValue("Is Hot Deal") === "TRUE",
          isFeatured: getCellValue("Is Featured") === "TRUE",
          distanceToCenter: parseFloat(getCellValue("Distance To Center")) || 0,
          distanceToBeach: parseFloat(getCellValue("Distance To Beach")) || 0,
          whatsIncluded: parseField("What's Included (| separated)", {}),
          exclusiveAdditions: parseField(
            "Exclusive Additions (| separated)",
            {}
          ),
          itinerary: parseItinerary(getCellValue("Itinerary (| separated)")),
          termsAndConditions: parseField(
            "Terms And Conditions (| separated)",
            {}
          ),
        };

        // VALIDATE REQUIRED FIELDS
        if (!updateData.destination) {
          throw new Error("Invalid Destination");
        }
        if (!updateData.boardBasis) {
          throw new Error("Invalid Board Basis");
        }

        // PERFORM UPDATE
        await Deal.updateOne({ _id: existingDeal._id }, { $set: updateData });
        updateCount++;
      } catch (err) {
        errors.push(`Row ${rowNumber} failed: ${err.message}`);
        skipCount++;
      }
    }

    res.status(200).json({
      message: "Update completed",
      updated: updateCount,
      skipped: skipCount,
      errors,
    });
  } catch (err) {
    console.error("Bulk update failed:", err);
    res.status(500).json({
      message: "Bulk update failed",
      error: err.message,
    });
  }
};

// HELPER FUNCTIONS
function normalizeTitle(str) {
  return str.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseItinerary(rawValue) {
  if (!rawValue) return [];
  return String(rawValue)
    .split("|")
    .map((item) => {
      const [title, description] = item.split("::");
      return { title: title?.trim(), description: description?.trim() };
    })
    .filter((item) => item.title && item.description);
}

exports.generateDealPricesTemplate = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const mainSheet = workbook.addWorksheet("DealPrices");
    const refSheet = workbook.addWorksheet("References");
    refSheet.state = "veryHidden";

    // Fetch reference data
    const [deals, hotels, airports] = await Promise.all([
      Deal.find().lean(),
      Hotel.find().lean(),
      Airport.find().lean(),
    ]);

    // Static countries
    const countryOptions = ["UK", "USA", "Canada"];

    // Fill References sheet
    refSheet.getRow(1).values = ["DealTitle", "DealId"];
    deals.forEach((d, i) => {
      refSheet.getCell(`A${i + 2}`).value = d.title;
      refSheet.getCell(`B${i + 2}`).value = d._id.toString();
    });

    const hotelOffset = deals.length + 3;
    refSheet.getCell(`A${hotelOffset}`).value = "HotelName";
    refSheet.getCell(`B${hotelOffset}`).value = "HotelId";
    hotels.forEach((h, i) => {
      refSheet.getCell(`A${hotelOffset + i + 1}`).value = h.name;
      refSheet.getCell(`B${hotelOffset + i + 1}`).value = h._id.toString();
    });

    const airportOffset = hotelOffset + hotels.length + 2;
    refSheet.getCell(`A${airportOffset}`).value = "AirportName";
    refSheet.getCell(`B${airportOffset}`).value = "AirportId";
    airports.forEach((a, i) => {
      refSheet.getCell(`A${airportOffset + i + 1}`).value = a.name;
      refSheet.getCell(`B${airportOffset + i + 1}`).value = a._id.toString();
    });

    const countryOffset = airportOffset + airports.length + 2;
    refSheet.getCell(`A${countryOffset}`).value = "CountryName";
    countryOptions.forEach((c, i) => {
      refSheet.getCell(`A${countryOffset + i + 1}`).value = c;
    });

    // Setup Main Sheet Columns
    mainSheet.columns = [
      { header: "Deal Title", key: "dealTitle", width: 30 },
      { header: "Deal ID", key: "dealId", width: 36, hidden: true },
      { header: "Country", key: "country", width: 15 },
      { header: "Airport Name", key: "airportName", width: 25 },
      { header: "Airport ID", key: "airportId", width: 36, hidden: true },
      { header: "Hotel Name", key: "hotelName", width: 25 },
      { header: "Hotel ID", key: "hotelId", width: 36, hidden: true },
      {
        header: "Start Date",
        key: "startdate",
        width: 15,
        style: { numFmt: "dd/mm/yyyy" },
      },
      {
        header: "End Date",
        key: "enddate",
        width: 15,
        style: { numFmt: "dd/mm/yyyy" },
      },
      { header: "Price", key: "price", width: 10 },
      { header: "Outbound Flight Details", key: "outbound", width: 30 },
      { header: "Return Flight Details", key: "returnFlight", width: 30 },
    ];

    // Create 100 empty rows
    for (let i = 2; i <= 2; i++) {
      // Deal Title dropdown
      mainSheet.getCell(`A${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`'References'!$A$2:$A$${deals.length + 1}`],
      };

      // Deal ID (VLOOKUP based on Deal Title)
      mainSheet.getCell(`B${i}`).value = {
        formula: `IF(A${i}="","",VLOOKUP(A${i},'References'!$A$2:$B$${
          deals.length + 1
        },2,FALSE))`,
      };

      // Country dropdown
      mainSheet.getCell(`C${i}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: [
          `'References'!$A$${countryOffset + 1}:$A$${
            countryOffset + countryOptions.length
          }`,
        ],
      };

      // Airport Name dropdown
      mainSheet.getCell(`D${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [
          `'References'!$A$${airportOffset + 1}:$A$${
            airportOffset + airports.length
          }`,
        ],
      };

      // Airport ID (VLOOKUP based on Airport Name)
      mainSheet.getCell(`E${i}`).value = {
        formula: `IF(D${i}="","",VLOOKUP(D${i},'References'!$A$${
          airportOffset + 1
        }:$B$${airportOffset + airports.length},2,FALSE))`,
      };

      // Hotel Name dropdown
      mainSheet.getCell(`F${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [
          `'References'!$A$${hotelOffset + 1}:$A$${
            hotelOffset + hotels.length
          }`,
        ],
      };

      // Hotel ID (VLOOKUP based on Hotel Name)
      mainSheet.getCell(`G${i}`).value = {
        formula: `IF(F${i}="","",VLOOKUP(F${i},'References'!$A$${
          hotelOffset + 1
        }:$B$${hotelOffset + hotels.length},2,FALSE))`,
      };

      // Start Date + End Date validations
      ["H", "I"].forEach((col) => {
        mainSheet.getCell(`${col}${i}`).dataValidation = {
          type: "date",
          operator: "greaterThan",
          formulae: [new Date(1900, 0, 1)],
          showErrorMessage: true,
          errorTitle: "Invalid Date",
          error: "Please enter a valid date",
          errorStyle: "stop",
        };
      });

      // Start Date + End Date as strings (no date validation)
      // ["H", "I"].forEach((col) => {
      //   mainSheet.getCell(`${col}${i}`).dataValidation = {
      //     type: "custom",
      //     formulae: ["TRUE"], // Allow any input (no restriction)
      //     showErrorMessage: false, // Don't show any error message
      //   };
      // });

      // Price validation
      mainSheet.getCell(`J${i}`).dataValidation = {
        type: "decimal",
        operator: "greaterThan",
        formulae: [0],
        showErrorMessage: true,
        error: "Price must be a positive number",
        errorStyle: "stop",
      };
    }

    res.status(200).set({
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="deal_prices_template.xlsx"`,
    });
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating deal prices template:", error);
    res.status(500).json({ message: "Failed to generate template" });
  }
};

function excelDateToJSDate(serial) {
  const utcDays = Math.floor(serial - 25569); // days since Unix epoch (1970-01-01)
  const utcValue = utcDays * 86400; // seconds
  return new Date(utcValue * 1000); // milliseconds
}

exports.readAndInsertExcel = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (!jsonData.length) {
      return res
        .status(400)
        .json({ success: false, message: "Excel file is empty" });
    }
    console.log(jsonData);

    // Transform and insert prices into each Deal
    let updatedDealsCount = 0;
    for (const row of jsonData) {
      const dealId = row["Deal ID"];
      const airportId = row["Airport ID"];
      const hotelId = row["Hotel ID"];
      const country = row["Country"];
      const price = Number(row["Price"]);
      const startdate = Number(row["Start Date"]);
      const enddate = Number(row["End Date"]);
      console.log(excelDateToJSDate(startdate));
      console.log(excelDateToJSDate(enddate));
      if (!dealId || !airportId || !hotelId || !country || !price) continue;

      const deal = await Deal.findById(dealId);
      if (!deal) continue;

      // Append to prices array
      deal.prices.push({
        country,
        airport: [new mongoose.Types.ObjectId(airportId)],
        hotel: new mongoose.Types.ObjectId(hotelId),
        startdate: excelDateToJSDate(startdate), // set your actual logic here
        enddate: excelDateToJSDate(enddate), // set your actual logic here
        price,
      });

       await deal.save();
      updatedDealsCount++;
    }

    return res.status(200).json({
      success: true,
      message: "Prices inserted into matching deals",
      updatedDeals: updatedDealsCount,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

function isValidObjectId(id) {
  return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
}