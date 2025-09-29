'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFilters } from '@/context/FilterContext';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import axios from '@/lib/api/axios';
import { toast } from 'sonner';
import SchoolFormModal from './SchoolFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import SchoolTableSkeleton from './SchoolTableSkeleton';
import SchoolTableSearch from './SchoolTableSearch';

// School interface
interface School {
  _id: string;
  udise_code: string;
  school_name: string;
  management_type: string;
  location: string;
  school_type: string;
  state: string;
  district: string;
  block: string;
  village: string;
  total_students: number;
  total_teachers: number;
  establishment_year: number;
  school_category: string;
  contact_number: string;
  address: string;
  pincode: string;
  is_active: boolean;
  // Kaggle specific fields
  serial_no: number;
  cluster: string;
  school_status: string;
  // Raw fields for reference
  raw_location: string;
  raw_state_mgmt: string;
  raw_national_mgmt: string;
  raw_school_category: string;
  raw_school_type: string;
  raw_school_status: string;
}

// Fetch schools from backend
const fetchSchools = async (filters: Record<string, string> = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  
  const response = await axios.get(`/schools?${params.toString()}`);
  return response.data;
};

// Delete school
const deleteSchool = async (id: string) => {
  const response = await axios.delete(`/schools/${id}`);
  return response.data;
};

// Color functions for badges
const getColorForManagement = (management: string) => {
  const colors: Record<string, string> = {
    'Government': 'bg-blue-100 text-blue-800',
    'Private Unaided': 'bg-green-100 text-green-800',
    'Aided': 'bg-yellow-100 text-yellow-800',
    'Central Government': 'bg-purple-100 text-purple-800',
  };
  return colors[management] || 'bg-gray-100 text-gray-800';
};

const getColorForLocation = (location: string) => {
  return location === 'Rural' 
    ? 'bg-orange-100 text-orange-800' 
    : 'bg-blue-100 text-blue-800';
};

