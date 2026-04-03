import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, image, type = 'website', url }) {
  const siteName = 'BlogBoi';
  const defaultTitle = 'BlogBoi | Dive into thoughts';
  const defaultDescription = 'A platform to share thoughts, write articles, and connect with other writers.';
  const defaultImage = 'https://blogboi.fun/logo.png'; // Will use a default if no image exists
  
  const seoTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoImage = image || defaultImage;
  const seoUrl = url || 'https://blogboi.fun';

  // Truncate description for meta tag (approx max character limit 160)
  const cleanDescription = seoDescription.length > 155 
    ? seoDescription.substring(0, 155) + '...' 
    : seoDescription;

  // Clean HTML from content if occasionally passed
  const strippedDescription = cleanDescription.replace(/<[^>]+>/g, '');

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={strippedDescription} />
      <meta name="author" content="Abhishek" />
      <link rel="author" href="https://github.com/Abhishekkr206" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={strippedDescription} />
      <meta property="og:image" content={seoImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={seoUrl} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={strippedDescription} />
      <meta name="twitter:image" content={seoImage} />
    </Helmet>
  );
}
