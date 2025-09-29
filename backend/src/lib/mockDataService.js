// Mock data service for testing without MongoDB
let mockSchools = [
  {
    _id: "mock1",
    udise_code: "MP001001",
    school_name: "Government Primary School",
    state: "Madhya Pradesh",
    district: "Bhopal",
    block: "Block A",
    village: "Village 1",
    management_type: "Government",
    location: "Rural",
    school_type: "Co-Ed",
    total_students: 150,
    total_teachers: 8,
    establishment_year: 1985,
    school_category: "Primary",
    contact_number: "9876543210",
    address: "Near Village Panchayat",
    pincode: "462001",
    is_active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "mock2",
    udise_code: "MP001002",
    school_name: "Private High School",
    state: "Madhya Pradesh",
    district: "Bhopal",
    block: "Block A",
    village: "Village 2",
    management_type: "Private Unaided",
    location: "Urban",
    school_type: "Co-Ed",
    total_students: 300,
    total_teachers: 15,
    establishment_year: 1995,
    school_category: "All",
    contact_number: "9876543211",
    address: "Main Road, City Center",
    pincode: "462002",
    is_active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "mock3",
    udise_code: "MP001003",
    school_name: "Girls Secondary School",
    state: "Madhya Pradesh",
    district: "Indore",
    block: "Block X",
    village: "Village X1",
    management_type: "Government",
    location: "Rural",
    school_type: "Girls",
    total_students: 200,
    total_teachers: 12,
    establishment_year: 1990,
    school_category: "Secondary",
    contact_number: "9876543212",
    address: "Near Bus Stand",
    pincode: "452001",
    is_active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "mock4",
    udise_code: "MH001001",
    school_name: "Boys High School",
    state: "Maharashtra",
    district: "Mumbai",
    block: "Block 1",
    village: "Village M1",
    management_type: "Aided",
    location: "Urban",
    school_type: "Boys",
    total_students: 400,
    total_teachers: 20,
    establishment_year: 1980,
    school_category: "Higher Secondary",
    contact_number: "9876543213",
    address: "Marine Drive",
    pincode: "400001",
    is_active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "mock5",
    udise_code: "KA001001",
    school_name: "Community School",
    state: "Karnataka",
    district: "Bangalore",
    block: "Block B1",
    village: "Village B1",
    management_type: "Private Unaided",
    location: "Rural",
    school_type: "Co-Ed",
    total_students: 180,
    total_teachers: 10,
    establishment_year: 2000,
    school_category: "All",
    contact_number: "9876543214",
    address: "Near IT Park",
    pincode: "560001",
    is_active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock service functions
export const mockSchoolService = {
  // Get all schools with filtering and pagination
  async find(filter = {}, sort = {}, skip = 0, limit = 10) {
    let filteredSchools = [...mockSchools];
    
    // Apply filters with multi-select support
    if (filter.state) {
      if (filter.state.$in) {
        filteredSchools = filteredSchools.filter(school => filter.state.$in.includes(school.state));
      } else {
        filteredSchools = filteredSchools.filter(school => school.state === filter.state);
      }
    }
    if (filter.district) {
      if (filter.district.$in) {
        filteredSchools = filteredSchools.filter(school => filter.district.$in.includes(school.district));
      } else {
        filteredSchools = filteredSchools.filter(school => school.district === filter.district);
      }
    }
    if (filter.block) {
      if (filter.block.$in) {
        filteredSchools = filteredSchools.filter(school => filter.block.$in.includes(school.block));
      } else {
        filteredSchools = filteredSchools.filter(school => school.block === filter.block);
      }
    }
    if (filter.village) {
      if (filter.village.$in) {
        filteredSchools = filteredSchools.filter(school => filter.village.$in.includes(school.village));
      } else {
        filteredSchools = filteredSchools.filter(school => school.village === filter.village);
      }
    }
    if (filter.management_type) {
      filteredSchools = filteredSchools.filter(school => school.management_type === filter.management_type);
    }
    if (filter.location) {
      filteredSchools = filteredSchools.filter(school => school.location === filter.location);
    }
    if (filter.school_type) {
      filteredSchools = filteredSchools.filter(school => school.school_type === filter.school_type);
    }
    if (filter.$or) {
      filteredSchools = filteredSchools.filter(school => 
        filter.$or.some(condition => 
          Object.entries(condition).some(([key, value]) => 
            school[key] && school[key].toLowerCase().includes(value.$regex.toLowerCase())
          )
        )
      );
    }
    
    // Apply sorting
    if (Object.keys(sort).length > 0) {
      filteredSchools.sort((a, b) => {
        for (const [key, direction] of Object.entries(sort)) {
          const aVal = a[key];
          const bVal = b[key];
          if (aVal < bVal) return direction === 1 ? -1 : 1;
          if (aVal > bVal) return direction === 1 ? 1 : -1;
        }
        return 0;
      });
    }
    
    // Apply pagination
    const paginatedSchools = filteredSchools.slice(skip, skip + limit);
    
    return {
      data: paginatedSchools,
      total: filteredSchools.length
    };
  },

  // Get school by ID
  async findById(id) {
    return mockSchools.find(school => school._id === id);
  },

  // Create new school
  async create(schoolData) {
    const newSchool = {
      _id: `mock${Date.now()}`,
      ...schoolData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockSchools.push(newSchool);
    return newSchool;
  },

  // Update school
  async findByIdAndUpdate(id, updateData) {
    const index = mockSchools.findIndex(school => school._id === id);
    if (index === -1) return null;
    
    mockSchools[index] = {
      ...mockSchools[index],
      ...updateData,
      updatedAt: new Date(),
    };
    return mockSchools[index];
  },

  // Delete school
  async findByIdAndDelete(id) {
    const index = mockSchools.findIndex(school => school._id === id);
    if (index === -1) return null;
    
    const deletedSchool = mockSchools[index];
    mockSchools.splice(index, 1);
    return deletedSchool;
  },

  // Count documents
  async countDocuments(filter = {}) {
    const result = await this.find(filter);
    return result.total;
  },

  // Aggregate for distribution data
  async aggregate(pipeline) {
    // Mock aggregation for distribution data
    const matchStage = pipeline.find(stage => stage.$match);
    const groupStage = pipeline.find(stage => stage.$group);
    const projectStage = pipeline.find(stage => stage.$project);
    
    if (!matchStage || !groupStage) return [];
    
    let filteredSchools = [...mockSchools];
    
    // Apply match filter
    if (matchStage.$match) {
      const filter = matchStage.$match;
      if (filter.state) {
        filteredSchools = filteredSchools.filter(school => school.state === filter.state);
      }
      if (filter.district) {
        filteredSchools = filteredSchools.filter(school => school.district === filter.district);
      }
      if (filter.block) {
        filteredSchools = filteredSchools.filter(school => school.block === filter.block);
      }
      if (filter.village) {
        filteredSchools = filteredSchools.filter(school => school.village === filter.village);
      }
    }
    
    // Apply group by
    const groupBy = groupStage.$group._id;
    const grouped = {};
    
    filteredSchools.forEach(school => {
      const key = school[groupBy.replace('$', '')];
      if (!grouped[key]) {
        grouped[key] = 0;
      }
      grouped[key]++;
    });
    
    // Convert to array format
    const result = Object.entries(grouped).map(([key, count]) => ({
      _id: key,
      count
    }));
    
    // Apply projection if specified
    if (projectStage && projectStage.$project) {
      return result.map(item => {
        const projected = {};
        Object.entries(projectStage.$project).forEach(([newKey, value]) => {
          if (value === 1) {
            projected[newKey] = item[newKey];
          } else if (typeof value === 'string' && value.startsWith('$')) {
            const originalKey = value.replace('$', '');
            projected[newKey] = item[originalKey];
          }
        });
        return projected;
      });
    }
    
    return result;
  }
};
