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
          <link rel="icon" href="/favicon.ico" />
          <meta name="description" content="JerkyVault - Jerky Management System" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          
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
