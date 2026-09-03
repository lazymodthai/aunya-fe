import { SxProps, TextField } from "@mui/material";

type Props = {
  onChange: (e: any) => void;
  onBlur?: (e: any) => void;
  value: number | null;
  min?: number;
  max?: number;
  label?: string;
  sx?: SxProps;
  disabled?: boolean;
};

function NumberField(props: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits 0-9
    const cleaned = e.target.value.replace(/\D/g, '');
    e.target.value = cleaned;
    props.onChange(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent typing exponents, decimals, plus/minus
    if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
      e.preventDefault();
    }
  };

  const displayVal =
    props.value === null || props.value === undefined || isNaN(Number(props.value))
      ? ''
      : props.value;

  return (
    <TextField
      label={props.label}
      type="tel"
      variant="outlined"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={props.onBlur}
      value={displayVal}
      slotProps={{
        input: {
          sx: {
            borderRadius: 3,
            '& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button': {
              WebkitAppearance: 'none',
              margin: 0,
            },
            '& input[type=number]': {
              MozAppearance: 'textfield',
            },
          },
          inputProps: {
            min: props.min || 0,
            max: props.max || 20,
            pattern: '[0-9]*',
            inputMode: 'numeric',
            maxLength: 2,
          },
        },
      }}
      sx={props.sx}
      disabled={props.disabled}
    />
  );
}

export default NumberField;
