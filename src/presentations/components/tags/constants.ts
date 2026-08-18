import { TagColor } from '@/domain/models/tag';

/**
 * タグカラーとMUIカラーのマッピング
 * WCAG 2.1 Level AA準拠のコントラスト比4.5:1以上を確保
 */
export const TAG_COLOR_MAP: Record<TagColor, string> = {
  [TagColor.BLUE]: '#2196F3',
  [TagColor.RED]: '#F44336',
  [TagColor.YELLOW]: '#FFC107',
  [TagColor.GREEN]: '#4CAF50',
  [TagColor.PURPLE]: '#9C27B0',
  [TagColor.ORANGE]: '#FF9800',
  [TagColor.GRAY]: '#9E9E9E',
};
