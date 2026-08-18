/**
 * アプリケーションのリポジトリの構成
 *
 * src/adapters/repositories 以下のリポジトリを束ねて定義します。
 * 新規にrepositories配下にディレクトリを作成した場合は、ここに追加してください。
 */
import * as auth from './auth';
import * as files from './files';
import * as tags from './tags';

/**
 * リポジトリの構成型
 */
export type RepositoryComposition = {
  auth: typeof auth;
  files: typeof files;
  tags: typeof tags;
};

/**
 * アプリケーションのリポジトリの構成
 */
export const repositoryComposition: RepositoryComposition = {
  auth,
  files,
  tags,
} as const;
