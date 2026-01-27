import { TextField, Typography, TextFieldProps } from '@mui/material';
import { formatPriceValue, parsePriceValue } from '@utils/input';

type PriceFieldProps = Omit<TextFieldProps, 'value' | 'onChange'> & {
  value: number;
  onChange: (value: number) => void;
};

function PriceField({ value, onChange, ...rest }: PriceFieldProps) {
  const displayValue = value ? formatPriceValue(value) : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = parsePriceValue(raw);
    onChange(parsed);
  };

  return (
    <TextField
      {...rest}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      InputProps={{
        startAdornment: <Typography sx={{ mr: 1 }}>฿</Typography>,
        ...rest.InputProps,
      }}
    />
  );
}

export default PriceField;
