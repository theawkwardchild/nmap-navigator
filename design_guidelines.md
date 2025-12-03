# Design Guidelines: Penetration Testing Note Management Platform

## Design Approach

**Selected Approach**: Design System - Productivity Application Pattern

**Primary References**: 
- Linear (for clean data presentation and task management)
- GitHub (for technical content and code display)
- Notion (for nested checklists and collapsible sections)
- VS Code (for command/code readability)

**Design Principles**:
1. Information density without clutter
2. Scan-friendly layouts for rapid assessment
3. Distraction-free focus on security workflows
4. Technical precision and readability

---

## Typography System

**Font Families** (Google Fonts CDN):
- **UI Text**: Inter (400, 500, 600 weights)
- **Monospace/Code**: JetBrains Mono (400, 500 weights)
- **Headings**: Inter (600, 700 weights)

**Typography Scale**:
- Page Title: text-2xl font-semibold (24px)
- Section Headers: text-lg font-semibold (18px)
- Subsection Headers: text-base font-medium (16px)
- Body Text: text-sm (14px)
- Small Labels: text-xs (12px)
- Code/Commands: text-sm font-mono (14px monospace)

**Line Heights**:
- Headings: leading-tight (1.25)
- Body: leading-relaxed (1.625)
- Code: leading-normal (1.5)

---

## Layout System

**Spacing Primitives** (Tailwind units):
- Primary set: 2, 3, 4, 6, 8
- Component spacing: p-4, p-6, p-8
- Element gaps: gap-2, gap-3, gap-4
- Section margins: mb-6, mb-8

**Page Structure**:
```
- Fixed sidebar (w-64): Navigation and host list
- Main content area (flex-1): Dynamic host/service details
- Optional right panel (w-80): Global credentials store (collapsible)
```

**Grid Systems**:
- Service cards: grid-cols-1 (mobile) → grid-cols-2 (md) → grid-cols-3 (lg)
- Credential table: single column, full width
- Checklist layout: single column for readability

**Container Widths**:
- Sidebar sections: full width within sidebar
- Main content: max-w-6xl with px-8 padding
- Code blocks: full width with horizontal scroll

---

## Component Library

### Navigation & Structure

**Sidebar Navigation**:
- Collapsible sections for host grouping
- Active host highlight with border indicator
- Port/service badges (inline, compact)
- Search input at top (w-full, rounded)

**Top Bar**:
- Import nmap button (primary action, right-aligned)
- Breadcrumb navigation (left-aligned)
- Global search (center, w-96)

**Tabs** (for services per host):
- Horizontal tab list, underline indicator
- Sticky positioning below page header
- Service name + port number display

### Data Display

**Host Cards** (in sidebar):
- IP address (text-base font-semibold)
- Hostname if available (text-sm)
- Port count badge
- OS detection icon/text

**Service Panels**:
- Service header with protocol, port, version
- Collapsible enumeration sections using disclosure triangles
- Progress indicator (X of Y tasks completed)

**Checklist Items**:
- Checkbox (larger, easy to click - w-5 h-5)
- Command/technique description (text-sm)
- Code block toggle for commands (initially collapsed)
- Nested sub-checklists indented with border-l-2

**Code Blocks**:
- JetBrains Mono font
- Line numbers for multi-line commands
- Copy-to-clipboard button (top-right)
- Syntax highlighting for common languages
- Horizontal scroll for long lines
- Padding: p-4

**Credential Table**:
- Sortable columns: Username, Password, Type, Source
- Inline edit capability
- Test buttons per credential (compact)
- Service validity checkmarks/x marks
- Sticky header on scroll

### Forms & Inputs

**File Upload** (nmap import):
- Drag-and-drop zone with dashed border
- File browser button as alternative
- Format indicator (XML, .nmap files)
- Upload progress bar

**Text Inputs**:
- Consistent height (h-10)
- Rounded corners (rounded-md)
- Focus ring for accessibility
- Label above input (text-sm font-medium, mb-2)

**Buttons**:
- Primary: Medium size, rounded-md, font-medium
- Secondary: Same size, bordered variant
- Icon buttons: Square (h-8 w-8), icon only
- Destructive: Red treatment for delete actions

### Feedback Elements

**Status Badges**:
- Small, rounded-full
- Service status (Open, Filtered, Closed)
- Task status (Pending, In Progress, Complete, Failed)

**Progress Indicators**:
- Linear progress bars for overall completion
- Circular indicators for individual services
- Percentage display alongside visual

**Empty States**:
- Centered message with icon
- Helpful text ("Import an nmap scan to begin")
- Primary action button

---

## Page Layouts

### Dashboard/Main View

**Three-column layout**:
1. **Left Sidebar** (fixed, w-64):
   - Nmap import button (w-full, mb-4)
   - Search hosts input
   - Scrollable host list with grouping

2. **Main Content** (flex-1):
   - Selected host header (IP, hostname, OS)
   - Service tabs (sticky)
   - Active service content with checklists
   - Collapsible markdown note sections

3. **Right Panel** (w-80, collapsible):
   - Global credentials header
   - Add credential button
   - Credential table/list
   - Validation results matrix

### Service Detail View

**Single-column layout within main content**:
- Service information card (mb-6)
- Sequential checklist sections with clear hierarchy:
  - "Initial Enumeration" (always first)
  - "Unauthenticated Attacks" 
  - "Authenticated Enumeration" (appears after credential discovery)
  - "Exploitation" (appears after vulnerabilities found)
- Each section collapsible with progress indicator
- Related markdown notes embedded inline

---

## Interaction Patterns

**Checklist Progression**:
- Linear, top-to-bottom flow
- Sections unlock based on completion/findings
- Visual connection between parent-child tasks (border-l with ml-4)

**Command Execution Flow**:
1. Read technique description
2. Expand code block
3. Copy command (auto-substitutes host IP/port)
4. Mark as complete when done

**Credential Management**:
- Quick-add from service context
- Bulk import from text paste
- Test against specific service/host
- Visual feedback (green check/red x) inline

**Collapsible Sections**:
- Click header to toggle
- Smooth height transition
- Rotate chevron icon 90deg
- Preserve state per session

---

## Accessibility

- Keyboard navigation for all checklists (space to toggle)
- Focus indicators on all interactive elements (ring-2)
- Sufficient color contrast for all text
- ARIA labels for icon-only buttons
- Skip navigation link for keyboard users
- Semantic HTML (proper heading hierarchy)

---

## Icons

**Icon Library**: Heroicons (outline for primary, solid for filled states)

**Key Icons**:
- CheckCircle (completed tasks)
- ExclamationTriangle (warnings)
- Terminal (commands)
- Server (hosts)
- Key (credentials)
- ChevronDown/Right (collapsibles)
- MagnifyingGlass (search)
- CloudArrowUp (upload)
- ClipboardDocument (copy)

---

## Special Considerations

**No Animations**: Keep interactions instant for professional efficiency

**Responsive Behavior**:
- Below lg: Collapse right panel by default
- Below md: Sidebar becomes drawer (hamburger menu)
- Mobile: Stack everything vertically, tabs become dropdown

**Data Persistence Visual Cues**:
- Auto-save indicator in header
- Session timestamp display
- Export results button always visible