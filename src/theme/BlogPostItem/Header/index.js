import React from 'react';
import Header from '@theme-original/BlogPostItem/Header';
import BlogPostPdfButton from '@site/src/components/BlogPostPdfButton';

export default function HeaderWrapper(props) {
  return (
    <>
      <Header {...props} />
      <BlogPostPdfButton />
    </>
  );
}
