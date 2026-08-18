import Autocomplete, {
  type AutocompleteProps,
} from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useTranslation } from 'react-i18next';

import type { Tag } from '@/domain/models/tag';
import { tKeys } from '@/i18n';

type TagSelectorProps = Omit<
  AutocompleteProps<Tag, true, false, false>,
  'renderInput' | 'multiple' | 'onChange'
> & {
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  onChange: (tags: Tag[]) => void;
};

export const TagSelector = ({
  label,
  placeholder,
  error,
  required = false,
  size = 'medium',
  onChange,
  ...autocompleteProps
}: TagSelectorProps) => {
  const { t } = useTranslation();

  return (
    <Autocomplete
      {...autocompleteProps}
      multiple
      size={size}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      onChange={(_event, value) => onChange(value)}
      noOptionsText={t(tKeys.components.tagSelector.noOptions)}
      loadingText={t(tKeys.components.tagSelector.loading)}
      clearText={t(tKeys.components.tagSelector.clear)}
      closeText={t(tKeys.components.tagSelector.close)}
      openText={t(tKeys.components.tagSelector.open)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label ?? t(tKeys.components.tagSelector.label)}
          placeholder={
            placeholder ?? t(tKeys.components.tagSelector.placeholder)
          }
          error={!!error}
          helperText={error}
          required={required}
        />
      )}
    />
  );
};
