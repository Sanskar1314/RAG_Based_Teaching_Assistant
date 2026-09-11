import './globals.css';

export const metadata = {
  title: 'SigmaLearn AI — Web Development Course Assistant',
  description: 'Get instant, AI-powered answers from the Sigma Web Development course. Ask about HTML, CSS, JavaScript, and more with precise video references.',
  keywords: ['web development', 'course assistant', 'AI tutor', 'HTML', 'CSS', 'JavaScript', 'Sigma'],
  openGraph: {
    title: 'SigmaLearn AI — Course Assistant',
    description: 'AI-powered answers from the Sigma Web Development course',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
