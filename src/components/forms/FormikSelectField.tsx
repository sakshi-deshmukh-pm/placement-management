
import { TextField, MenuItem } from "@mui/material";
import { useField } from "formik";

interface SelectOption {
  label: string;
  value: string | number;
}

interface FormikSelectFieldProps {
  name: string;
  label: string;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const FormikSelectField = ({
  name,
  label,
  options,
  required = false,
  disabled = false,
  fullWidth = true,
}: FormikSelectFieldProps) => {
  const [field, meta] = useField(name);

  const showError = Boolean(meta.touched && meta.error);

  return (
    <TextField
      {...field}
      select
      name={name}
      label={label}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      error={showError}
      helperText={showError ? meta.error : " "}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default FormikSelectField;
