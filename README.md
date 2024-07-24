# Jerky Vault

Jerky Vault is a comprehensive web application designed to manage and track recipes, ingredients, and cooking sessions for making delicious jerky. The application includes user authentication, recipe management, ingredient tracking, and detailed cost calculation for each recipe.

## Table of Contents

- [Jerky Vault](#jerky-vault)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#usage)
  - [Authentication](#authentication)
  - [Recipes](#recipes)
  - [Ingredients](#ingredients)
  - [Cooking Sessions](#cooking-sessions)
  - [API Endpoints](#api-endpoints)
    - [Recipes:](#recipes-1)
    - [Ingredients:](#ingredients-1)
    - [Cooking Sessions:](#cooking-sessions-1)
  - [Database Schema](#database-schema)
  - [Contributing](#contributing)
  - [License](#license)

## Features

- **User Authentication**: Secure user registration and login functionality.
- **Recipe Management**: Create, view, update, and delete recipes.
- **Ingredient Management**: Add, view, and manage ingredients and their prices.
- **Cost Calculation**: Automatic cost calculation for recipes based on ingredient prices.
- **Cooking Sessions**: Track and manage cooking sessions, including yield and cost.

## Installation

To set up the project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/jerky-vault.git
   cd jerky-vault
    ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up environment variables**:
   Create a .env file in the root directory and add the necessary environment variables (see below).
4. **Run the development server**:
    ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

    
    DATABASE_HOST=your_database_host
    DATABASE_USER=your_database_user
    DATABASE_PASSWORD=your_database_password
    DATABASE_NAME=your_database_name
    SECRET=your_secret_key
    NEXTAUTH_URL=your_nextauth_url
   

# Usage

After setting up, you can access the application at [http://localhost:3000](http://localhost:3000). The following sections provide an overview of how to use the various features of the application.

## Authentication

- **Register**: Create a new account.
- **Login**: Log in to your account.
- **Profile**: View your profile and manage your account settings.

## Recipes

- **Add Recipe**: Create a new recipe by specifying its name and ingredients.
- **View Recipes**: View a list of all recipes.
- **Edit Recipe**: Update the details of an existing recipe.
- **Delete Recipe**: Remove a recipe from the list.

## Ingredients

- **Add Ingredient**: Add new ingredients with type and name.
- **View Ingredients**: View a list of all ingredients.
- **Update Prices**: Add or update the prices for ingredients.

## Cooking Sessions

- **Track Sessions**: Log cooking sessions, including date and yield.
- **View Sessions**: View a history of all cooking sessions.

## API Endpoints

The application provides several API endpoints to manage recipes, ingredients, and sessions. Below are some of the key endpoints:

### Recipes:

- **GET /api/recipes/list**: Get a list of all recipes.
- **POST /api/recipes/create**: Create a new recipe.
- **GET /api/recipes/:id**: Get details of a specific recipe.
- **DELETE /api/recipes/:id**: Delete a specific recipe.

### Ingredients:

- **GET /api/ingredients**: Get a list of all ingredients.
- **POST /api/ingredients**: Add a new ingredient.
- **POST /api/prices**: Add or update prices for ingredients.

### Cooking Sessions:

- **POST /api/sessions**: Log a new cooking session.
- **GET /api/sessions**: Get a list of all cooking sessions.

## Database Schema

The application uses MySQL for database management. Below is the schema for the tables used in the application:

- **Users**: Stores user information.
- **Recipes**: Stores recipe details.
- **Ingredients**: Stores ingredient details.
- **Recipe_Ingredients**: Stores the relationship between recipes and ingredients.
- **Prices**: Stores the prices of ingredients.
- **Cooking_Sessions**: Stores cooking session details.
- **Cooking_Session_Ingredients**: Stores the ingredients used in cooking sessions.

## Contributing

We welcome contributions to the project. To contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them.
4. Push your changes to your fork.
5. Open a pull request to the main repository.

## License

This project is licensed under the MIT License. 