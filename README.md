# Online To-Do List with User Authentication

This is the frontend application for the Sticky List project, designed to interact seamlessly with the [Sticky List backend](https://github.com/baburam04/sticky-list). Built using React Native and Expo, this mobile application allows users to manage and interact with their sticky notes efficiently.

## Features

- **React Native with Expo**: Leverages the power of React Native for cross-platform mobile development and Expo for streamlined development and testing.
- **Modular Architecture**:
  - `assets/`: Contains images, fonts, and other static resources.
  - `components/`: Reusable UI components.
  - `screens/`: Application screens or views.
  - `services/`: Handles API calls and business logic.
- **Integration with Backend**: Communicates with the Sticky List backend to fetch, create, update, and delete sticky notes.
- **Responsive Design**: Ensures a consistent user experience across different device sizes.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 14 or later)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) installed globally:

  ```bash
  npm install -g expo-cli
  ```

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/baburam04/project-frontend.git
   cd project-frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**:

   ```bash
   expo start
   ```

   This will start the Expo development server and provide options to run the app on an emulator, simulator, or physical device.

## Project Structure

```plaintext
project-frontend/
├── assets/             # Static assets like images and fonts
├── components/         # Reusable UI components
├── screens/            # Application screens or views
├── services/           # API calls and business logic
├── App.js              # Entry point of the application
├── app.json            # Expo configuration
├── babel.config.js     # Babel configuration
├── package.json        # Project metadata and dependencies
├── .gitignore          # Specifies files to ignore in Git
```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For any questions or suggestions, please open an issue or contact [baburam04](https://github.com/baburam04).

