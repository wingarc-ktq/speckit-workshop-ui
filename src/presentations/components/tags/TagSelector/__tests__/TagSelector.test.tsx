import type { ComponentProps } from 'react';

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockTag } from '@/__fixtures__/tags';
import { i18n } from '@/i18n/config';

import { TagSelector } from '../TagSelector';

import type { RenderResult } from '@testing-library/react';

describe('TagSelector', () => {
  const availableTags = [mockTag];

  const renderTagSelector = (
    props: Partial<ComponentProps<typeof TagSelector>> = {}
  ) =>
    render(
      <TagSelector
        value={[]}
        options={availableTags}
        onChange={vi.fn()}
        {...props}
      />
    );

  let r: RenderResult;

  beforeEach(async () => await i18n.changeLanguage('ja'));

  describe('多言語リソース', () => {
    describe('i18n: components.tagSelector.label', () => {
      const text = 'タグ';
      test(`locale:ja "${text}"が表示される`, () => {
        r = renderTagSelector();
        expect(r.getByLabelText(text)).toBeInTheDocument();
      });
    });

    describe('i18n: components.tagSelector.noOptions', () => {
      const text = '利用可能なタグがありません';
      test(`locale:ja "${text}"が表示される`, async () => {
        const user = userEvent.setup();
        r = renderTagSelector({ options: [] });

        const input = r.getByRole('combobox');
        await user.click(input);

        expect(await r.findByText(text)).toBeInTheDocument();
      });
    });
  });

  describe('カスタムpropsの動作', () => {
    test('カスタムラベルが表示されること', () => {
      r = renderTagSelector({ label: 'タグを選択' });

      expect(r.getByLabelText('タグを選択')).toBeInTheDocument();
    });

    test('カスタムプレースホルダーが表示されること', () => {
      r = renderTagSelector({ placeholder: 'タグを選んでください' });

      expect(
        r.getByPlaceholderText('タグを選んでください')
      ).toBeInTheDocument();
    });

    test('エラーメッセージが表示されること', () => {
      r = renderTagSelector({ error: 'タグを選択してください' });

      expect(r.getByText('タグを選択してください')).toBeInTheDocument();
    });

    test('requiredプロップが適用されること', () => {
      r = renderTagSelector({ label: 'タグ', required: true });

      const input = r.getByLabelText(/タグ/);
      expect(input).toBeRequired();
    });
  });

  describe('onChangeシグネチャ変換', () => {
    test('onChangeがシンプルな形式で呼び出されること', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      r = renderTagSelector({ onChange });

      const input = r.getByRole('combobox');
      await user.click(input);

      const option = await r.findByRole('option', { name: 'Important' });
      await user.click(option);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith([mockTag]);
    });
  });
});
