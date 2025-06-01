import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextField, Button, Box, Typography, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterPage = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { email: "", password: "", confirmPassword: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Required"),
      password: Yup.string().min(6, "Minimum 6 characters").required("Required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Required"),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        // Replace with your backend endpoint
        await axios.post("/api/auth/register", {
          email: values.email,
          password: values.password,
        });
        navigate("/login");
      } catch (err) {
        setErrors({ email: "Registration failed. Try another email." });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box maxWidth={400} mx="auto" mt={8} p={3} boxShadow={3} borderRadius={2}>
      <Typography variant="h5" mb={2}>Register</Typography>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          name="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Password"
          type="password"
          name="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
          helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
        />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          disabled={formik.isSubmitting}
          sx={{ mt: 2 }}
        >
          Register
        </Button>
      </form>
      <Box mt={2}>
        <Typography variant="body2">
          Already have an account?{" "}
          <Link component="button" onClick={() => navigate("/login")}>
            Login
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterPage;