'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HierarchicalSelect } from '@/components/ui/hierarchical-select';
import { toast } from 'sonner';
import axios from '@/lib/api/axios';

// School form schema
const schoolSchema = z.object({
  udise_code: z.string().min(1, 'UDISE code is required'),
  school_name: z.string().min(1, 'School name is required'),
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'),
  block: z.string().min(1, 'Block is required'),
  village: z.string().min(1, 'Village is required'),
  management_type: z.string().min(1, 'Management type is required'),
  location: z.string().min(1, 'Location is required'),
  school_type: z.string().min(1, 'School type is required'),
  total_students: z.number().min(0, 'Students count must be positive'),
  total_teachers: z.number().min(0, 'Teachers count must be positive'),
  establishment_year: z.number().min(1800, 'Invalid establishment year').max(new Date().getFullYear(), 'Invalid establishment year'),
  school_category: z.string().min(1, 'School category is required'),
  contact_number: z.string().optional(),
  address: z.string().optional(),
  pincode: z.string().optional(),
});

type SchoolFormData = z.infer<typeof schoolSchema>;

interface SchoolFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  school?: any; // School data for editing
  onSuccess: () => void;
}

const managementTypes = [
  'Government',
  'Private Unaided',
  'Aided',
  'Central Government',
  'Other'
];

const locations = ['Rural', 'Urban'];
const schoolTypes = ['Co-Ed', 'Girls', 'Boys'];
const schoolCategories = [
  'Primary',
  'Upper Primary',
  'Secondary',
  'Higher Secondary',
  'All',
  'Primary with Upper Primary'
];

