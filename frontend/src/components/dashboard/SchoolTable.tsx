'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

// Mock school data
const mockSchools = [
  {
    id: '1',
    school_name: 'Government Primary School',
    management_type: 'Government',
    location: 'Rural',
    school_type: 'Co-Ed',
    state: 'Madhya Pradesh',
    district: 'Bhopal',
    block: 'Block A',
    village: 'Village 1',
    students: 150,
    teachers: 8,
  },
  {
    id: '2',
    school_name: 'Private High School',
    management_type: 'Private Unaided',
    location: 'Urban',
    school_type: 'Co-Ed',
    state: 'Madhya Pradesh',
    district: 'Bhopal',
    block: 'Block A',
    village: 'Village 2',
    students: 300,
    teachers: 15,
  },
  {
    id: '3',
    school_name: 'Girls Secondary School',
    management_type: 'Government',
    location: 'Rural',
    school_type: 'Girls',
    state: 'Madhya Pradesh',
    district: 'Indore',
    block: 'Block X',
    village: 'Village X1',
    students: 200,
    teachers: 12,
  },
  {
    id: '4',
    school_name: 'Boys High School',
    management_type: 'Aided',
    location: 'Urban',
    school_type: 'Boys',
    state: 'Maharashtra',
    district: 'Mumbai',
    block: 'Block 1',
    village: 'Village M1',
    students: 400,
    teachers: 20,
  },
  {
    id: '5',
    school_name: 'Community School',
    management_type: 'Private Unaided',
    location: 'Rural',
    school_type: 'Co-Ed',
    state: 'Karnataka',
    district: 'Bangalore',
    block: 'Block B1',
    village: 'Village B1',
    students: 180,
    teachers: 10,
  },
];

const getManagementBadgeColor = (type: string) => {
  switch (type) {
    case 'Government':
      return 'bg-green-100 text-green-800';
    case 'Private Unaided':
      return 'bg-blue-100 text-blue-800';
    case 'Aided':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getLocationBadgeColor = (location: string) => {
  return location === 'Rural' 
    ? 'bg-orange-100 text-orange-800' 
    : 'bg-cyan-100 text-cyan-800';
};

const getSchoolTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'Co-Ed':
      return 'bg-pink-100 text-pink-800';
    case 'Girls':
      return 'bg-rose-100 text-rose-800';
    case 'Boys':
      return 'bg-sky-100 text-sky-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function SchoolTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedSchool, setSelectedSchool] = useState<typeof mockSchools[0] | null>(null);

  // In a real app, this would use the filter context
  const activeFilters: Record<string, string> = {};
  
  // Filter schools based on active filters
  const filteredSchools = mockSchools.filter(school => {
    if (activeFilters.state && school.state !== activeFilters.state) return false;
    if (activeFilters.district && school.district !== activeFilters.district) return false;
    if (activeFilters.block && school.block !== activeFilters.block) return false;
    if (activeFilters.village && school.village !== activeFilters.village) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredSchools.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedSchools = filteredSchools.slice(startIndex, startIndex + pageSize);

  const handleEdit = (school: typeof mockSchools[0]) => {
    console.log('Edit school:', school);
    // TODO: Open edit modal
  };

  const handleDelete = (school: typeof mockSchools[0]) => {
    console.log('Delete school:', school);
    // TODO: Show delete confirmation
  };

  const handleView = (school: typeof mockSchools[0]) => {
    setSelectedSchool(school);
  };

  const handleAddNew = () => {
    console.log('Add new school');
    // TODO: Open add modal
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Schools ({filteredSchools.length})</span>
          <Button onClick={handleAddNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add School
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School Name</TableHead>
                <TableHead>Management</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>State</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSchools.map((school) => (
                <TableRow key={school.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="font-medium">{school.school_name}</TableCell>
                  <TableCell>
                    <Badge className={getManagementBadgeColor(school.management_type)}>
                      {school.management_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getLocationBadgeColor(school.location)}>
                      {school.location}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSchoolTypeBadgeColor(school.school_type)}>
                      {school.school_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{school.state}</TableCell>
                  <TableCell>{school.district}</TableCell>
                  <TableCell>{school.students}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(school)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(school)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredSchools.length)} of {filteredSchools.length} schools
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* School Details Modal */}
        <Dialog open={!!selectedSchool} onOpenChange={() => setSelectedSchool(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>School Details</DialogTitle>
            </DialogHeader>
            {selectedSchool && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">School Name</label>
                    <p className="text-lg font-semibold">{selectedSchool.school_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Management Type</label>
                    <p className="text-lg">{selectedSchool.management_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="text-lg">{selectedSchool.location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">School Type</label>
                    <p className="text-lg">{selectedSchool.school_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">State</label>
                    <p className="text-lg">{selectedSchool.state}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">District</label>
                    <p className="text-lg">{selectedSchool.district}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Block</label>
                    <p className="text-lg">{selectedSchool.block}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Village</label>
                    <p className="text-lg">{selectedSchool.village}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Students</label>
                    <p className="text-lg font-semibold text-blue-600">{selectedSchool.students}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Teachers</label>
                    <p className="text-lg font-semibold text-green-600">{selectedSchool.teachers}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

