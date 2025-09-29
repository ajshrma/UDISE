import School from "../models/schoolModel.js";
import { successResponse, errorResponse } from "../lib/responseHandler.js";
import { mockSchoolService } from "../lib/mockDataService.js";
import mongoose from "mongoose";

// Get all schools with filtering and pagination
const getAllSchools = async (req, res, next) => {
  try {
    const {
      state,
      district,
      block,
      village,
      management_type,
      location,
      school_type,
      page = 1,
      limit = 10,
      search,
      sortBy = "school_name",
      sortOrder = "asc",
    } = req.query;

    // Build filter object - simple single select
    const filter = {};
    if (state) filter.state = state;
    if (district) filter.district = district;
    if (block) filter.block = block;
    if (village) filter.village = village;
    if (management_type) filter.management_type = management_type;
    if (location) filter.location = location;
    if (school_type) filter.school_type = school_type;
    if (search) {
      filter.$or = [
        { school_name: { $regex: search, $options: "i" } },
        { udise_code: { $regex: search, $options: "i" } },
        { village: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Add safeguards for large pagination
    const MAX_PAGE_SIZE = 100;
    const MAX_SKIP_VALUE = 10000; // Maximum skip value to prevent performance issues
    
    // Validate and limit page size
    const safeLimit = Math.min(limitNum, MAX_PAGE_SIZE);
    
    // Check if skip value is too large
    if (skip > MAX_SKIP_VALUE) {
      return errorResponse(res, 400, `Page number too high. Maximum page allowed: ${Math.floor(MAX_SKIP_VALUE / safeLimit) + 1}`);
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      // Use MongoDB
      const schools = await School.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(safeLimit)
        .lean();

      const totalSchools = await School.countDocuments(filter);
      const totalPages = Math.ceil(totalSchools / safeLimit);

      successResponse(res, 200, "Schools fetched successfully", {
        schools,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalSchools,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      });
    } else {
      // Use mock data
      const result = await mockSchoolService.find(filter, sort, skip, limitNum);
      const totalPages = Math.ceil(result.total / limitNum);

      successResponse(res, 200, "Schools fetched successfully (mock data)", {
        schools: result.data,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalSchools: result.total,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get school by ID
const getSchoolById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      const school = await School.findById(id);
      if (!school) {
        return errorResponse(res, 404, "School not found");
      }
      successResponse(res, 200, "School fetched successfully", school);
    } else {
      // Use mock data
      const school = await mockSchoolService.findById(id);
      if (!school) {
        return errorResponse(res, 404, "School not found");
      }
      successResponse(res, 200, "School fetched successfully (mock data)", school);
    }
  } catch (error) {
    next(error);
  }
};

// Create new school
const createSchool = async (req, res, next) => {
  try {
    const schoolData = req.body;

    // Check if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      // Check if UDISE code already exists
      const existingSchool = await School.findOne({ udise_code: schoolData.udise_code });
      if (existingSchool) {
        return errorResponse(res, 400, "School with this UDISE code already exists");
      }

      // Auto-generate serial number if not provided
      if (!schoolData.serial_no) {
        const maxSerial = await School.findOne({}, { serial_no: 1 }).sort({ serial_no: -1 });
        schoolData.serial_no = maxSerial ? maxSerial.serial_no + 1 : 1;
      }

      const school = new School(schoolData);
      await school.save();
      successResponse(res, 201, "School created successfully", school);
    } else {
      // Use mock data
      const school = await mockSchoolService.create(schoolData);
      successResponse(res, 201, "School created successfully (mock data)", school);
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return errorResponse(res, 400, "Validation error", { errors });
    }
    next(error);
  }
};

// Update school
const updateSchool = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      // Check if UDISE code is being updated and if it already exists
      if (updateData.udise_code) {
        const existingSchool = await School.findOne({
          udise_code: updateData.udise_code,
          _id: { $ne: id },
        });
        if (existingSchool) {
          return errorResponse(res, 400, "School with this UDISE code already exists");
        }
      }

      const school = await School.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!school) {
        return errorResponse(res, 404, "School not found");
      }

      successResponse(res, 200, "School updated successfully", school);
    } else {
      // Use mock data
      const school = await mockSchoolService.findByIdAndUpdate(id, updateData);
      if (!school) {
        return errorResponse(res, 404, "School not found");
      }
      successResponse(res, 200, "School updated successfully (mock data)", school);
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return errorResponse(res, 400, "Validation error", { errors });
    }
    next(error);
  }
};

