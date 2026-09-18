import React from 'react';
import clsx from 'clsx';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import styles from './styles.module.css';

export default function BlogPostPdfButton() {
  const {isBlogPostPage} = useBlogPost();

  if (!isBlogPostPage) {
    return null;
  }

  return (
    <button
      type="button"
      className={clsx(styles.pdfButton, 'blog-post-pdf-button')}
      onClick={() => window.print()}>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        className={styles.pdfIcon}>
        <path
          fill="currentColor"
          d="M12 16.5l-5-5 1.41-1.41L11 12.67V3h2v9.67l2.59-2.58L17 11.5l-5 5zM5 18h14v2H5z"
        />
      </svg>
      PDFとして保存
    </button>
  );
}
