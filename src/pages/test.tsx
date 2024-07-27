import { useEffect } from 'react';
import { getSession } from 'next-auth/react';

const TestComponent = () => {
  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      console.log('Session:', session);
    };

    fetchSession();
  }, []);

  return <div>Check console for session info</div>;
};

export default TestComponent;
