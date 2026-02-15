# We Both Play 🎮

**We Both Play** is a modern web application that allows you to instantly compare Steam libraries with your friends. Find shared games, uncover unique titles, and plan your next co-op adventure in seconds.

## ✨ Features

- **Multi-User Comparison**: Compare libraries for up to 4 players simultaneously.
- **Instant Insights**: See "Shared Games", "Only You", and unique games for each friend.
- **Smart Parsing**: Supports Steam64 IDs, profile URLs, and vanity URLs.
- **Privacy Handling**: Gracefully handles private profiles or missing data.
- **Polished UI**: Built with a dark, modern aesthetic using Tailwind CSS and Framer Motion.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A valid [Steam Web API Key](https://steamcommunity.com/dev/apikey)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/steam-compare.git
    cd steam-compare
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment:
    Create a `.env.local` file in the root directory and add your Steam API Key:
    ```bash
    STEAM_API_KEY=your_steam_api_key_here
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **API**: [Steam Web API](https://partner.steamgames.com/doc/webapi_overview)

## 📦 Deployment

This project is optimized for deployment on [Vercel](https://vercel.com).

1.  Push your code to GitHub.
2.  Import the project in Vercel.
3.  Add the `STEAM_API_KEY` to the Vercel Project Settings > Environment Variables.
4.  Deploy!

## 📄 License

MIT
