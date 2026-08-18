import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TagColor } from '@/domain/models/tag';

import { TagColorPicker } from '../TagColorPicker';

import type { TagColorPickerProps } from '../TagColorPicker';

describe('TagColorPicker', () => {
  const defaultProps: TagColorPickerProps = {
    value: TagColor.BLUE,
    onChange: vi.fn(),
  };

  const renderComponent = (props?: Partial<TagColorPickerProps>) => {
    return render(<TagColorPicker {...defaultProps} {...props} />);
  };

  describe('初期表示', () => {
    test('7色すべてのカラーボタンが表示されること', () => {
      renderComponent();

      // 全7色のボタンが存在することを確認
      expect(screen.getByTestId('color-blue')).toBeInTheDocument();
      expect(screen.getByTestId('color-red')).toBeInTheDocument();
      expect(screen.getByTestId('color-yellow')).toBeInTheDocument();
      expect(screen.getByTestId('color-green')).toBeInTheDocument();
      expect(screen.getByTestId('color-purple')).toBeInTheDocument();
      expect(screen.getByTestId('color-orange')).toBeInTheDocument();
      expect(screen.getByTestId('color-gray')).toBeInTheDocument();
    });

    test('選択された色のボタンがMui-selectedクラスを持つこと', () => {
      renderComponent({ value: TagColor.RED });

      const selectedButton = screen.getByTestId('color-red');
      const unselectedButton = screen.getByTestId('color-blue');

      // 選択された色のボタンにMui-selectedクラスが付与されていることを確認
      expect(selectedButton).toHaveClass('Mui-selected');
      // 選択されていない色のボタンにはMui-selectedクラスがないことを確認
      expect(unselectedButton).not.toHaveClass('Mui-selected');
    });

    test('各色のボタンに適切なaria-labelが設定されていること', () => {
      renderComponent();

      expect(screen.getByLabelText('blue')).toBeInTheDocument();
      expect(screen.getByLabelText('red')).toBeInTheDocument();
      expect(screen.getByLabelText('yellow')).toBeInTheDocument();
      expect(screen.getByLabelText('green')).toBeInTheDocument();
      expect(screen.getByLabelText('purple')).toBeInTheDocument();
      expect(screen.getByLabelText('orange')).toBeInTheDocument();
      expect(screen.getByLabelText('gray')).toBeInTheDocument();
    });

    test('labelが指定された場合、ラベルが表示されること', () => {
      renderComponent({ label: 'タグの色' });

      expect(screen.getByText('タグの色')).toBeInTheDocument();
    });

    test('labelが指定されない場合、ラベルが表示されないこと', () => {
      renderComponent();

      // FormLabelが存在しないことを確認
      // legendタグが存在しないことを確認
      expect(screen.queryByRole('group', { name: '' })).toBeInTheDocument();
      const container = screen.getByTestId('color-blue').closest('fieldset');
      const formLabel = container?.querySelector('legend');
      expect(formLabel).not.toBeInTheDocument();
    });

    test('data-testidが指定された場合、適切に設定されること', () => {
      renderComponent({ 'data-testid': 'custom-color-picker' });

      expect(screen.getByTestId('custom-color-picker')).toBeInTheDocument();
    });
  });

  describe('ユーザー操作', () => {
    test('色を選択するとonChangeが正しい色で呼び出されること', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      renderComponent({ value: TagColor.BLUE, onChange });

      // 赤色のボタンをクリック
      const redButton = screen.getByTestId('color-red');
      await user.click(redButton);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(TagColor.RED);
    });

    test('各色のボタンをクリックすると適切な色でonChangeが呼ばれること', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      renderComponent({ value: TagColor.BLUE, onChange });

      // 青色ボタン(現在選択中)をクリック
      await user.click(screen.getByTestId('color-blue'));
      expect(onChange).toHaveBeenCalledTimes(0);

      // 赤色ボタンをクリック
      await user.click(screen.getByTestId('color-red'));
      expect(onChange).toHaveBeenCalledWith(TagColor.RED);

      // 黄色ボタンをクリック
      onChange.mockClear();
      await user.click(screen.getByTestId('color-yellow'));
      expect(onChange).toHaveBeenCalledWith(TagColor.YELLOW);

      // 緑色ボタンをクリック
      onChange.mockClear();
      await user.click(screen.getByTestId('color-green'));
      expect(onChange).toHaveBeenCalledWith(TagColor.GREEN);

      // 紫色ボタンをクリック
      onChange.mockClear();
      await user.click(screen.getByTestId('color-purple'));
      expect(onChange).toHaveBeenCalledWith(TagColor.PURPLE);

      // オレンジ色ボタンをクリック
      onChange.mockClear();
      await user.click(screen.getByTestId('color-orange'));
      expect(onChange).toHaveBeenCalledWith(TagColor.ORANGE);

      // グレー色ボタンをクリック
      onChange.mockClear();
      await user.click(screen.getByTestId('color-gray'));
      expect(onChange).toHaveBeenCalledWith(TagColor.GRAY);
    });

    test('同じ色を再度クリックしてもonChangeが呼ばれないこと', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      renderComponent({ value: TagColor.RED, onChange });

      // 現在選択されている赤色のボタンをクリック
      const redButton = screen.getByTestId('color-red');
      await user.click(redButton);

      // onChangeが呼ばれないことを確認
      expect(onChange).not.toHaveBeenCalled();
    });

    test('異なる色を連続してクリックすると、それぞれでonChangeが呼ばれること', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      renderComponent({ value: TagColor.BLUE, onChange });

      // 赤色をクリック
      await user.click(screen.getByTestId('color-red'));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(TagColor.RED);

      // 黄色をクリック
      await user.click(screen.getByTestId('color-yellow'));
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenLastCalledWith(TagColor.YELLOW);

      // 緑色をクリック
      await user.click(screen.getByTestId('color-green'));
      expect(onChange).toHaveBeenCalledTimes(3);
      expect(onChange).toHaveBeenLastCalledWith(TagColor.GREEN);
    });
  });

  describe('アクセシビリティ', () => {
    test('ToggleButtonGroupに適切なaria-labelが設定されていること', () => {
      renderComponent();

      // ToggleButtonGroupのaria-labelを確認
      const toggleButtonGroup = screen.getByRole('group', {
        name: 'tag color',
      });
      expect(toggleButtonGroup).toHaveAttribute('aria-label', 'tag color');
    });

    test('各ボタンがbutton roleを持つこと', () => {
      renderComponent();

      // 全てのトグルボタンを取得
      const buttons = screen.getAllByRole('button');

      // 7つのボタンが存在することを確認
      expect(buttons).toHaveLength(7);
    });

    test('FormControlがfieldset roleを持つこと', () => {
      renderComponent({ label: 'タグの色' });

      // FormControlがfieldset roleを持つことを確認
      const container = screen.getByTestId('color-blue').closest('fieldset');
      expect(container).toBeInTheDocument();
    });
  });

  describe('カラーバリエーション', () => {
    test('各色のプレビューボックスが正しく表示されること', () => {
      renderComponent();

      // 各色のボタンを取得し、内部のBoxが存在することを確認
      const blueButton = screen.getByTestId('color-blue');
      const redButton = screen.getByTestId('color-red');
      const yellowButton = screen.getByTestId('color-yellow');
      const greenButton = screen.getByTestId('color-green');
      const purpleButton = screen.getByTestId('color-purple');
      const orangeButton = screen.getByTestId('color-orange');
      const grayButton = screen.getByTestId('color-gray');

      // 各ボタンが子要素(カラープレビューボックス)を持つことを確認
      expect(blueButton.children).toHaveLength(1);
      expect(redButton.children).toHaveLength(1);
      expect(yellowButton.children).toHaveLength(1);
      expect(greenButton.children).toHaveLength(1);
      expect(purpleButton.children).toHaveLength(1);
      expect(orangeButton.children).toHaveLength(1);
      expect(grayButton.children).toHaveLength(1);
    });
  });

  describe('複合的なシナリオ', () => {
    test('labelとdata-testidを同時に指定した場合、両方が正しく動作すること', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      renderComponent({
        label: 'カラー選択',
        'data-testid': 'tag-color-picker',
        onChange,
      });

      // labelが表示されている
      expect(screen.getByText('カラー選択')).toBeInTheDocument();

      // data-testidが設定されている
      expect(screen.getByTestId('tag-color-picker')).toBeInTheDocument();

      // 色の選択が機能している
      await user.click(screen.getByTestId('color-green'));
      expect(onChange).toHaveBeenCalledWith(TagColor.GREEN);
    });

    test('初期値が異なる色の場合でも正しく動作すること', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      // 緑色を初期値として設定
      renderComponent({ value: TagColor.GREEN, onChange });

      // 緑色のボタンが選択されていることを確認
      expect(screen.getByTestId('color-green')).toHaveClass('Mui-selected');

      // 別の色を選択
      await user.click(screen.getByTestId('color-purple'));
      expect(onChange).toHaveBeenCalledWith(TagColor.PURPLE);
    });
  });
});
