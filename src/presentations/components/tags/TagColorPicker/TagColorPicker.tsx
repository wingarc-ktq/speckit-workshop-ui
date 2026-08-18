import React from 'react';

import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import type { TagColor } from '@/domain/models/tag';

import { TAG_COLOR_MAP } from '../constants';

export interface TagColorPickerProps {
  value: TagColor;
  onChange: (color: TagColor) => void;
  label?: string;
  'data-testid'?: string;
}

export const TagColorPicker: React.FC<TagColorPickerProps> = ({
  value,
  onChange,
  label,
  'data-testid': dataTestId,
}) => {
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newColor: TagColor | null
  ) => {
    if (newColor !== null) onChange(newColor);
  };

  return (
    <FormControl component="fieldset" data-testid={dataTestId}>
      {label && <FormLabel component="legend">{label}</FormLabel>}
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        aria-label="tag color"
      >
        {Object.entries(TAG_COLOR_MAP).map(([color, colorCode]) => (
          <ToggleButton
            key={color}
            value={color}
            aria-label={color}
            data-testid={`color-${color}`}
            size="medium"
          >
            <LocalOfferIcon
              fontSize="medium"
              sx={{
                color: colorCode,
              }}
            />
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </FormControl>
  );
};
