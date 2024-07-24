import React from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Ingredients: React.FC = () => {
  const { data, error } = useSWR('/api/ingredients', fetcher);

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h1>Ingredients</h1>
      <ul>
        {data.map((ingredient: { id: number; name: string }) => (
          <li key={ingredient.id}>{ingredient.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Ingredients;
