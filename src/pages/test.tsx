// pages/test.tsx
import React from 'react';
import { Button, Card } from '@gravity-ui/uikit';

const TestPage = () => {
  return (
    <div>
        <h1>Test Page with Gravity UI Kit</h1>
      <Card>
        <h2>Welcome to the Test Page</h2>
        <p>This is a test page using Gravity UI Kit components.</p>
        <Button>
          Click Me
        </Button>
      </Card>
    </div>
  );
};

export default TestPage;
