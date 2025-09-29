# Car Audio Builder

This is a web-based application designed to help users plan and visualize their car audio system installations. Users can select their vehicle, browse a library of audio components, and create a custom wiring diagram. The application also provides helpful tools like a budget planner, wire gauge calculator, and safety checklist to guide users through the process.

## Features

- **Vehicle Selection:** Choose your vehicle's make, model, and year to get tailored fitment information.
- **Component Browser:** Explore a comprehensive library of car audio components, including head units, amplifiers, speakers, and subwoofers.
- **Wiring Diagram:** Visualize your audio system with an interactive wiring diagram. Add, remove, and connect components to create a custom setup.
- **Project Summary:** Keep track of your selected components, total cost, and power requirements.
- **Budget Planner:** Set a budget for your project and monitor your spending as you add components.
- **Wire Gauge Calculator:** Determine the appropriate wire gauge for your power and ground cables based on your system's power requirements.
- **Safety Checklist:** Get automated safety checks and recommendations to ensure a safe and reliable installation.
- **Tutorials and Guides:** Access a collection of tutorials and guides to learn more about car audio installation.
- **Light/Dark Theme:** Switch between light and dark themes for a comfortable viewing experience.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/car-audio-builder.git
   ```
2. Navigate to the project directory:
   ```bash
   cd car-audio-builder
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to `http://localhost:5173`.

## Dependencies

- [React](https://reactjs.org/)
- [React DOM](https://reactjs.org/docs/react-dom.html)
- [ReactFlow](https://reactflow.dev/)
- [Zustand](https://github.com/pmndrs/zustand)

## Scripts

- `dev`: Starts the development server.
- `build`: Builds the application for production.
- `lint`: Lints the source code.
- `preview`: Previews the production build.

## Folder Structure

```
/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   ├── ComponentBrowser.tsx
│   │   ├── CustomNode.tsx
│   │   ├── ProjectSummary.tsx
│   │   ├── SidebarPanels.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── VehicleFitmentPanel.tsx
│   │   ├── VehicleSetupControls.tsx
│   │   ├── WireGaugeCalculator.tsx
│   │   └── WiringDiagram.tsx
│   ├── data/
│   │   ├── components.json
│   │   ├── corporationMap.json
│   │   └── vehicle_specs.json
│   ├── services/
│   │   └── nhtsa.ts
│   ├── state/
│   │   └── useAppStore.ts
│   ├── views/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vite.config.ts
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License.