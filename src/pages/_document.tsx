import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" type="image/png" sizes="64x64" href="/batchvault-icon-64.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <meta name="description" content="BatchVault - Food production management for recipes, batches, orders and profit." />
          
          {/* Preload auth context to prevent errors during SSR */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Initialize auth context to prevent errors during SSR
                window.__INITIAL_AUTH_STATE__ = {
                  isAuthenticated: false,
                  user: null,
                  token: null
                };
                
                // Prevent auth errors during static generation
                if (typeof window !== 'undefined' && !window.React) {
                  window.React = { createElement: function() { return null; } };
                }
              `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
