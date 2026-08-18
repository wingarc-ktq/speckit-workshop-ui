import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  mockTag,
  mockTag2,
  mockTag3,
  mockTagVariations,
} from '@/__fixtures__/tags';
import { TagColor } from '@/domain/models/tag';
import { TAG_COLOR_MAP } from '@/presentations/components/tags/constants';

import { TagChips } from '../TagChips';

describe('TagChips', () => {
  describe('初期表示', () => {
    test('タグが正しく表示されること', () => {
      render(<TagChips tags={[mockTag, mockTag2, mockTag3]} />);

      expect(screen.getByText('Important')).toBeInTheDocument();
      expect(screen.getByText('Review')).toBeInTheDocument();
      expect(screen.getByText('Urgent')).toBeInTheDocument();
    });

    test('タグが空の配列の場合、何も表示されないこと', () => {
      render(<TagChips tags={[]} />);

      // タグが1つも表示されていないことを確認
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    test('各タグの色がTAG_COLOR_MAPに基づいて正しく適用されること', () => {
      const colorTags = [
        {
          ...mockTagVariations.withColor(TagColor.BLUE),
          id: 'tag-blue',
          name: 'Blue Tag',
        },
        {
          ...mockTagVariations.withColor(TagColor.RED),
          id: 'tag-red',
          name: 'Red Tag',
        },
        {
          ...mockTagVariations.withColor(TagColor.YELLOW),
          id: 'tag-yellow',
          name: 'Yellow Tag',
        },
        {
          ...mockTagVariations.withColor(TagColor.GREEN),
          id: 'tag-green',
          name: 'Green Tag',
        },
        {
          ...mockTagVariations.withColor(TagColor.PURPLE),
          id: 'tag-purple',
          name: 'Purple Tag',
        },
        {
          ...mockTagVariations.withColor(TagColor.ORANGE),
          id: 'tag-orange',
          name: 'Orange Tag',
        },
        {
          ...mockTagVariations.withColor(TagColor.GRAY),
          id: 'tag-gray',
          name: 'Gray Tag',
        },
      ];

      render(<TagChips tags={colorTags} />);

      // 各タグが表示されていることを確認
      const blueChip = screen.getByText('Blue Tag').closest('.MuiChip-root');
      const redChip = screen.getByText('Red Tag').closest('.MuiChip-root');
      const yellowChip = screen
        .getByText('Yellow Tag')
        .closest('.MuiChip-root');
      const greenChip = screen.getByText('Green Tag').closest('.MuiChip-root');
      const purpleChip = screen
        .getByText('Purple Tag')
        .closest('.MuiChip-root');
      const orangeChip = screen
        .getByText('Orange Tag')
        .closest('.MuiChip-root');
      const grayChip = screen.getByText('Gray Tag').closest('.MuiChip-root');

      // 各ChipにTAG_COLOR_MAPの色が正しく適用されていることを確認
      expect(blueChip).toHaveStyle({
        borderColor: TAG_COLOR_MAP[TagColor.BLUE],
        color: TAG_COLOR_MAP[TagColor.BLUE],
      });
      expect(redChip).toHaveStyle({
        borderColor: TAG_COLOR_MAP[TagColor.RED],
        color: TAG_COLOR_MAP[TagColor.RED],
      });
      expect(yellowChip).toHaveStyle({
        borderColor: TAG_COLOR_MAP[TagColor.YELLOW],
        color: TAG_COLOR_MAP[TagColor.YELLOW],
      });
      expect(greenChip).toHaveStyle({
        borderColor: TAG_COLOR_MAP[TagColor.GREEN],
        color: TAG_COLOR_MAP[TagColor.GREEN],
      });
      expect(purpleChip).toHaveStyle({
        borderColor: TAG_COLOR_MAP[TagColor.PURPLE],
        color: TAG_COLOR_MAP[TagColor.PURPLE],
      });
      expect(orangeChip).toHaveStyle({
        borderColor: TAG_COLOR_MAP[TagColor.ORANGE],
        color: TAG_COLOR_MAP[TagColor.ORANGE],
      });
      expect(grayChip).toHaveStyle({
        borderColor: TAG_COLOR_MAP[TagColor.GRAY],
        color: TAG_COLOR_MAP[TagColor.GRAY],
      });
    });
  });

  describe('size props', () => {
    test('size="small"が正しく適用されること', () => {
      render(<TagChips tags={[mockTag]} size="small" />);

      const chip = screen.getByText('Important');
      expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-sizeSmall');
    });

    test('size="medium"が正しく適用されること', () => {
      render(<TagChips tags={[mockTag]} size="medium" />);

      const chip = screen.getByText('Important');
      expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-sizeMedium');
    });

    test('sizeが指定されない場合、デフォルトで"medium"が適用されること', () => {
      render(<TagChips tags={[mockTag]} />);

      const chip = screen.getByText('Important');
      expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-sizeMedium');
    });
  });

  describe('削除機能', () => {
    test('onDeleteが渡された場合、削除ボタンが表示されること', () => {
      const onDelete = vi.fn();
      render(<TagChips tags={[mockTag, mockTag2]} onDelete={onDelete} />);

      // 削除ボタンが表示されていることを確認
      const chips = screen.getAllByRole('button');
      expect(chips).toHaveLength(2);

      // 各チップに削除アイコンがあることを確認
      const importantChip = screen
        .getByText('Important')
        .closest('.MuiChip-root');
      const reviewChip = screen.getByText('Review').closest('.MuiChip-root');
      expect(
        importantChip?.querySelector('.MuiChip-deleteIcon')
      ).toBeInTheDocument();
      expect(
        reviewChip?.querySelector('.MuiChip-deleteIcon')
      ).toBeInTheDocument();
    });

    test('onDeleteが渡されていない場合、削除ボタンが表示されないこと', () => {
      render(<TagChips tags={[mockTag, mockTag2]} />);

      const importantChip = screen
        .getByText('Important')
        .closest('.MuiChip-root');
      const reviewChip = screen.getByText('Review').closest('.MuiChip-root');
      expect(
        importantChip?.querySelector('.MuiChip-deleteIcon')
      ).not.toBeInTheDocument();
      expect(
        reviewChip?.querySelector('.MuiChip-deleteIcon')
      ).not.toBeInTheDocument();
    });

    test('削除ボタンをクリックした時にonDeleteが正しいtagIdで呼び出されること', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();

      render(<TagChips tags={[mockTag, mockTag2]} onDelete={onDelete} />);

      const importantChip = screen
        .getByText('Important')
        .closest('.MuiChip-root');
      const reviewChip = screen.getByText('Review').closest('.MuiChip-root');

      // 最初のタグの削除ボタンをクリック
      const deleteButton1 = importantChip?.querySelector('.MuiChip-deleteIcon');
      await user.click(deleteButton1!);
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith('tag-001');

      // 2番目のタグの削除ボタンをクリック
      const deleteButton2 = reviewChip?.querySelector('.MuiChip-deleteIcon');
      await user.click(deleteButton2!);
      expect(onDelete).toHaveBeenCalledTimes(2);
      expect(onDelete).toHaveBeenCalledWith('tag-002');
    });
  });

  describe('最大表示数制限', () => {
    test('maxプロップが指定された場合、制限数だけ表示されること', () => {
      const manyTags = mockTagVariations.multiple(10);

      render(<TagChips tags={manyTags} max={5} />);

      // 最初の5つのタグが表示されていることを確認
      expect(screen.getByText('Tag 1')).toBeInTheDocument();
      expect(screen.getByText('Tag 2')).toBeInTheDocument();
      expect(screen.getByText('Tag 3')).toBeInTheDocument();
      expect(screen.getByText('Tag 4')).toBeInTheDocument();
      expect(screen.getByText('Tag 5')).toBeInTheDocument();

      // 6番目以降のタグは表示されていないことを確認
      expect(screen.queryByText('Tag 6')).not.toBeInTheDocument();
      expect(screen.queryByText('Tag 10')).not.toBeInTheDocument();
    });

    test('maxを超えた場合、残りの数が "+N" と表示されること', () => {
      const manyTags = mockTagVariations.multiple(10);

      render(<TagChips tags={manyTags} max={5} />);

      // 残りの5つを表す "+5" が表示されることを確認
      expect(screen.getByText('+5')).toBeInTheDocument();
    });

    test('maxが指定されていても、タグ数がmax以下の場合は全て表示されること', () => {
      const tags = mockTagVariations.multiple(3);

      render(<TagChips tags={tags} max={5} />);

      // 全てのタグが表示されることを確認
      expect(screen.getByText('Tag 1')).toBeInTheDocument();
      expect(screen.getByText('Tag 2')).toBeInTheDocument();
      expect(screen.getByText('Tag 3')).toBeInTheDocument();

      // "+N" は表示されないことを確認
      expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
    });

    test('maxが指定されていない場合、全てのタグが表示されること', () => {
      const manyTags = mockTagVariations.multiple(10);

      render(<TagChips tags={manyTags} />);

      // 全てのタグが表示されることを確認
      expect(screen.getByText('Tag 1')).toBeInTheDocument();
      expect(screen.getByText('Tag 10')).toBeInTheDocument();

      // "+N" は表示されないことを確認
      expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
    });

    test('"+N" チップはoutlinedスタイルで表示されること', () => {
      const manyTags = mockTagVariations.multiple(10);

      render(<TagChips tags={manyTags} max={5} />);

      const remainingChip = screen.getByText('+5');

      // "+5"チップがoutlinedスタイルであることを確認
      expect(remainingChip.closest('.MuiChip-root')).toHaveClass(
        'MuiChip-outlined'
      );
    });

    test('maxとsizeを組み合わせて使用できること', () => {
      const manyTags = mockTagVariations.multiple(10);

      render(<TagChips tags={manyTags} max={3} size="small" />);

      // 表示されているタグとremainingチップを取得
      const tag1 = screen.getByText('Tag 1');
      const tag2 = screen.getByText('Tag 2');
      const tag3 = screen.getByText('Tag 3');
      const remaining = screen.getByText('+7');

      // 全てのチップがsmallサイズであることを確認
      expect(tag1.closest('.MuiChip-root')).toHaveClass('MuiChip-sizeSmall');
      expect(tag2.closest('.MuiChip-root')).toHaveClass('MuiChip-sizeSmall');
      expect(tag3.closest('.MuiChip-root')).toHaveClass('MuiChip-sizeSmall');
      expect(remaining.closest('.MuiChip-root')).toHaveClass(
        'MuiChip-sizeSmall'
      );
    });
  });

  describe('クリック機能', () => {
    test('onClickが渡された場合、チップクリック時に呼び出されること', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(<TagChips tags={[mockTag, mockTag2]} onClick={onClick} />);

      const firstChip = screen.getByText('Important');
      await user.click(firstChip);

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledWith(mockTag);
    });

    test('onClickが渡された場合、正しいタグオブジェクトが渡されること', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(
        <TagChips tags={[mockTag, mockTag2, mockTag3]} onClick={onClick} />
      );

      // 2番目のタグをクリック
      const secondChip = screen.getByText('Review');
      await user.click(secondChip);

      expect(onClick).toHaveBeenCalledWith(mockTag2);

      // 3番目のタグをクリック
      const thirdChip = screen.getByText('Urgent');
      await user.click(thirdChip);

      expect(onClick).toHaveBeenCalledWith(mockTag3);
    });

    test('onClickが渡されていない場合、チップはクリックできないこと', () => {
      render(<TagChips tags={[mockTag]} />);

      const chip = screen.getByText('Important');

      // onClickが渡されていない場合、clickableクラスが付与されないことを確認
      expect(chip.closest('.MuiChip-root')).not.toHaveClass(
        'MuiChip-clickable'
      );
    });

    test('onClickとonDeleteが同時に指定された場合、両方が機能すること', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onDelete = vi.fn();

      render(
        <TagChips tags={[mockTag]} onClick={onClick} onDelete={onDelete} />
      );

      // チップ本体をクリック
      const chip = screen.getByText('Important');
      await user.click(chip);
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledWith(mockTag);

      // 削除ボタンをクリック
      const chipElement = screen
        .getByText('Important')
        .closest('.MuiChip-root');
      const deleteButton = chipElement?.querySelector('.MuiChip-deleteIcon');
      await user.click(deleteButton!);
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith('tag-001');
    });
  });

  describe('複合的なシナリオ', () => {
    test('maxとonDeleteとonClickを組み合わせて使用できること', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onDelete = vi.fn();
      const manyTags = mockTagVariations.multiple(10);

      render(
        <TagChips
          tags={manyTags}
          max={3}
          onClick={onClick}
          onDelete={onDelete}
        />
      );

      // 表示されているタグをクリック
      const firstChip = screen.getByText('Tag 1');
      await user.click(firstChip);
      expect(onClick).toHaveBeenCalledWith(manyTags[0]);

      // 削除ボタンをクリック
      const chipElement = screen.getByText('Tag 1').closest('.MuiChip-root');
      const deleteButton = chipElement?.querySelector('.MuiChip-deleteIcon');
      await user.click(deleteButton!);
      expect(onDelete).toHaveBeenCalledWith('tag-001');

      // "+7" チップが表示されていることを確認
      expect(screen.getByText('+7')).toBeInTheDocument();
    });

    test('全てのpropsを指定した場合、正しく動作すること', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onDelete = vi.fn();
      const manyTags = mockTagVariations.multiple(10);

      render(
        <TagChips
          tags={manyTags}
          size="small"
          max={5}
          onClick={onClick}
          onDelete={onDelete}
        />
      );

      // サイズが正しく適用されている
      const tag1 = screen.getByText('Tag 1');
      const tag5 = screen.getByText('Tag 5');
      const remaining = screen.getByText('+5');
      expect(tag1.closest('.MuiChip-root')).toHaveClass('MuiChip-sizeSmall');
      expect(tag5.closest('.MuiChip-root')).toHaveClass('MuiChip-sizeSmall');
      expect(remaining.closest('.MuiChip-root')).toHaveClass(
        'MuiChip-sizeSmall'
      );

      // maxによる制限が機能している
      expect(screen.getByText('+5')).toBeInTheDocument();

      // onClickが機能している
      const firstChip = screen.getByText('Tag 1');
      await user.click(firstChip);
      expect(onClick).toHaveBeenCalled();

      // onDeleteが機能している
      const chipElement = screen.getByText('Tag 1').closest('.MuiChip-root');
      const deleteButton = chipElement?.querySelector('.MuiChip-deleteIcon');
      expect(deleteButton).toBeInTheDocument();
      await user.click(deleteButton!);
      expect(onDelete).toHaveBeenCalled();
    });
  });
});
