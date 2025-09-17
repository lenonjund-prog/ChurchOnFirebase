# AI Rules for Igreja SaaS Application

This document outlines the core technologies used in the Igreja SaaS application and provides guidelines for using specific libraries to maintain consistency and best practices.

## Tech Stack Overview

*   **Frontend Framework**: Next.js for server-rendered React applications.
*   **Language**: TypeScript for type-safe and robust code.
*   **UI Components**: shadcn/ui, built on Radix UI, for accessible and customizable UI components.
*   **Styling**: Tailwind CSS for utility-first CSS styling, ensuring a consistent and responsive design.
*   **Form Management**: React Hook Form for efficient form handling and validation.
*   **Schema Validation**: Zod for defining and validating data schemas, especially for forms.
*   **Backend & Database**: Firebase (Authentication for user management, Firestore for NoSQL database).
*   **Firebase Integration**: `react-firebase-hooks` for easy integration of Firebase services with React components.
*   **AI Integration**: Genkit AI with Google AI for building and deploying AI-powered flows.
*   **Charting**: Recharts for interactive data visualization within the dashboard.
*   **PDF Generation**: `jspdf` and `jspdf-autotable` for creating dynamic PDF reports.
*   **Icons**: Lucide React for a comprehensive set of SVG icons.
*   **Date Utilities**: `date-fns` for parsing, formatting, and manipulating dates.

## Library Usage Rules

To ensure consistency and maintainability, please adhere to the following guidelines when developing:

*   **UI Components**: Always prioritize `shadcn/ui` components. If a specific component is not available or requires extensive customization, create a new component that wraps or extends `shadcn/ui` primitives, or build a new one using Tailwind CSS.
*   **Styling**: Use Tailwind CSS exclusively for all styling. Avoid inline styles or separate CSS files unless strictly necessary for global styles (e.g., `globals.css`).
*   **Forms**: All forms must be managed using `react-hook-form` and validated with `zod` schemas.
*   **Data Persistence & Authentication**: Use Firebase Firestore for database operations and Firebase Authentication for user authentication. Integrate these services with React components using `react-firebase-hooks`.
*   **AI Functionality**: Any AI-related features or flows should be implemented using Genkit AI.
*   **Data Visualization**: For any charts or graphs, use the `recharts` library.
*   **PDF Reports**: When generating PDF documents, use `jspdf` along with `jspdf-autotable` for structured table output.
*   **Icons**: All icons throughout the application should come from the `lucide-react` library.
*   **Date Handling**: Use `date-fns` for all date and time formatting, parsing, and manipulation tasks.
*   **Utility Functions**: Utilize the `cn` utility (which combines `clsx` and `tailwind-merge`) for conditionally applying and merging Tailwind CSS classes.