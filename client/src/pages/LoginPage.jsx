import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextField, Button, Box, Typography, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Required"),
      password: Yup.string().required("Required"),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
  try {
    const res = await axios.post("/api/auth/login", values);
    localStorage.setItem("token", res.data.token);
    // Use values.email if you want to pass the entered email
    navigate("/landing", { state: { email: values.email } });
    // Or, if your API returns the email: navigate("/landing", { state: { email: res.data.email } });
  } catch (err) {
    setErrors({ email: "Invalid email or password" });
  } finally {
    setSubmitting(false);
  }
},
  });

  return (
    <Box maxWidth={400} mx="auto" mt={8} p={3} boxShadow={3} borderRadius={2}>
      <Typography variant="h5" mb={2}>Login</Typography>
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
        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          disabled={formik.isSubmitting}
          sx={{ mt: 2 }}
        >
          Login
        </Button>
      </form>
      <Box mt={2}>
        <Typography variant="body2">
          Don't have an account?{" "}
          <Link component="button" onClick={() => navigate("/register")}>
            Register
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;