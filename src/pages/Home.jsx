import React from 'react';
import { Button, Typography, Box, Grid, Card, CardContent, Container, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Link } from 'react-router-dom';
import { Insights, UploadFile, AutoAwesome, ExpandMore } from '@mui/icons-material';

const FeatureCard = ({ icon, title, description }) => (
  <Card sx={{
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: '0 16px 35px rgba(0, 0, 0, 0.3)',
    }
  }}>
    <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ color: 'primary.main', lineHeight: 1, fontSize: { xs: '3rem', md: '3.5rem' }, mb: 2 }}>{icon}</Box>
      <Typography variant={{ xs: 'h6', md: 'h5' }} component="div" sx={{ mb: 1.5, fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const faqs = [
  {
    question: 'What is Sentiment Analysis AI?',
    answer: 'It is an intelligent tool designed to analyze and interpret emotions and opinions from text data. It helps organizations understand feedback from customers, donors, or any community to make data-driven decisions.',
  },
  {
    question: 'Who can benefit from this tool?',
    answer: 'Both for-profit businesses and non-profit organizations can benefit. Businesses can track brand perception and customer satisfaction, while non-profits can gauge public opinion, donor sentiment, or community feedback on social issues.',
  },
  {
    question: 'What kind of data can I analyze?',
    answer: 'You can analyze single pieces of text, like a social media comment, or upload a file (CSV/Excel) containing thousands of comments for bulk analysis. The file must contain a column named "komentar".',
  },
  {
    question: 'Is the analysis available in multiple languages?',
    answer: 'Yes, our tool currently supports both English and Indonesian, allowing you to analyze feedback from a diverse range of sources.'
  }
];

function Home() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ textAlign: 'center', my: { xs: 4, md: 8 } }}>
        <Typography component="h1" variant="h1" sx={{
          mb: 2, 
          fontWeight: 700,
          fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
          background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Unlock Actionable Insights
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{
           maxWidth: '750px', mx: 'auto', mb: 4,
           fontSize: { xs: '1rem', sm: '1.25rem' }
        }}>
          Transform raw feedback from customers, donors, or your community into clear, actionable sentiment data. A powerful tool for both for-profit and non-profit organizations.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/analysis"
          sx={{
            py: { xs: 1, md: 1.5 },
            px: { xs: 4, md: 5 },
            fontSize: { xs: '1rem', md: '1.1rem' },
            boxShadow: '0 0 15px 3px rgba(66, 165, 245, 0.7)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 0 25px 8px rgba(66, 164, 245, 0)',
            }
          }}
        >
          Get Started
        </Button>
      </Box>

      <Grid container spacing={{ xs: 2, md: 4}} alignItems="stretch" justifyContent="center" sx={{ mb: { xs: 6, md: 10 } }}> 
        <Grid item xs={12} sm={6} md={4}>
          <FeatureCard
            icon={<Insights sx={{ fontSize: 'inherit' }} />}
            title="Deep Sentiment Analysis"
            description="Go beyond simple positive or negative. Understand the nuances in your text data with our advanced AI."
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FeatureCard
            icon={<UploadFile sx={{ fontSize: 'inherit' }} />}
            title="Bulk Data Processing"
            description="Effortlessly analyze volumes of feedback by uploading CSV or Excel files. Save time and scale your insights."
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FeatureCard
            icon={<AutoAwesome sx={{ fontSize: 'inherit' }} />}
            title="AI-Powered Visualizations"
            description="Instantly visualize sentiment trends and keyword frequencies. Make data-driven decisions with confidence."
          />
        </Grid>
      </Grid>

      <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
        <Typography variant="h3" sx={{ textAlign: 'center', mb: 4, fontWeight: 600, fontSize: { xs: '1.8rem', md: '3rem' } }}>
          Frequently Asked Questions
        </Typography>
        {faqs.map((faq, index) => (
          <Accordion key={index} sx={{ 
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            mb: 1.5,
            '&:before': { display: 'none' } 
          }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem'} }}>{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
}

export default Home;
