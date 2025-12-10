"use client";
import { useState } from 'react';
import { ApiPagination } from '@/components/custom/ui/api-pagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { FolderSidebar } from './FolderSidebar';
import { MediaUploader } from './MediaUploader';
import { MediaGrid } from './MediaGrid';
import { MediaDetailPanel } from './MediaDetailPanel';
import { MediaToolbar } from './MediaToolbar';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import type { MediaItem } from '../types';

interface MediaLibraryProps {
  token: string;
  selectable?: boolean;
  multiSelect?: boolean;
  onSelect?: (items: MediaItem[]) => void;
  initialFolder?: string;
}

export function MediaLibrary({ 
  token,
  selectable = false, 
  multiSelect = true,
  onSelect,
  initialFolder = 'all'
}: MediaLibraryProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);

  const {
    filteredItems,
    loading,
    selectedFolder,
    selectedIds,
    selectedItems,
    viewMode,
    detailItem,
    folderCounts,
    searchQuery,
    pagination,
    loadMedia,
    selectFolder,
    selectItem,
    clearSelection,
    openDetail,
    closeDetail,
    setViewMode,
    setSearchQuery,
    setPage,
    updateMedia,
    deleteMedia,
    uploadMedia,
  } = useMediaLibrary({
    token,
    initialFolder,
    multiSelect,
    selectable,
  });

  const handleDeleteRequest = (ids: string[]) => {
    setDeleteIds(ids);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    await deleteMedia(deleteIds);
    setDeleteDialogOpen(false);
    setDeleteIds([]);
  };

  const handleConfirmSelection = () => {
    if (onSelect && selectedIds.length > 0) {
      onSelect(selectedItems);
    }
  };

  return (
    <div className="flex h-full bg-background transition-all duration-200">
      {/* Folder Sidebar */}
      <FolderSidebar
        selectedFolder={selectedFolder}
        onSelectFolder={selectFolder}
        folderCounts={folderCounts}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <MediaToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCount={selectedIds.length}
          onClearSelection={clearSelection}
          onBulkDelete={() => handleDeleteRequest(selectedIds)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRefresh={loadMedia}
          loading={loading}
          selectable={selectable}
          onConfirmSelection={handleConfirmSelection}
        />

        {/* Upload Zone */}
        <div className="px-3 py-1.5 border-b border-border">
          <MediaUploader
            folder={selectedFolder}
            onUpload={uploadMedia}
            onUploadComplete={loadMedia}
          />
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-auto p-3">
          <MediaGrid
            items={filteredItems}
            selectedIds={selectedIds}
            onSelectItem={selectItem}
            onOpenDetail={openDetail}
            onDelete={handleDeleteRequest}
            viewMode={viewMode}
            loading={loading}
          />

          {/* Pagination */}
          {pagination.pages > 1 && (
            <ApiPagination
              {...pagination}
              onPageChange={setPage}
              className="mt-4"
            />
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {detailItem && !selectable && (
        <MediaDetailPanel
          item={detailItem}
          onClose={closeDetail}
          onUpdate={updateMedia}
          onDelete={handleDeleteRequest}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteIds.length} item(s)? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