// Delete school
const deleteSchool = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      const school = await School.findByIdAndDelete(id);
      if (!school) {
        return errorResponse(res, 404, "School not found");
      }
      successResponse(res, 200, "School deleted successfully");
    } else {
      // Use mock data
      const school = await mockSchoolService.findByIdAndDelete(id);
      if (!school) {
        return errorResponse(res, 404, "School not found");
      }
      successResponse(res, 200, "School deleted successfully (mock data)");
    }
  } catch (error) {
    next(error);
  }
};

// Get distribution data for charts
const getDistributionData = async (req, res, next) => {
  try {
    const { state, district, block, village } = req.query;

    // Build filter object - simple single select
    const filter = {};
    if (state) filter.state = state;
    if (district) filter.district = district;
    if (block) filter.block = block;
    if (village) filter.village = village;

    // Check if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      // Get management type distribution
      const managementTypeDistribution = await School.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$management_type",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            label: "$_id",
            count: 1,
            _id: 0,
          },
        },
      ]);

      // Get location distribution
      const locationDistribution = await School.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$location",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            label: "$_id",
            count: 1,
            _id: 0,
          },
        },
      ]);

      // Get school type distribution
      const schoolTypeDistribution = await School.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$school_type",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            label: "$_id",
            count: 1,
            _id: 0,
          },
        },
      ]);

      successResponse(res, 200, "Distribution data fetched successfully", {
        managementTypeDistribution,
        locationDistribution,
        schoolTypeDistribution,
      });
    } else {
      // Use mock data
      const managementTypeDistribution = await mockSchoolService.aggregate([
        { $match: filter },
        { $group: { _id: "$management_type", count: { $sum: 1 } } },
        { $project: { label: "$_id", count: 1, _id: 0 } },
      ]);

      const locationDistribution = await mockSchoolService.aggregate([
        { $match: filter },
        { $group: { _id: "$location", count: { $sum: 1 } } },
        { $project: { label: "$_id", count: 1, _id: 0 } },
      ]);

      const schoolTypeDistribution = await mockSchoolService.aggregate([
        { $match: filter },
        { $group: { _id: "$school_type", count: { $sum: 1 } } },
        { $project: { label: "$_id", count: 1, _id: 0 } },
      ]);

      successResponse(res, 200, "Distribution data fetched successfully (mock data)", {
        managementTypeDistribution,
        locationDistribution,
        schoolTypeDistribution,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get filter options (states, districts, blocks, villages)
const getFilterOptions = async (req, res, next) => {
  try {
    const { type, state, district, block } = req.query;

    let filter = {};
    let groupBy = "";

    switch (type) {
      case "states":
        groupBy = "$state";
        break;
      case "districts":
        if (state) filter.state = state;
        groupBy = "$district";
        break;
      case "blocks":
        if (state) filter.state = state;
        if (district) filter.district = district;
        groupBy = "$block";
        break;
      case "villages":
        if (state) filter.state = state;
        if (district) filter.district = district;
        if (block) filter.block = block;
        groupBy = "$village";
        break;
      default:
        return errorResponse(res, 400, "Invalid filter type");
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      const options = await School.aggregate([
        { $match: filter },
        {
          $group: {
            _id: groupBy,
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            name: "$_id",
            count: 1,
            _id: 0,
          },
        },
        { $sort: { name: 1 } },
      ]);

      successResponse(res, 200, "Filter options fetched successfully", options);
    } else {
      // Use mock data
      const options = await mockSchoolService.aggregate([
        { $match: filter },
        { $group: { _id: groupBy, count: { $sum: 1 } } },
        { $project: { name: "$_id", count: 1, _id: 0 } },
        { $sort: { name: 1 } },
      ]);

      successResponse(res, 200, "Filter options fetched successfully (mock data)", options);
    }
  } catch (error) {
    next(error);
  }
};

export {
  getAllSchools,
  getSchoolById,
  createSchool,
  updateSchool,
  deleteSchool,
  getDistributionData,
  getFilterOptions,
};