export default function SchoolFormModal({ isOpen, onClose, school, onSuccess }: SchoolFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!school;

  const form = useForm<SchoolFormData>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      udise_code: '',
      school_name: '',
      state: '',
      district: '',
      block: '',
      village: '',
      management_type: '',
      location: '',
      school_type: '',
      total_students: 0,
      total_teachers: 0,
      establishment_year: new Date().getFullYear(),
      school_category: '',
      contact_number: '',
      address: '',
      pincode: '',
    },
  });

  // Reset form when modal opens/closes or school changes
  useEffect(() => {
    if (isOpen) {
      if (school) {
        // Editing mode - populate form with school data
        form.reset({
          udise_code: school.udise_code || '',
          school_name: school.school_name || '',
          state: school.state || '',
          district: school.district || '',
          block: school.block || '',
          village: school.village || '',
          management_type: school.management_type || '',
          location: school.location || '',
          school_type: school.school_type || '',
          total_students: school.total_students || 0,
          total_teachers: school.total_teachers || 0,
          establishment_year: school.establishment_year || new Date().getFullYear(),
          school_category: school.school_category || '',
          contact_number: school.contact_number || '',
          address: school.address || '',
          pincode: school.pincode || '',
        });
      } else {
        // Add mode - reset to defaults
        form.reset({
          udise_code: '',
          school_name: '',
          state: '',
          district: '',
          block: '',
          village: '',
          management_type: '',
          location: '',
          school_type: '',
          total_students: 0,
          total_teachers: 0,
          establishment_year: new Date().getFullYear(),
          school_category: '',
          contact_number: '',
          address: '',
          pincode: '',
        });
      }
    }
  }, [isOpen, school, form]);

  const onSubmit = async (data: SchoolFormData) => {
    try {
      setIsLoading(true);

      if (isEditing) {
        // Update existing school
        await axios.put(`/schools/${school._id}`, data);
        toast.success('School updated successfully');
      } else {
        // Create new school
        await axios.post('/schools', data);
        toast.success('School created successfully');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Operation failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit School' : 'Add New School'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* UDISE Code */}
            <div className="space-y-2">
              <Label htmlFor="udise_code">UDISE Code *</Label>
              <Input
                id="udise_code"
                {...form.register('udise_code')}
                placeholder="Enter UDISE code"
              />
              {form.formState.errors.udise_code && (
                <p className="text-sm text-red-600">{form.formState.errors.udise_code.message}</p>
              )}
            </div>

            {/* School Name */}
            <div className="space-y-2">
              <Label htmlFor="school_name">School Name *</Label>
              <Input
                id="school_name"
                {...form.register('school_name')}
                placeholder="Enter school name"
              />
              {form.formState.errors.school_name && (
                <p className="text-sm text-red-600">{form.formState.errors.school_name.message}</p>
              )}
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <HierarchicalSelect
                value={form.watch('state')}
                onValueChange={(value) => {
                  form.setValue('state', value);
                  // Clear dependent fields when state changes
                  form.setValue('district', '');
                  form.setValue('block', '');
                  form.setValue('village', '');
                }}
                placeholder="Select state"
                level="states"
              />
              {form.formState.errors.state && (
                <p className="text-sm text-red-600">{form.formState.errors.state.message}</p>
              )}
            </div>

            {/* District */}
            <div className="space-y-2">
              <Label htmlFor="district">District *</Label>
              <HierarchicalSelect
                value={form.watch('district')}
                onValueChange={(value) => {
                  form.setValue('district', value);
                  // Clear dependent fields when district changes
                  form.setValue('block', '');
                  form.setValue('village', '');
                }}
                placeholder="Select district"
                level="districts"
                parentState={form.watch('state')}
                disabled={!form.watch('state')}
              />
              {form.formState.errors.district && (
                <p className="text-sm text-red-600">{form.formState.errors.district.message}</p>
              )}
            </div>

            {/* Block */}
            <div className="space-y-2">
              <Label htmlFor="block">Block *</Label>
              <HierarchicalSelect
                value={form.watch('block')}
                onValueChange={(value) => {
                  form.setValue('block', value);
                  // Clear dependent fields when block changes
                  form.setValue('village', '');
                }}
                placeholder="Select block"
                level="blocks"
                parentState={form.watch('state')}
                parentDistrict={form.watch('district')}
                disabled={!form.watch('district')}
              />
              {form.formState.errors.block && (
                <p className="text-sm text-red-600">{form.formState.errors.block.message}</p>
              )}
            </div>

            {/* Village */}
            <div className="space-y-2">
              <Label htmlFor="village">Village *</Label>
              <HierarchicalSelect
                value={form.watch('village')}
                onValueChange={(value) => form.setValue('village', value)}
                placeholder="Select village"
                level="villages"
                parentState={form.watch('state')}
                parentDistrict={form.watch('district')}
                parentBlock={form.watch('block')}
                disabled={!form.watch('block')}
              />
              {form.formState.errors.village && (
                <p className="text-sm text-red-600">{form.formState.errors.village.message}</p>
              )}
            </div>

            {/* Management Type */}
            <div className="space-y-2">
              <Label htmlFor="management_type">Management Type *</Label>
              <Select
                value={form.watch('management_type')}
                onValueChange={(value) => form.setValue('management_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select management type" />
                </SelectTrigger>
                <SelectContent>
                  {managementTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.management_type && (
                <p className="text-sm text-red-600">{form.formState.errors.management_type.message}</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Select
                value={form.watch('location')}
                onValueChange={(value) => form.setValue('location', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.location && (
                <p className="text-sm text-red-600">{form.formState.errors.location.message}</p>
              )}
            </div>

            {/* School Type */}
            <div className="space-y-2">
              <Label htmlFor="school_type">School Type *</Label>
              <Select
                value={form.watch('school_type')}
                onValueChange={(value) => form.setValue('school_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select school type" />
                </SelectTrigger>
                <SelectContent>
                  {schoolTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.school_type && (
                <p className="text-sm text-red-600">{form.formState.errors.school_type.message}</p>
              )}
            </div>

            {/* School Category */}
            <div className="space-y-2">
              <Label htmlFor="school_category">School Category *</Label>
              <Select
                value={form.watch('school_category')}
                onValueChange={(value) => form.setValue('school_category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select school category" />
                </SelectTrigger>
                <SelectContent>
                  {schoolCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.school_category && (
                <p className="text-sm text-red-600">{form.formState.errors.school_category.message}</p>
              )}
            </div>

            {/* Total Students */}
            <div className="space-y-2">
              <Label htmlFor="total_students">Total Students *</Label>
              <Input
                id="total_students"
                type="number"
                {...form.register('total_students', { valueAsNumber: true })}
                placeholder="Enter student count"
              />
              {form.formState.errors.total_students && (
                <p className="text-sm text-red-600">{form.formState.errors.total_students.message}</p>
              )}
            </div>

            {/* Total Teachers */}
            <div className="space-y-2">
              <Label htmlFor="total_teachers">Total Teachers *</Label>
              <Input
                id="total_teachers"
                type="number"
                {...form.register('total_teachers', { valueAsNumber: true })}
                placeholder="Enter teacher count"
              />
              {form.formState.errors.total_teachers && (
                <p className="text-sm text-red-600">{form.formState.errors.total_teachers.message}</p>
              )}
            </div>

            {/* Establishment Year */}
            <div className="space-y-2">
              <Label htmlFor="establishment_year">Establishment Year *</Label>
              <Input
                id="establishment_year"
                type="number"
                {...form.register('establishment_year', { valueAsNumber: true })}
                placeholder="Enter establishment year"
              />
              {form.formState.errors.establishment_year && (
                <p className="text-sm text-red-600">{form.formState.errors.establishment_year.message}</p>
              )}
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <Label htmlFor="contact_number">Contact Number</Label>
              <Input
                id="contact_number"
                {...form.register('contact_number')}
                placeholder="Enter contact number"
              />
            </div>

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                {...form.register('address')}
                placeholder="Enter address"
              />
            </div>

            {/* Pincode */}
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                {...form.register('pincode')}
                placeholder="Enter pincode"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (isEditing ? 'Update School' : 'Create School')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


