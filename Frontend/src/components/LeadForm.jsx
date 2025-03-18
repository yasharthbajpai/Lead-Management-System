import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  source: yup.string().required('Source is required'),
  initialMessage: yup.string(),
});

const sourceOptions = [
  { value: 'web_form', label: 'Web Form' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'other', label: 'Other' }
];

export default function LeadForm({ lead, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: lead?.name || '',
      email: lead?.email || '',
      phone: lead?.phone || '',
      source: lead?.source || 'web_form',
      initialMessage: lead?.initialMessage || '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
        formik.resetForm();
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (lead) {
      formik.setValues({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        source: lead.source || 'web_form',
        initialMessage: lead.initialMessage || '',
      });
    }
  }, [lead]);

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Full Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email Address"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="phone"
            name="phone"
            label="Phone Number"
            value={formik.values.phone}
            onChange={formik.handleChange}
            error={formik.touched.phone && Boolean(formik.errors.phone)}
            helperText={formik.touched.phone && formik.errors.phone}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth error={formik.touched.source && Boolean(formik.errors.source)}>
            <InputLabel id="source-label">Lead Source</InputLabel>
            <Select
              labelId="source-label"
              id="source"
              name="source"
              value={formik.values.source}
              label="Lead Source"
              onChange={formik.handleChange}
            >
              {sourceOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.source && formik.errors.source && (
              <FormHelperText>{formik.errors.source}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="initialMessage"
            name="initialMessage"
            label="Initial Message/Note"
            multiline
            rows={4}
            value={formik.values.initialMessage}
            onChange={formik.handleChange}
            error={formik.touched.initialMessage && Boolean(formik.errors.initialMessage)}
            helperText={formik.touched.initialMessage && formik.errors.initialMessage}
          />
        </Grid>
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {lead ? 'Update Lead' : 'Create Lead'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
} 