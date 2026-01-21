import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Custom HTML template for Expo web
 * Injects global styles including accent-color override for Switch components
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        {/* Global styles for web */}
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}

const globalStyles = `
/* Override browser accent-color for checkboxes/switches to match brand */
input[type="checkbox"] {
  accent-color: #8B2252;
}

/* Ensure body takes full height */
html, body, #root {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* Prevent text selection on UI elements */
button, [role="button"] {
  -webkit-user-select: none;
  user-select: none;
}
`;
