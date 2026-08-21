import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import type { FileInfo, FileListResponse } from '@/adapters/generated/files';
import { TAG_MAP } from '@/domain/constants/tags';
import { i18n } from '@/i18n/config';

import { DocumentManagementPage } from '../DocumentManagementPage';

const mockFile1 = {
	id: 'file-1',
	name: '契約書_東京.pdf',
	size: 2_000_000,
	mimeType: 'application/pdf',
	uploadedAt: '2024-01-15T09:00:00.000Z',
	downloadUrl: '/files/file-1/download',
	tagIds: ['tag-2'],
}as const satisfies FileInfo;

const mockFile2 = {
	id: 'file-2',
	name: '請求書_大阪.xlsx',
	size: 500_000,
	mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	uploadedAt: '2024-01-14T09:00:00.000Z',
	downloadUrl: '/files/file-2/download',
	tagIds: ['tag-3'],
}as const satisfies FileInfo;/*リテラル型。中の値が一意に決められてる。*/

const mockFile3 = {
	id: 'file-3',
	name: '議事録_名古屋.docx',
	size: 1_000_000,
	mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	uploadedAt: '2024-01-10T09:00:00.000Z',
	downloadUrl: '/files/file-3/download',
	tagIds: ['tag-6'],
}as const satisfies FileInfo;

const mockFilesResponse: FileListResponse = {
	files: [mockFile1, mockFile2, mockFile3],
	total: 3,
	page: 1,
	limit: 20,
};

const mockFile1TagName = TAG_MAP[mockFile1.tagIds[0]].name;
const mockFile2SearchKeyword = mockFile2.name.split('_')[0];
const mockFile1UploadDate = mockFile1.uploadedAt.slice(0, 10);

const mockGetFiles = vi.fn();

const LocationProbe = () => {
	const location = useLocation();
	return <output data-testid="location-search">{location.search}</output>;
};

const renderPage = (initialEntry = '/documents') => {
	return render(
		<RepositoryTestWrapper
			override={{
				files: {
					getFiles: mockGetFiles,
				},
			}}
		>
			<MemoryRouter initialEntries={[initialEntry]}>
				<Routes>
					<Route
						path="/documents"
						element={
							<>
								<DocumentManagementPage />
								<LocationProbe />
							</>
						}
					/>
				</Routes>
			</MemoryRouter>
		</RepositoryTestWrapper>,
	);
};

describe('DocumentManagementPage', () => {
	beforeEach(async () => {
		await i18n.changeLanguage('ja');
		mockGetFiles.mockResolvedValue(mockFilesResponse);
	});

	describe('初期表示', () => {
		test('検索欄、フィルター、文書一覧が表示されること', async () => {
			renderPage();

			expect(screen.getByPlaceholderText('ファイル名で検索...')).toBeInTheDocument();
			expect(screen.getByText('タグ')).toBeInTheDocument();
			expect(screen.getByRole('heading', { name: 'アップロード日時' })).toBeInTheDocument();
			expect(await screen.findByText(mockFile1.name)).toBeInTheDocument();
			expect(
				screen.getByText(new RegExp(`${mockFilesResponse.files.length} 件の文書`)),
			).toBeInTheDocument();
		});
	});

	describe('検索とフィルター', () => {
		test('検索入力がデバウンス後にURLクエリへ反映されること', async () => {
			const user = userEvent.setup();
			renderPage();
			const searchInput = screen.getByPlaceholderText('ファイル名で検索...');

			await user.type(searchInput, mockFile2SearchKeyword);

			expect(screen.getByTestId('location-search')).toHaveTextContent('');
			await waitFor(() => {
				expect(screen.getByTestId('location-search')).toHaveTextContent(
				`?search=${encodeURIComponent(mockFile2SearchKeyword)}`,
			);
			});
			expect(mockGetFiles).toHaveBeenLastCalledWith({ search: mockFile2SearchKeyword });
		});

		test('タグと日付の入力で一覧件数が絞り込まれること', async () => {
			const user = userEvent.setup();
			const r = renderPage();
			await screen.findByText(mockFile1.name);

			await user.click(screen.getAllByText(mockFile1TagName)[0]);
			expect(screen.getByText(/1 件の文書/)).toBeInTheDocument();

			const dateInputs = r.container.querySelectorAll<HTMLInputElement>('input[type="date"]');
			await user.type(dateInputs[0], mockFile1UploadDate);
			await user.type(dateInputs[1], mockFile1UploadDate);

			expect(screen.getByText(/1 件の文書/)).toBeInTheDocument();
			expect(dateInputs[0]).toHaveValue(mockFile1UploadDate);
			expect(dateInputs[1]).toHaveValue(mockFile1UploadDate);
		});
	});

	describe('表示操作', () => {
		test('表示モード、並び順、ソート項目を変更できること', async () => {
			const user = userEvent.setup();
			const r = renderPage();
			await screen.findByText(mockFile1.name);

			await user.click(screen.getByRole('button', { name: 'アップロード日時' }));
			await user.click(screen.getByRole('menuitem', { name: 'ファイル名' }));
			expect(screen.getByRole('button', { name: 'ファイル名' })).toBeInTheDocument();

			await user.click(screen.getByTitle('昇順/降順'));
			expect(screen.getByText('昇順')).toBeInTheDocument();

			const gridButton = r.container.querySelector('[data-testid="ViewModuleIcon"]')?.closest('button');
			expect(gridButton).not.toBeNull();
			await user.click(gridButton!);
			expect(screen.queryByRole('table')).not.toBeInTheDocument();
			expect(r.container.querySelectorAll('.MuiCard-root')).toHaveLength(
				mockFilesResponse.files.length,
			);
		});
	});

	test('アップロードボタンを押すとダイアログが開くこと', async () => {
		const user = userEvent.setup();
		renderPage();

		await user.click(screen.getByTitle('アップロード'));

		expect(await screen.findByRole('dialog')).toBeInTheDocument();
		expect(screen.getByText('文書をアップロード')).toBeInTheDocument();
	});
});
