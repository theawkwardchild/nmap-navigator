# NMap Navigator 

NMap Navigator is a penetration testing note management platform designed to streamline security assessments.

## AI Vibe Code Warning
This was not written by humans and is provided "as is" without warranty. Feel free to use it however you'd like. Good luck!

## Overview

The application facilitates the import and parsing of nmap XML scan results to automatically discover hosts and services. It presents relevant attack methodologies as interactive, categorized checklists to help penetration testers manage and organize their workflow efficiently. Users can track completed tasks, manage discovered credentials, and keep lists of usernames and passwords across multiple target hosts.

![PenTest Workflow Screenshot](/images/sample.png) 

## Features

- **Interactive Checklists**: Provides categorized attack methodologies for organized workflows.
- **Credential Management**: Manages and tests discovered usernames and passwords.
- **Clean Interface**: Built using a full-stack TypeScript solution with a React frontend and Express backend for a distraction-free experience.

## Running the Project

To get started with the development server, you can use `npm` or `bun`.

### Using npm

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

### Build the project for production:

```bash
npm run build
npm run start
```
### Using bun
Install dependencies and start the development server:

```bash
bun install
bun run dev
```

Build and run the project:

```bash
bun run build
bun run start
```

## Future Enhancements
- This was vibe coded (using replit) with minimal human oversight, I am sure the code could be cleaned up. *Did I see it was half way trying to use a neon database when I explicitly told it not to use any internet APIs or services??*
- Update suggested commands.
- Combine certain services into one checklist - each port serving a web service will be different, but maybe we could combine certain ports that work together to run a service (NetBIOS 139 with SMB 445, ports 5985, 5986, and 47001 for WinRM, ports 49664-49669 for WINRPC, etc.)
- Add functionality for tracking progress beyond getting a foothold. We could add checklists for privilege escalation, lateral movement, and persistence.
- Allow the user to add notes for each host, service, and checklist item.
