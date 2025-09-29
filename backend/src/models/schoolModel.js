import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema(
  {
    udise_code: {
      type: String,
      required: [true, "UDISE code is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    school_name: {
      type: String,
      required: [true, "School name is required"],
      trim: true,
      maxLength: [200, "School name cannot exceed 200 characters"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
    },
    block: {
      type: String,
      required: [true, "Block is required"],
      trim: true,
    },
    village: {
      type: String,
      required: [true, "Village is required"],
      trim: true,
    },
    management_type: {
      type: String,
      required: [true, "Management type is required"],
      enum: ["Government", "Private Unaided", "Aided", "Central Government", "Other"],
      default: "Government",
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      enum: ["Rural", "Urban"],
      default: "Rural",
    },
    school_type: {
      type: String,
      required: [true, "School type is required"],
      enum: ["Co-Ed", "Girls", "Boys"],
      default: "Co-Ed",
    },
    // Additional fields for comprehensive school data
    total_students: {
      type: Number,
      default: 0,
      min: [0, "Total students cannot be negative"],
    },
    total_teachers: {
      type: Number,
      default: 0,
      min: [0, "Total teachers cannot be negative"],
    },
    establishment_year: {
      type: Number,
      min: [1800, "Establishment year must be after 1800"],
      max: [new Date().getFullYear(), "Establishment year cannot be in the future"],
    },
    school_category: {
      type: String,
      enum: ["Primary", "Upper Primary", "Secondary", "Higher Secondary", "All", "Primary with Upper Primary"],
      default: "All",
    },
    // Kaggle specific fields
    serial_no: {
      type: Number,
    },
    cluster: {
      type: String,
      trim: true,
    },
    school_status: {
      type: String,
      enum: ["Operational", "Closed", "Merged", "Other"],
      default: "Operational",
    },
    // Raw Kaggle fields for reference
    raw_location: {
      type: String,
      trim: true,
    },
    raw_state_mgmt: {
      type: String,
      trim: true,
    },
    raw_national_mgmt: {
      type: String,
      trim: true,
    },
    raw_school_category: {
      type: String,
      trim: true,
    },
    raw_school_type: {
      type: String,
      trim: true,
    },
    raw_school_status: {
      type: String,
      trim: true,
    },
    // Contact information
    contact_number: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    // Address details
    address: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    // Coordinates (optional)
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180,
      },
    },
    // Status
    is_active: {
      type: Boolean,
      default: true,
    },
    // Additional metadata
    last_updated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
schoolSchema.index({ state: 1, district: 1, block: 1, village: 1 });
schoolSchema.index({ management_type: 1 });
schoolSchema.index({ location: 1 });
schoolSchema.index({ school_type: 1 });

// Virtual for full address
schoolSchema.virtual("full_address").get(function () {
  return `${this.village}, ${this.block}, ${this.district}, ${this.state}`;
});

// Ensure virtual fields are serialized
schoolSchema.set("toJSON", { virtuals: true });

const School = mongoose.model("School", schoolSchema);

export default School;
