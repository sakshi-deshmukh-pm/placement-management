
import { TextField } from "@mui/material";
import { useField } from "formik";

interface FormikDateFieldProps {
  name: string;
  label: string;
  type?: "date" | "datetime-local";
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  min?: string;
}

export default function FormikDateField({
  name,
  label,
  type = "date",
  required = false,
  disabled = false,
  fullWidth = true,
  min,
}: FormikDateFieldProps) {
  const [field, meta] = useField(name);
  const showError = Boolean(meta.touched && meta.error);

  return (
    <TextField
      {...field}
      type={type}
      label={label}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      error={showError}
      helperText={showError ? meta.error : " "}
      slotProps={{
        inputLabel: { shrink: true },
        htmlInput: { min },
      }}
    />
  );
}
