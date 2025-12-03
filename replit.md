# PenTest Workflow - Penetration Testing Note Management Platform

## Overview

PenTest Workflow is a penetration testing note management platform designed to streamline security assessments. The application imports nmap XML scan results, automatically parses discovered hosts and services, and presents relevant attack methodologies as interactive, categorized checklists. The platform helps penetration testers organize their workflow by tracking completed tasks, managing discovered credentials, and maintaining lists of usernames and passwords across multiple target hosts.

The application is built as a full-stack TypeScript solution with a React frontend and Express backend, focusing on providing a clean, distraction-free interface optimized for technical security work.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, built using Vite for fast development and optimized production builds.

**UI Component System**: The application uses shadcn/ui components built on Radix UI primitives, providing accessible and customizable interface elements. The design system follows a productivity application pattern inspired by Linear, GitHub, and Notion, emphasizing information density, scan-friendly layouts, and technical precision.

**Styling Approach**: Tailwind CSS with a custom design system that includes:
- Custom CSS variables for theming (light/dark mode support)
- Typography system using Inter for UI text and JetBrains Mono for code/commands
- Consistent spacing and elevation patterns
- Responsive layouts with mobile considerations

**State Management**: TanStack Query (React Query) handles server state management, caching, and synchronization. Local component state is managed with React hooks. The application uses optimistic updates and background refetching to maintain data freshness.

**Routing**: Single-page application with client-side navigation. The main interface is host-centric, with sidebar navigation for host selection and tabbed views for different service contexts.

### Backend Architecture

**Server Framework**: Express.js running on Node.js, configured for both development (with Vite middleware) and production (serving static files).

**API Design**: RESTful API endpoints organized by resource type (hosts, services, checklists, credentials, usernames, passwords). The API uses conventional HTTP methods (GET, POST, DELETE) and returns JSON responses.

**File Upload Handling**: Multer middleware processes nmap XML file uploads, storing files in memory for immediate parsing without disk I/O.

**XML Parsing**: fast-xml-parser library converts nmap XML output into structured data, extracting host information (IP, hostname, OS) and service details (port, protocol, name, version, state).

**Development vs Production**: 
- Development mode uses Vite's middleware mode with HMR for instant updates
- Production mode serves pre-built static assets from the dist directory
- Both modes share the same Express route handlers

### Data Storage Solutions

**Storage Interface**: Abstract IStorage interface defines all data operations, allowing for implementation flexibility. Currently uses in-memory storage with Map-based collections.

**Data Models**:
- **Hosts**: Target machines with IP, hostname, OS, and status
- **Services**: Running services on hosts with port, protocol, name, version, and state
- **ChecklistItems**: Static task definitions loaded from default data, categorized by service type (SMB, HTTP, SSH, etc.) and attack phase (enumeration, unauthenticated, authenticated, exploitation)
- **ChecklistStates**: User progress tracking per host/service/checklist item combination
- **Credentials**: Username/password pairs with optional service context
- **CredentialTests**: Validation results for credentials against specific services
- **Usernames**: Discovered usernames with source attribution
- **DiscoveredPasswords**: Found passwords with source documentation

**Data Relationships**: Hosts have many Services. Services link to ChecklistItems via serviceType matching. ChecklistStates track completion for specific host/service/item combinations. Credentials and tests reference hosts and services.

**Persistence Strategy**: Current implementation uses in-memory storage, meaning data is ephemeral and resets on server restart. The storage interface is designed to support future database integration (Drizzle ORM configuration exists for PostgreSQL via Neon Database).

### External Dependencies

**UI Component Library**: Radix UI provides unstyled, accessible component primitives including dialogs, dropdowns, tooltips, collapsibles, tabs, and more. These are wrapped with Tailwind styling as shadcn/ui components.

**Database ORM**: Drizzle ORM is configured for PostgreSQL connections via @neondatabase/serverless driver. The configuration points to a schema file and migration directory, though the storage layer currently uses in-memory data structures.

**Form Management**: React Hook Form with Zod resolvers provides type-safe form validation and state management.

**Styling Dependencies**: 
- Tailwind CSS with PostCSS for processing
- class-variance-authority for type-safe component variants
- clsx and tailwind-merge for conditional class composition

**Development Tools**:
- tsx for TypeScript execution in development
- esbuild for server-side bundling in production
- Vite plugins for development features (error overlay, cartographer, dev banner)
- TypeScript for static type checking

**Fonts**: Google Fonts CDN loads Inter (UI text) and JetBrains Mono (code/commands) with specific weights for the typography system.

**Command/Code Display**: The application substitutes placeholder values ($target_ip, $port) with actual host/service data in displayed commands, enabling copy-paste workflow for penetration testing tools.