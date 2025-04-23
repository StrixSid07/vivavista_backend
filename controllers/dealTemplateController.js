// controllers/dealTemplateController.js

const ExcelJS = require("exceljs");
const Hotel = require("../models/Hotel");
const Destination = require("../models/Destination");
const Holiday = require("../models/Holiday");

/**
 * Generate an Excel template for bulk uploading deals.
 * - dynamic dropdowns populated from DB via References sheet
 * - static dropdowns for enums and booleans
 * - hidden ID columns auto-populate via VLOOKUP
 */
exports.generateDealsTemplate = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const mainSheet = workbook.addWorksheet("Deals");
    const refSheet = workbook.addWorksheet("References");
    refSheet.state = "veryHidden";

    // Fetch reference data
    const [destinations, holidays, hotels] = await Promise.all([
      Destination.find().lean(),
      Holiday.find().lean(),
      Hotel.find().lean(),
    ]);

    // Populate References sheet
    refSheet.getRow(1).values = ["DestinationName", "DestinationId"];
    destinations.forEach((d, i) => {
      const r = i + 2;
      refSheet.getCell(`A${r}`).value = d.name;
      refSheet.getCell(`B${r}`).value = d._id.toString();
    });
    const destStart = 2,
      destEnd = destinations.length + 1;

    const holidayOffset = destEnd + 2;
    refSheet.getCell(`A${holidayOffset}`).value = "HolidayName";
    refSheet.getCell(`B${holidayOffset}`).value = "HolidayId";
    holidays.forEach((h, i) => {
      const r = holidayOffset + i + 1;
      refSheet.getCell(`A${r}`).value = h.name;
      refSheet.getCell(`B${r}`).value = h._id.toString();
    });
    const holidayStart = holidayOffset + 1,
      holidayEnd = holidayOffset + holidays.length;

    const hotelOffset = holidayEnd + 2;
    refSheet.getCell(`A${hotelOffset}`).value = "HotelName";
    refSheet.getCell(`B${hotelOffset}`).value = "HotelId";
    hotels.forEach((h, i) => {
      const r = hotelOffset + i + 1;
      refSheet.getCell(`A${r}`).value = h.name;
      refSheet.getCell(`B${r}`).value = h._id.toString();
    });
    const hotelStart = hotelOffset + 1,
      hotelEnd = hotelOffset + hotels.length;

    // Define main sheet columns (visible + hidden ID)
    mainSheet.columns = [
      { header: "title", key: "title", width: 30 },
      { header: "description", key: "description", width: 40 },
      { header: "destinationName", key: "destinationName", width: 25 },
      {
        header: "destinationId",
        key: "destinationId",
        width: 36,
        hidden: true,
      },
      {
        header: "holidaycategoriesName",
        key: "holidaycategoriesName",
        width: 25,
      },
      {
        header: "holidaycategoriesId",
        key: "holidaycategoriesId",
        width: 36,
        hidden: true,
      },
      { header: "hotelsName", key: "hotelsName", width: 25 },
      { header: "hotelsId", key: "hotelsId", width: 36, hidden: true },
      { header: "boardBasis", key: "boardBasis", width: 20 },
      { header: "availableCountries", key: "availableCountries", width: 30 },
      { header: "days", key: "days", width: 10 },
      { header: "rooms", key: "rooms", width: 10 },
      { header: "guests", key: "guests", width: 10 },
      { header: "tag", key: "tag", width: 20 },
      { header: "LowDeposite", key: "LowDeposite", width: 15 },
      { header: "isTopDeal", key: "isTopDeal", width: 10 },
      { header: "isHotdeal", key: "isHotdeal", width: 10 },
      { header: "itinerary", key: "itinerary", width: 40 },
      { header: "isFeatured", key: "isFeatured", width: 10 },
      { header: "distanceToCenter", key: "distanceToCenter", width: 20 },
      { header: "distanceToBeach", key: "distanceToBeach", width: 20 },
      { header: "whatsIncluded", key: "whatsIncluded", width: 30 },
      { header: "exclusiveAdditions", key: "exclusiveAdditions", width: 30 },
      { header: "termsAndConditions", key: "termsAndConditions", width: 40 },
    ];

    // Pre-create rows
    for (let i = 2; i <= 100; i++) mainSheet.getRow(i);

    // Static options
    const boardOptions = ["Half Board", "Full Board", "All Inclusive"];
    const countryOptions = ["UK", "USA", "Canada"];
    const boolOptions = ["TRUE", "FALSE"];

    // Apply validations and VLOOKUPs
    for (let i = 2; i <= 100; i++) {
      // dropdowns
      mainSheet.getCell(`C${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        showDropdown: true,
        formulae: [`=References!$A$${destStart}:$A$${destEnd}`],
        showErrorMessage: true,
        errorStyle: "stop",
      };
      mainSheet.getCell(`E${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        showDropdown: true,
        formulae: [`=References!$A$${holidayStart}:$A$${holidayEnd}`],
        showErrorMessage: true,
        errorStyle: "stop",
      };
      mainSheet.getCell(`G${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        showDropdown: true,
        formulae: [`=References!$A$${hotelStart}:$A$${hotelEnd}`],
        showErrorMessage: true,
        errorStyle: "stop",
      };
      mainSheet.getCell(`I${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        showDropdown: true,
        formulae: [`"${boardOptions.join(",")}"`],
        showErrorMessage: true,
        errorStyle: "stop",
      };
      mainSheet.getCell(`J${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        showDropdown: true,
        formulae: [`"${countryOptions.join(",")}"`],
      };
      mainSheet.getCell(`P${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        showDropdown: true,
        formulae: [`"${boolOptions.join(",")}"`],
      };
      mainSheet.getCell(`Q${i}`).dataValidation = mainSheet.getCell(
        `P${i}`
      ).dataValidation;
      mainSheet.getCell(`S${i}`).dataValidation = mainSheet.getCell(
        `P${i}`
      ).dataValidation;

      // VLOOKUPs for hidden IDs
      mainSheet.getCell(`D${i}`).value = {
        formula: `IF(C${i}="","",VLOOKUP(C${i},References!$A$${destStart}:$B$${destEnd},2,FALSE))`,
      };
      mainSheet.getCell(`F${i}`).value = {
        formula: `IF(E${i}="","",VLOOKUP(E${i},References!$A$${holidayStart}:$B$${holidayEnd},2,FALSE))`,
      };
      mainSheet.getCell(`H${i}`).value = {
        formula: `IF(G${i}="","",VLOOKUP(G${i},References!$A$${hotelStart}:$B$${hotelEnd},2,FALSE))`,
      };
    }

    // Send workbook
    res.status(200).set({
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="deals_template.xlsx"`,
    });
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating template:", error);
    res.status(500).json({ message: "Failed to generate template" });
  }
};
