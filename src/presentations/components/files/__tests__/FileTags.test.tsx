import { render, screen } from '@testing-library/react';

import { FileTags } from '../FileTags';

describe('FileTags', () => {
  test('タグIDに対応するタグ名を同じChip形式で表示すること', () => {
    const { container } = render(<FileTags tagIds={['tag-1', 'tag-2']} />);

    expect(screen.getByText('完了')).toBeInTheDocument();
    expect(screen.getByText('契約書')).toBeInTheDocument();
    expect(container.querySelectorAll('.MuiChip-root')).toHaveLength(2);
  });

  test('タグがない場合はChipを表示しないこと', () => {
    const { container } = render(<FileTags />);

    expect(container.querySelectorAll('.MuiChip-root')).toHaveLength(0);
  });

  test('未知のタグIDでもタグIDを表示できること', () => {
    render(<FileTags tagIds={['unknown-tag']} />);

    expect(screen.getByText('unknown-tag')).toBeInTheDocument();
  });
});