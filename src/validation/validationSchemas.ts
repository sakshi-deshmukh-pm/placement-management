
import * as Yup from "yup";

export const registerValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Name is required"),

  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required"),

  password: Yup.string()
    .min(8, "Password must contain at least 8 characters")
    .required("Password is required"),

  rollNumber: Yup.string()
    .trim()
    .required("Roll number is required"),

  branch: Yup.string()
    .trim()
    .required("Branch is required"),

  year: Yup.string()
    .trim()
    .required("Academic year is required"),
});


export const companyValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Company name is required"),

  website: Yup.string()
    .trim()
    .url("Enter a valid website URL")
    .required("Website is required"),

  industry: Yup.string()
    .trim()
    .required("Industry is required"),

  location: Yup.string()
    .trim()
    .required("Location is required"),
});

export const placementDriveValidationSchema = Yup.object({
  role: Yup.string()
    .trim()
    .required("Job role is required"),

  package: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .typeError("Package must be a valid number")
    .positive("Package must be greater than zero")
    .required("Package is required"),

  eligibilityCriteria: Yup.string()
    .trim()
    .required("Eligibility criteria is required"),

  deadline: Yup.string()
    .required("Application deadline is required")
    .test(
      "valid-date",
      "Enter a valid deadline",
      (value) => !value || !Number.isNaN(Date.parse(value))
    ),

  companyId: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .integer("Select a valid company")
    .positive("Please select a company")
    .required("Company is required"),
});


export const interviewValidationSchema = Yup.object({
  applicationId: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .typeError("Application ID must be a number")
    .integer("Application ID must be a whole number")
    .positive("Enter a valid application ID")
    .required("Application ID is required"),

  round: Yup.string()
    .trim()
    .required("Interview round is required"),

  scheduledAt: Yup.string()
    .required("Interview date and time is required")
    .test(
      "valid-date",
      "Enter a valid date and time",
      (value) => Boolean(value && !Number.isNaN(Date.parse(value)))
    ),

  mode: Yup.string()
    .oneOf(["ONLINE", "OFFLINE", "PHONE"], "Select a valid interview mode")
    .required("Interview mode is required"),

  meetingLink: Yup.string().when("mode", {
    is: "ONLINE",
    then: (schema) =>
      schema
        .trim()
        .required("Meeting link is required for online interviews")
        .url("Enter a valid meeting URL"),
    otherwise: (schema) =>
      schema
        .trim()
        .nullable()
        .test(
          "valid-optional-url",
          "Enter a valid meeting URL",
          (value) => !value || value === "" || schema.isValidSync(value)
        ),
  }),

  status: Yup.string().oneOf([
    "SCHEDULED",
    "COMPLETED",
    "CANCELLED",
  ]),

  feedback: Yup.string().max(
    2000,
    "Feedback cannot exceed 2000 characters"
  ),
});

