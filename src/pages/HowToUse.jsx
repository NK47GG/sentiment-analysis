import React from 'react';
import { Box, Typography, Paper, Container, Stack, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { CheckCircleOutline, TextFields, UploadFile } from '@mui/icons-material';

const SectionCard = ({ title, icon, steps }) => (
  <Paper 
    elevation={3} 
    sx={{
      p: { xs: 2, sm: 3, md: 4 },
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
      border: '1px solid',
      borderColor: 'rgba(255, 255, 255, 0.1)',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
      {icon}
      <Typography 
        variant="h4" 
        component="h2" 
        sx={{ ml: 2, fontWeight: 600, fontSize: { xs: '1.5rem', md: '2.125rem' } }}
      >
        {title}
      </Typography>
    </Box>
    <List sx={{ flexGrow: 1 }}>
      {steps.map((text, index) => (
        <ListItem key={index} sx={{ alignItems: 'flex-start', py: 1}}>
          <ListItemIcon sx={{ mt: 0.5, minWidth: 36 }}>
            <CheckCircleOutline color="success" />
          </ListItemIcon>
          <ListItemText 
            primary={text} 
            primaryTypographyProps={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
          />
        </ListItem>
      ))}
    </List>
  </Paper>
);

function HowToUse() {
  const singleTextSteps = [
    'Select the "Single Text" mode on the Analysis page.',
    'Choose your desired language (English or Indonesian). ',
    'Paste your text directly into the input field.',
    'Click the "Start Analysis" button.',
    'The result (Positive, Negative, or Neutral) will be displayed instantly on the right.'
  ];

  const bulkFileSteps = [
    'Select the "Upload File" mode.',
    'Click to select or drag and drop your CSV or Excel file.',
    'Optionally, expand "Advanced Settings" to customize the analysis. You can set the number of keywords, filter by sentiment, and define the N-gram range.',
    'Click the "Start Analysis" button to process the entire file.',
    'After the analysis is complete, a "Download Results (CSV)" button will appear. Click it to save your insights.',
  ];

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
      <Typography 
        variant="h2" 
        component="h1" 
        sx={{ 
          textAlign: 'center', 
          mb: { xs: 4, md: 6 }, 
          fontWeight: 700, 
          fontSize: { xs: '2.2rem', md: '3.75rem' }
        }}
      >
        How It Works
      </Typography>
      <Stack spacing={{ xs: 3, md: 4 }}>
        <SectionCard 
          title="Single Text Analysis"
          icon={<TextFields sx={{ fontSize: { xs: 32, md: 40 } }} color="primary" />}
          steps={singleTextSteps}
        />
        <SectionCard 
          title="Bulk File Upload"
          icon={<UploadFile sx={{ fontSize: { xs: 32, md: 40 } }} color="primary" />}
          steps={bulkFileSteps}
        />
      </Stack>
    </Container>
  );
}

export default HowToUse;
