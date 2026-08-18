export type TagId = string;

export const TagColor = {
  BLUE: 'blue',
  RED: 'red',
  YELLOW: 'yellow',
  GREEN: 'green',
  PURPLE: 'purple',
  ORANGE: 'orange',
  GRAY: 'gray',
} as const;
export type TagColor = (typeof TagColor)[keyof typeof TagColor];

export interface Tag {
  /** タグID */
  id: TagId;

  /** タグ名 */
  name: string;

  /** 表示色 */
  color: TagColor;

  /** 作成日時 */
  createdAt: Date;

  /** 更新日時 */
  updatedAt: Date;
}

/**
 * タグバリデーションルール
 * - name: 1〜50文字、一意
 * - color: 定義された7色のいずれか
 *
 * 制約:
 * - タグ名は重複不可（ケース非依存）
 * - タグ削除時、関連する全ファイルからタグが削除される
 */
