import type { FileInfo } from '@/adapters/generated/files';

export interface FileFilterOptions {
  selectedTags: string[];
  startDate: string;
  endDate: string;
}

export const filterFiles = (
  files: FileInfo[],
  { selectedTags, startDate, endDate }: FileFilterOptions,
): FileInfo[] => {
  return files.filter((file) => {
    if (
      selectedTags.length > 0 &&
      !file.tagIds?.some((tagId) => selectedTags.includes(tagId))
    ) {
      return false;
    }

    const fileDate = new Date(file.uploadedAt);

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (fileDate < start) return false;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (fileDate > end) return false;
    }

    return true;
  });
};