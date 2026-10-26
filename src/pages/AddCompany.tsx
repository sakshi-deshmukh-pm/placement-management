
import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Typography,
} from "@mui/material";
import { Formik, Form } from "formik";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import FormikTextField from "../components/forms/FormikTextField";

interface CompanyFormValues {
    name: string;
    website: string;
    industry: string;
    location: string;
}

const initialValues: CompanyFormValues = {
    name: "",
    website: "",
    industry: "",
    location: "",
};

export default function AddCompany() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    return (
        <Box sx={{ maxWidth: 800, mx: "auto", p: { xs: 2, sm: 3 } }}>
            <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#173b72", mb: 1 }}
            >
                Add Company
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 3 }}>
                Add a company to the placement portal for future recruitment drives.
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert
                    severity="success"
                    sx={{ mb: 2 }}
                    onClose={() => setSuccess("")}
                >
                    {success}
                </Alert>
            )}

            <Card elevation={0} sx={{ border: "1px solid #e3e9f2", borderRadius: 3 }}>
                <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
                    <Formik<CompanyFormValues>
                        initialValues={initialValues}
                        onSubmit={async (values, { setSubmitting, resetForm }) => {
                            setError("");
                            setSuccess("");

                            try {
                                await axiosInstance.post("/companies", {
                                    name: values.name.trim(),
                                    website: values.website.trim()
                                        ? /^https?:\/\//i.test(values.website.trim())
                                            ? values.website.trim()
                                            : `https://${values.website.trim()}`
                                        : "",
                                    industry: values.industry.trim(),
                                    location: values.location.trim(),
                                });

                                resetForm();
                                setSuccess("Company added successfully.");
                            } catch (err) {
                                const e = err as {
                                    response?: {
                                        data?: { message?: string; errors?: unknown };
                                    };
                                    message?: string;
                                };

                                setError(
                                    e.response?.data?.message ||
                                    e.message ||
                                    "Failed to add company."
                                );
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                                    <FormikTextField
                                        name="name"
                                        label="Company Name"
                                        placeholder="e.g. Tech Solutions"
                                        required
                                        disabled={isSubmitting}
                                    />

                                    <FormikTextField
                                        name="website"
                                        label="Website"
                                        placeholder="https://example.com"
                                        disabled={isSubmitting}
                                    />

                                    <FormikTextField
                                        name="industry"
                                        label="Industry"
                                        placeholder="e.g. Information Technology"
                                        disabled={isSubmitting}
                                    />

                                    <FormikTextField
                                        name="location"
                                        label="Location"
                                        placeholder="e.g. Pune, Maharashtra"
                                        disabled={isSubmitting}
                                    />

                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            flexWrap: "wrap",
                                            gap: 1.5,
                                            mt: 1,
                                        }}
                                    >
                                        <Button
                                            variant="outlined"
                                            onClick={() => navigate(-1)}
                                            disabled={isSubmitting}
                                        >
                                            Back
                                        </Button>

                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={isSubmitting}
                                            sx={{ minWidth: 140 }}
                                        >
                                            {isSubmitting ? (
                                                <CircularProgress size={22} color="inherit" />
                                            ) : (
                                                "Save Company"
                                            )}
                                        </Button>
                                    </Box>
                                </Box>
                            </Form>
                        )}
                    </Formik>
                </CardContent>
            </Card>
        </Box>
    );
}