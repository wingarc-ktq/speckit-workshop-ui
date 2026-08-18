import { act, fireEvent, screen } from '@testing-library/react';

// デフォルトの値
const FILE_TYPE = 'application/pdf';
const AREA_ID = 'dragAndDropArea';

/**
 * ドラッグイベントを作成
 */
const createDragEvent = (files: File[]): DragEvent => {
  const dataTransfer = {
    files,
    types: ['Files'],
  };
  return { dataTransfer } as unknown as DragEvent;
};

/**
 * ファイルを作成
 */
export const createFile = (name: string, type: string = FILE_TYPE): File =>
  new File(['dummy content'], name, { type });

/**
 * 複数ファイルを作成
 */
export const createFiles = (
  names: string[],
  type: string = FILE_TYPE
): File[] => names.map((name) => createFile(name, type));

/**
 * ドラッグを実行
 */
export const drag = async (files: File[], areaId: string = AREA_ID) => {
  const dragEvent = createDragEvent(files);
  const area = screen.getByTestId(areaId);
  await act(() => fireEvent.dragEnter(area, dragEvent));
};

/**
 * ドラッグを終了
 */
export const dragLeave = async (files: File[], areaId: string = AREA_ID) => {
  const dragEvent = createDragEvent(files);
  const area = screen.getByTestId(areaId);
  await act(() => fireEvent.dragLeave(area, dragEvent));
};

/**
 * ドロップを実行
 */
export const drop = async (files: File[], areaId: string = AREA_ID) => {
  const dragEvent = createDragEvent(files);
  const area = screen.getByTestId(areaId);
  await act(() => fireEvent.drop(area, dragEvent));
};
