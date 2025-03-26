# GraphTypes

## Overview
GraphTypes is a specialized web application for rendering and visualizing graphs. It provides users with a powerful, interactive interface to create, view, and manipulate graph structures with ease. Built with modern web technologies, GraphTypes offers a seamless experience for users working with graph-based data visualizations.

## Features
- **Graph Rendering**: Convert abstract graph data into clear, visual representations using Graphviz's powerful rendering engine
- **Interactive Visualization**: Manipulate and explore graph structures through an intuitive user interface
- **Customizable Styling**: Adjust node appearance, edge styles, and layout properties to create the perfect visualization
- **Export Capabilities**: Save graphs as images or other formats for use in documentation or presentations

## Technology Stack

### Frontend
- **React**: Component-based UI library for building the interface
- **Graphviz**: Industry-standard graph visualization engine
- **Vite**: Next-generation frontend build tool for fast development and optimized builds
- **shadcn/ui**: High-quality React components built with Radix UI and Tailwind CSS

## Getting Started

### Prerequisites
- Node.js (v16.x or later)
- pnpm package manager
- HTTP server for serving the built website

### Installation
1. Clone the repository
   ```
   git clone https://github.com/yourusername/graphtypes.git
   ```

2. Navigate to the project directory
   ```
   cd graphtypes
   ```

3. Install dependencies using pnpm
   ```
   pnpm install
   ```

4. Build the website
   ```
   pnpm build
   ```

5. Serve the built website using an HTTP server
   ```
   # Using a simple HTTP server like 'serve'
   pnpm add -g serve
   serve -s dist

   # Or any other HTTP server of your choice
   ```

6. Open your browser and navigate to the provided URL (usually http://localhost:5000 or similar)

## Usage
GraphTypes allows you to visualize graph structures with ease:

1. Input your graph data in the supported format
2. Customize the appearance and layout settings
3. View the rendered graph in real-time
4. Export or share your visualization as needed

[Screenshots or GIFs would be inserted here]

## Development
To run the project in development mode:
