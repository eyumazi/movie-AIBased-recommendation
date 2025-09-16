This project is a movie recommendation web application built with Next.js, leveraging AI for personalized recommendations. Users can create a watchlist, and the AI will suggest movies based on their preferences.

## Features:

- **User Watchlist:** Users can add and remove movies from their personal watchlist.
- **AI-Powered Recommendations:** Get personalized movie recommendations based on the movies in your watchlist.
- **Mood Search:** Find movies based on your current mood or desired genre.
- **Movie Details:** View detailed information about each movie, including title, year, IMDb ID, type, and poster.
- **Intuitive UI:** A clean and modern user interface designed for a seamless browsing experience.

## Getting Started:

1. **Clone the repository:**

   ```bash
   git clone <repository_url>
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env.local` file in the root directory and add your OMDb API key:

   ```
   NEXT_PUBLIC_OMDB_API_KEY=your_omdb_api_key
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure:

- `src/`: Contains the application's source code.
  - `ai/`: AI-related flows and configurations.
  - `app/`: Next.js pages and API routes.
  - `components/`: Reusable UI components.
  - `contexts/`: React contexts for state management.
  - `hooks/`: Custom React hooks.
  - `lib/`: Utility functions and external API integrations.
  - `types/`: TypeScript type definitions.

## AI Model Information:

The AI recommendation engine utilizes a custom flow (`recommendMoviesFlow`) defined in `src/ai/flows/recommend-movies-flow.ts`. This flow takes a user's watchlist as input and provides 5 movie recommendations with the following details:

- Movie title
- Release year
- IMDb ID
- A one-sentence explanation for the recommendation, connecting it to the user's watchlist.

## Styling:

The application's styling follows a specific blueprint:

- **Primary color:** Indigo (#4B0082)
- **Background color:** Very light grey (#F0F0F0)
- **Accent color:** Violet (#8A2BE2)
- **Body font:** 'PT Sans'
- **Headline font:** 'Space Grotesk'
- **Icons:** Minimalistic icons (e.g., plus for adding, trash can for removing).

This blueprint is detailed in `docs/blueprint.md`.

## Contributing:

Contributions are welcome! Please follow the standard GitHub fork and pull request workflow.

## License:

This project is licensed under the [MIT License](LICENSE).
