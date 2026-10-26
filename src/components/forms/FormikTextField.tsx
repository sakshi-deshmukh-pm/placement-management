import { InputAdornment, TextField } from "@mui/material";
import type { ReactNode } from "react";
import { useField } from "formik";

interface FormikTextFieldProps {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  autoComplete?: string;
  helperText?: string;
  endAdornment?: ReactNode;
  minLength?: number;
}

const FormikTextField = ({
  name,
  label,
  type = "text",
  required = false,
  multiline = false,
  rows = 1,
  disabled = false,
  fullWidth = true,
  placeholder,
  autoComplete,
  helperText,
  endAdornment,
  minLength,
}: FormikTextFieldProps) => {
  const [field, meta] = useField(name);
  const showError = Boolean(meta.touched && meta.error);

  return (
    <TextField
      {...field}
      name={name}
      label={label}
      type={type}
      required={required}
      multiline={multiline}
      rows={multiline ? rows : undefined}
      disabled={disabled}
      fullWidth={fullWidth}
      placeholder={placeholder}
      autoComplete={autoComplete}
      error={showError}
      helperText={showError ? meta.error : helperText || " "}
      slotProps={{
        htmlInput: {
          minLength,
        },
        input: {
          endAdornment: endAdornment ? (
            <InputAdornment position="end">
              {endAdornment}
            </InputAdornment>
          ) : undefined,
        },
      }}
    />
  );
};

export default FormikTextField;