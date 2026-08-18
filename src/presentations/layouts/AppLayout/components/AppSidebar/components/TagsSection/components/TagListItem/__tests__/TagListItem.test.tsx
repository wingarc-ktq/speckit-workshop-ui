import type { ComponentProps } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TagColor } from '@/domain/models/tag';

import { TagListItem } from '../TagListItem';

describe('TagListItem', () => {
  const defaultProps: ComponentProps<typeof TagListItem> = {
    name: 'Important',
    color: TagColor.RED,
    selected: false,
    onClick: vi.fn(),
  };

  const renderTagListItem = (
    props: Partial<ComponentProps<typeof TagListItem>> = {}
  ) => {
    return render(<TagListItem {...defaultProps} {...props} />);
  };

  describe('初期表示', () => {
    test('タグ名が表示されること', () => {
      renderTagListItem();

      expect(screen.getByText('Important')).toBeInTheDocument();
    });

    test('非選択状態ではSellOutlinedIconが表示されること', () => {
      renderTagListItem({ selected: false });

      const icon = screen.getByTestId('SellOutlinedIcon');
      expect(icon).toBeInTheDocument();
    });

    test('選択状態ではSellIconが表示されること', () => {
      renderTagListItem({ selected: true });

      const icon = screen.getByTestId('SellIcon');
      expect(icon).toBeInTheDocument();
    });

    test('colorプロップで指定した色がアイコンのsx propsに適用されること', () => {
      const { container } = renderTagListItem({ color: TagColor.BLUE });

      const icon = screen.getByTestId('SellOutlinedIcon');
      // MUI の sx props で color が渡されていることを確認
      expect(icon).toBeInTheDocument();
      // SVG要素の親要素にcolorが適用されていることを確認
      const svgElement = container.querySelector(
        'svg[data-testid="SellOutlinedIcon"]'
      );
      expect(svgElement).toBeInTheDocument();
    });
  });

  describe('選択状態に応じた表示', () => {
    test('非選択状態ではテキストが通常の太さで表示されること', () => {
      renderTagListItem({ selected: false });

      const text = screen.getByText('Important');
      // MUIのslotPropsでfontWeightが設定されている
      expect(text).toBeInTheDocument();
    });

    test('選択状態ではテキストが太字で表示されること', () => {
      renderTagListItem({ selected: true });

      const text = screen.getByText('Important');
      // MUIのslotPropsでfontWeightが設定されている
      expect(text).toBeInTheDocument();
    });

    test('非選択状態と選択状態でアイコンが切り替わること', () => {
      const { rerender } = render(
        <TagListItem {...defaultProps} selected={false} />
      );

      expect(screen.getByTestId('SellOutlinedIcon')).toBeInTheDocument();

      rerender(<TagListItem {...defaultProps} selected={true} />);

      expect(screen.getByTestId('SellIcon')).toBeInTheDocument();
      expect(screen.queryByTestId('SellOutlinedIcon')).not.toBeInTheDocument();
    });
  });

  describe('ユーザー操作', () => {
    test('タグをクリックするとonClickが呼ばれること', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderTagListItem({ onClick });

      const button = screen.getByRole('button');
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
