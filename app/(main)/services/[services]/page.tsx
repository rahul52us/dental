import { Box } from '@chakra-ui/react';
import React from 'react';
import IndividualServicePage from '../../individualService/component/IndividualServicePage';
import serviceData from '../../individualService/component/utils/constant';

export async function generateMetadata({ params }: any) {
  const { services } = await params;

  const {metData} = serviceData[services];

  if (!metData) {
    return {
      title: 'Mental Health Clinic In Noida | Best Psychologist In Noida | Metamind',
      description: 'Mental Health Clinic In Noida | Best Psychologist In Noida | Metamind',
    };
  }

  return {
    title: metData.title,
    description: metData.description,
    openGraph: {
      title: metData.title,
      description: metData.description,
      url: `https://www.metamindhealth.com/services/${services}`,
      siteName: 'Metamind Health',
      images: [
        {
          url: 'https://www.metamindhealth.com/images/logo.png',
          width: 1200,
          height: 630,
          alt: metData.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metData.title,
      description: metData.description,
      images: ['https://www.metamindhealth.com/images/logo.png'],
    },
  };
}

export default function Page() {
  return (
    <Box>
      <IndividualServicePage />
    </Box>
  );
}
