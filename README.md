# MamuteForms

A beautiful, open-source TypeForm alternative. Create engaging forms with a one-question-at-a-time experience.

![MamuteForms Logo](logo.jpg)

## Features

- **6 beautiful themes** - Midnight, Ocean, Sunset, Forest, Lavender, Minimal
- **Keyboard navigation** - Navigate with Enter, arrow keys, and scroll wheel
- **Mobile-first forms** - Responsive form-taking experience
- **Response dashboard** - View, search, filter, and export to CSV
- **13 question types** - Text, multiple choice, rating, file upload, and more

## Status

**Frontend-only interface** - This repository contains only the frontend interface. The backend will be implemented separately using AWS services.

## Question types

| Type | Description |
|------|-------------|
| Short text | Single line text input |
| Long text | Multi-line textarea |
| Dropdown | Select one option |
| Checkboxes | Select multiple options |
| Email | Email with validation |
| Phone | Phone number input |
| Number | Numeric input |
| Date | Date picker |
| Rating | Star rating (1-5) |
| Opinion scale | Numeric scale (1-10) |
| Yes/No | Binary choice |
| File upload | Images and PDFs |
| Website URL | URL with validation |

## Tech stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Backend**: AWS (to be implemented)

## Getting started

### Prerequisites

- Node.js 18+

### 1. Clone and install

```bash
git clone https://github.com/yourusername/mamuteforms.git
cd mamuteforms
npm install
```

### 2. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Backend Implementation

This is a frontend-only repository. The backend will be implemented using AWS services:

- **Database**: AWS RDS (PostgreSQL) or DynamoDB
- **Authentication**: AWS Cognito
- **API**: AWS API Gateway + Lambda
- **File Storage**: AWS S3
- **Hosting**: AWS Amplify or Vercel

## Deployment

### Vercel (recommended for frontend)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Deploy

The frontend will work with mock data until the AWS backend is connected.

## Project structure

```
mamuteforms/
├── app/
│   ├── (auth)/           # Auth pages (login, signup)
│   ├── (dashboard)/      # Dashboard pages
│   │   ├── dashboard/    # Forms list
│   │   ├── forms/        # Form builder and responses
│   │   └── settings/     # User settings
│   ├── api/              # API routes (file upload)
│   ├── auth/             # Auth callback
│   └── f/[slug]/         # Public form pages
├── components/
│   ├── dashboard/        # Dashboard components
│   ├── form-builder/     # Form builder components
│   ├── form-player/      # Form player components
│   ├── responses/        # Response dashboard
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── mock-data.ts      # Mock data for frontend-only mode
│   ├── database.types.ts # TypeScript types
│   ├── questions.ts      # Question type definitions
│   └── themes.ts         # Theme configurations
```

## License

MIT License - feel free to use this for any project.

## Contributing

Contributions are welcome. Please open an issue or pull request.
