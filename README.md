# SVG Slide Editor

A powerful web-based editor for creating and editing SVG slides. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Create and edit SVG elements (rectangles, circles, paths, text)
- Organize elements in layers
- Manage multiple slides
- Edit SVG code directly
- Export slides as SVG files
- Save and load projects

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/svg-slide-editor.git
cd svg-slide-editor
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
svg-slide-editor/
├── app/                           # Next.js App Router
│   ├── favicon.ico                # Favicon
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Home page
├── components/                    # React components
│   ├── editor/                    # Editor components
│   │   ├── Canvas.tsx             # SVG drawing canvas
│   │   ├── CodeEditor.tsx         # SVG code editor
│   │   ├── ElementProperties.tsx  # Properties panel 
│   │   ├── LayersPanel.tsx        # Layers management
│   │   ├── Toolbar.tsx            # Drawing tools
│   │   └── SlidesPanel.tsx        # Slides management
│   ├── ui/                        # UI components
│   │   ├── Button.tsx             # Reusable button 
│   │   ├── ColorPicker.tsx        # Color selection
│   │   ├── Dropdown.tsx           # Dropdown menu
│   │   ├── Panel.tsx              # Collapsible panel
│   │   └── Tooltip.tsx            # Tooltip component
│   └── layout/                    # Layout components
│       ├── Header.tsx             # App header
│       └── Sidebar.tsx            # App sidebar
├── context/                       # React context providers
│   └── EditorContext.tsx          # Editor state context
├── hooks/                         # Custom React hooks
│   ├── useElementDrag.ts          # Element dragging hook
│   ├── useSvgGenerator.ts         # SVG code generation hook
│   ├── useSvgParser.ts            # SVG parsing hook
│   └── useLocalStorage.ts         # Local storage hook
├── lib/                           # Utility functions
│   ├── svgUtils.ts                # SVG helper functions
│   ├── formatters.ts              # Code formatting utilities
│   └── storage.ts                 # Local storage utilities
├── types/                         # TypeScript type definitions
│   └── editor.ts                  # Editor-related types
```

## Usage

1. **Creating Elements**: Use the toolbar to select an element type and click on the canvas to add it.
2. **Editing Elements**: Select an element and use the properties panel to modify its attributes.
3. **Managing Layers**: Use the layers panel to reorder, show/hide, or delete elements.
4. **Working with Slides**: Create multiple slides and navigate between them using the slides panel.
5. **Editing SVG Code**: Switch to the code view to directly edit the SVG code.
6. **Exporting**: Export your slides as SVG files for use in other applications.
7. **Saving/Loading**: Save your project to continue working on it later.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
