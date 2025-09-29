'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import axios from '@/lib/api/axios';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: any;
  onSuccess: () => void;
}

export default function DeleteConfirmModal({ isOpen, onClose, school, onSuccess }: DeleteConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      
      await axios.delete(`/schools/${school._id}`);
      
      toast.success('School deleted successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to delete school';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!school) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete School
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this school? This action cannot be undone.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900">{school.school_name}</h4>
            <p className="text-sm text-gray-600">UDISE Code: {school.udise_code}</p>
            <p className="text-sm text-gray-600">
              {school.village}, {school.block}, {school.district}, {school.state}
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete School'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