const getColorForSchoolType = (type: string) => {
  const colors: Record<string, string> = {
    'Co-Ed': 'bg-green-100 text-green-800',
    'Girls': 'bg-pink-100 text-pink-800',
    'Boys': 'bg-blue-100 text-blue-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

export default function SchoolTableReal() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<School | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [goToPageInput, setGoToPageInput] = useState('');
  
  const queryClient = useQueryClient();
  const { state, district, block, village } = useFilters();
  
  // Debounce search term to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Build filter object from context
  const filters = {
    page: currentPage.toString(),
    limit: pageSize.toString(),
    ...(state && { state }),
    ...(district && { district }),
    ...(block && { block }),
    ...(village && { village }),
    ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
  };

  // Fetch schools with React Query
  const { data: schoolsData, isLoading, error } = useQuery({
    queryKey: ['schools', currentPage, pageSize, state, district, block, village, debouncedSearchTerm],
    queryFn: () => fetchSchools(filters),
  });

  // Delete school mutation
  const deleteSchoolMutation = useMutation({
    mutationFn: deleteSchool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast.success('School deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete school');
    },
  });

  const schools = schoolsData?.data?.schools || [];
  const pagination = schoolsData?.data?.pagination || {};

  const handleEdit = (school: School) => {
    setEditingSchool(school);
    setShowFormModal(true);
  };

  const handleDelete = (school: School) => {
    setDeletingSchool(school);
    setShowDeleteModal(true);
  };

  const handleView = (school: School) => {
    setSelectedSchool(school);
    setShowDetails(true);
  };

  const handleAddNew = () => {
    setEditingSchool(null);
    setShowFormModal(true);
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['schools'] });
    setShowFormModal(false);
    setEditingSchool(null);
  };

  const handleDeleteSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['schools'] });
    setShowDeleteModal(false);
    setDeletingSchool(null);
  };

  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleGoToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages && pagination.totalPages > 0) {
      setCurrentPage(page);
      setGoToPageInput('');
    }
  };

  // Removed handleFirstPage and handleLastPage functions to prevent crashes


  const handleGoToPageInputChange = (value: string) => {
    setGoToPageInput(value);
    const page = parseInt(value);
    
    if (!isNaN(page) && page >= 1 && page <= pagination.totalPages && pagination.totalPages > 0) {
      setCurrentPage(page);
    }
  };

  if (isLoading) {
    return <SchoolTableSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Schools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            Error loading schools: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle>Schools ({pagination.totalSchools || 0})</CardTitle>
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New School
            </Button>
          </div>
          <div className="max-w-md">
            <SchoolTableSearch 
              onSearch={handleSearch}
              placeholder="Search schools by name..."
              isLoading={isLoading}
              value={searchTerm}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial No</TableHead>
                  <TableHead>UDISE Code</TableHead>
                  <TableHead>School Name</TableHead>
                  <TableHead>Management</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Block</TableHead>
                  <TableHead>Village</TableHead>
                  <TableHead>Cluster</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Teachers</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((school: School) => (
                  <TableRow 
                    key={school._id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleView(school)}
                  >
                    <TableCell className="font-medium">{school.serial_no || '-'}</TableCell>
                    <TableCell className="font-mono text-xs">{school.udise_code}</TableCell>
                    <TableCell className="font-medium">{school.school_name}</TableCell>
                    <TableCell>
                      <Badge className={getColorForManagement(school.management_type)}>
                        {school.management_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getColorForLocation(school.location)}>
                        {school.location}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getColorForSchoolType(school.school_type)}>
                        {school.school_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={school.school_status === 'Operational' ? 'default' : 'destructive'}>
                        {school.school_status}
                      </Badge>
                    </TableCell>
                    <TableCell>{school.state}</TableCell>
                    <TableCell>{school.district}</TableCell>
                    <TableCell>{school.block}</TableCell>
                    <TableCell>{school.village}</TableCell>
                    <TableCell className="text-xs">{school.cluster}</TableCell>
                    <TableCell>{school.total_students || '-'}</TableCell>
                    <TableCell>{school.total_teachers || '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(school)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(school)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(school)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Dynamic Pagination */}
          {pagination.totalPages > 1 && (
            <div className="space-y-4 mt-4">
              {/* Page Size Selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium">Rows per page:</label>
                    <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(parseInt(value))}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.totalSchools)} of {pagination.totalSchools} schools
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={!pagination.hasPrevPage}
                  >
                    Previous
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {pagination.totalPages}
                  </span>
                  
                  {/* Go to Page Input */}
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="Go to page"
                      value={goToPageInput}
                      onChange={(e) => setGoToPageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const page = parseInt(goToPageInput);
                          if (!isNaN(page)) {
                            handleGoToPage(page);
                          }
                        }
                      }}
                      className="w-20 h-8 text-sm"
                      min="1"
                      max={pagination.totalPages}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const page = parseInt(goToPageInput);
                        if (!isNaN(page)) {
                          handleGoToPage(page);
                        }
                      }}
                      disabled={!goToPageInput || isNaN(parseInt(goToPageInput)) || parseInt(goToPageInput) < 1 || parseInt(goToPageInput) > pagination.totalPages}
                    >
                      Go
                    </Button>
                  </div>

                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* School Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>School Details</DialogTitle>
          </DialogHeader>
          {selectedSchool && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">School Name</label>
                  <p className="text-sm">{selectedSchool.school_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">UDISE Code</label>
                  <p className="text-sm">{selectedSchool.udise_code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Management Type</label>
                  <p className="text-sm">{selectedSchool.management_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <p className="text-sm">{selectedSchool.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">School Type</label>
                  <p className="text-sm">{selectedSchool.school_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <p className="text-sm">{selectedSchool.school_category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">State</label>
                  <p className="text-sm">{selectedSchool.state}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">District</label>
                  <p className="text-sm">{selectedSchool.district}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Block</label>
                  <p className="text-sm">{selectedSchool.block}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Village</label>
                  <p className="text-sm">{selectedSchool.village}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Total Students</label>
                  <p className="text-sm">{selectedSchool.total_students || 'Not Available'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Total Teachers</label>
                  <p className="text-sm">{selectedSchool.total_teachers || 'Not Available'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Establishment Year</label>
                  <p className="text-sm">{selectedSchool.establishment_year}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Contact Number</label>
                  <p className="text-sm">{selectedSchool.contact_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <p className="text-sm">{selectedSchool.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Pincode</label>
                  <p className="text-sm">{selectedSchool.pincode}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* School Form Modal */}
      <SchoolFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingSchool(null);
        }}
        school={editingSchool}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingSchool(null);
        }}
        school={deletingSchool}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
