import { SxProps, TextField } from "@mui/material";

type Props = {
  onChange: (e: any) => void;
  value: number;
  min?: number;
  max?: number;
  label?: string;
  sx?: SxProps;
};

function NumberField(props: Props) {
  return (
    <TextField
      label={props.label}
      type="number"
      variant="outlined"
      onChange={props.onChange}
      onKeyUp={(e: any) => {
        const charCode = e.which ? e.which : e.keyCode;
        if (charCode < 48 || charCode > 57) {
          e.preventDefault();
        }
      }}
      value={props.value}
      slotProps={{
        input: {
          inputProps: {
            min: 1,
            max: 20,
            pattern: "[0-9]*",
            inputMode: "numeric",
            maxLength: 2
          },
        },
      }}
      sx={props.sx}
    />
  );
}

export default NumberField;
