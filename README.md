# **Pokémon Search Index**

The **Pokémon Search Index** is a feature-rich web application designed to provide an engaging experience for Pokémon enthusiasts. The app offers advanced search capabilities, personalized user dashboards, global leaderboards, and customizable themes, making it a comprehensive solution for managing and exploring Pokémon data. This is also technically the second version of the original search index I made for my freeCodeCamp certifications **cough cough** it was pretty ugly, but feel free to check it out [here](https://aether-pokemon-search.netlify.app/) 

## **Features**

### 🏆 **Experience and Leaderboards**
- **Experience System**: Users earn XP by interacting with the app (e.g., searching Pokémon, favoriting Pokémon, etc.). XP contributes to leveling up, unlocking achievements, and earning badges.
- **Global Leaderboards**: Track top users by total favorites, badges collected, and water-type Pokémon enjoyed. Compete with other trainers to climb the leaderboard!

### 🔎 **Advanced and Easy Search**
- **Advanced Search**: Use detailed filters (e.g., type, abilities, height, weight) to find specific Pokémon.
- **Quick Search**: Easily search Pokémon by name or ID with instant results.

### 🌗 **Dark Mode / Light Mode**
- Users can toggle between dark mode and light mode for an optimized viewing experience, based on their personal preference.

### 👤 **User Profiles**
- Each user has a dedicated profile page where they can:
  - Update display names, email, and password.
  - View personal statistics like total searches, total favorites, and total time spent.

### 📊 **Personalized Dashboard**
- The dashboard provides an overview of key user statistics:
  - Total searches, total favorites, total time spent, and current level.
  - Recommended Pokémon based on favorites.
  - Progress bar displaying XP toward the next level.
  - A widget showcasing recent achievements and earned badges.
  - A leaderboard widget highlighting top users.

### 🎖️ **Achievements and Badges**
- Users can unlock achievements and earn badges based on specific criteria, such as:
  - Reaching new levels.
  - Favoriting a specific number of Pokémon.
  - Favoriting specific types (e.g., water, fire, grass).
  - Completing advanced searches.

### 📰 **News Section**
- A news section keeps users updated on the latest events, updates, and features added to the Pokémon Search Index.

## **Tech Stack**

- **Frontend**:  
  - **React.js** with React Hooks for state management and React Router for navigation.
  - **React-Bootstrap** for responsive UI components and styling.
- **Backend**:  
  - **Firebase Firestore** for real-time data storage.
  - **Firebase Authentication** for secure user login and registration.
  - **Firebase Cloud Functions** (planned) for advanced server-side operations.
- **Other Tools & Libraries**:
  - **Axios** for fetching data from the Pokémon API.
  - **TanStack React Query** for efficient data fetching and caching.
  - **Toast Notifications** for real-time feedback on user actions.

## **Current State**

The Pokémon Search Index is currently under active development, with the following key features already implemented:
- Core experience system with XP and leveling up.
- Leaderboards for tracking top users.
- Dark mode and light mode toggle.
- Advanced and easy search functionality.
- Personalized user profiles and dashboards.
- Achievement and badge system with a growing list of unlockable goals.
- News section for keeping users updated.

### **Upcoming Features**
- **User Roles**: Implementing admin and moderator roles to manage content and users.
- **Social Features**: Adding friends lists and the ability to share Pokémon data.
- **Notifications**: Real-time notifications for achievements, badges, and leaderboard changes.
- **More Achievements and Badges**: Expanding the current system with new unlockable content.
- **PWA (Progressive Web App)**: Enabling offline capabilities and mobile app-like behavior.

## **Getting Started**

### **Prerequisites**
- Node.js and npm installed.
- Firebase account and project set up.

### **Installation**
1. Clone the repository:
   insert code block here
   git clone https://github.com/yourusername/pokemon-search-index.git
   cd pokemon-search-index
   insert code block here
2. Install dependencies:
   insert code block here
   npm install
   insert code block here
3. Set up Firebase:
   - Create a `.env` file with your Firebase project credentials.
   - Ensure Firestore and Authentication are enabled in your Firebase project.

4. Start the development server:
   insert code block here
   npm start
   insert code block here

### **Deployment**
You can deploy this app to platforms like **Firebase Hosting**, **Vercel**, or **Netlify**.

## **Contributing**

Contributions are welcome! If you have ideas for new features, bug fixes, or enhancements, feel free to submit a pull request or open an issue.
