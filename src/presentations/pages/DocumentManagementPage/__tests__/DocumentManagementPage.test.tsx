import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import type { FileListResponse } from '@/adapters/generated/files';
import { i18n } from '@/i18n/config';

import { DocumentManagementPage } from '../DocumentManagementPage';

const mockFilesResponse: FileListResponse = {
	files: [
		{
			id: 'file-1',
			name: '契約書_東京.pdf',
			size: 2_000_000,
			mimeType: 'application/pdf',
			uploadedAt: '2024-01-15T09:00:00.000Z',
			downloadUrl: '/files/file-1/download',
			tagIds: ['tag-2'],
		},
		{
			id: 'file-2',
			name: '請求書_大阪.xlsx',
			size: 500_000,
			mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			uploadedAt: '2024-01-14T09:00:00.000Z',
			downloadUrl: '/files/file-2/download',
			tagIds: ['tag-3'],
		},
		{
			id: 'file-3',
			name: '議事録_名古屋.docx',
			size: 1_000_000,
			mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			uploadedAt: '2024-01-10T09:00:00.000Z',
			downloadUrl: '/files/file-3/download',
			tagIds: ['tag-6'],
		},
	],
	total: 3,
	page: 1,
	limit: 20,
};

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
			expect(await screen.findByText('契約書_東京.pdf')).toBeInTheDocument();
			expect(screen.getByText(/3 件の文書/)).toBeInTheDocument();
		});
	});

	describe('検索とフィルター', () => {
		test('検索入力がデバウンス後にURLクエリへ反映されること', async () => {
			const user = userEvent.setup();
			renderPage();
			const searchInput = screen.getByPlaceholderText('ファイル名で検索...');

			await user.type(searchInput, '請求書');

			expect(screen.getByTestId('location-search')).toHaveTextContent('');
			await waitFor(() => {
				expect(screen.getByTestId('location-search')).toHaveTextContent('?search=%E8%AB%8B%E6%B1%82%E6%9B%B8');
			});
			expect(mockGetFiles).toHaveBeenLastCalledWith({ search: '請求書' });
		});

		test('タグと日付の入力で一覧件数が絞り込まれること', async () => {
			const user = userEvent.setup();
			const r = renderPage();
			await screen.findByText('契約書_東京.pdf');

			await user.click(screen.getAllByText('契約書')[0]);
			expect(screen.getByText(/1 件の文書/)).toBeInTheDocument();

			const dateInputs = r.container.querySelectorAll<HTMLInputElement>('input[type="date"]');
			await user.type(dateInputs[0], '2024-01-11');
			await user.type(dateInputs[1], '2024-01-16');

			expect(screen.getByText(/1 件の文書/)).toBeInTheDocument();
			expect(dateInputs[0]).toHaveValue('2024-01-11');
			expect(dateInputs[1]).toHaveValue('2024-01-16');
		});
	});

	describe('表示操作', () => {
		test('表示モード、並び順、ソート項目を変更できること', async () => {
			const user = userEvent.setup();
			const r = renderPage();
			await screen.findByText('契約書_東京.pdf');

			await user.click(screen.getByRole('button', { name: 'アップロード日時' }));
			await user.click(screen.getByRole('menuitem', { name: 'ファイル名' }));
			expect(screen.getByRole('button', { name: 'ファイル名' })).toBeInTheDocument();

			await user.click(screen.getByTitle('昇順/降順'));
			expect(screen.getByText('昇順')).toBeInTheDocument();

			const gridButton = r.container.querySelector('[data-testid="ViewModuleIcon"]')?.closest('button');
			expect(gridButton).not.toBeNull();
			await user.click(gridButton!);
			expect(screen.queryByRole('table')).not.toBeInTheDocument();
			expect(r.container.querySelectorAll('.MuiCard-root')).toHaveLength(3);
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
