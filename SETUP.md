# Vayura Setup Guide

You can run Vayura using **Docker (Recommended)** or set it up manually.

## Option 1: Docker Setup (Recommended)

Run the Next.js Frontend and Python Backend in consistent containers.

### Prerequisites

- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**: Ensure it is installed and running.
- **Environment Variables**: Create a `.env` file with your Firebase credentials (refer to the "Set Up Environment Variables" section below).

### Quick Start

1.  **Start the Application**

    ```bash
    docker-compose up --build
    ```

2.  **Access Services**
    - **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
    - **Backend Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

3.  **Stop the Application**
    - Press `Ctrl + C` to stop the running services.
    - To remove containers and networks, run:
      ```bash
      docker-compose down
      ```

### Troubleshooting

- **"Error during connect"**: Verify that Docker Desktop is running.
- **"Firebase Config Missing"**: Docker Compose reads from `.env` by default, not `.env.local`. Ensure your secrets are correctly placed in `.env`.

## Option 2: setup instructions for running Vayura locally.

## Prerequisites

- **Node.js 18+** and npm
- **Python 3.11+** (optional, for calculation microservice)
- **Firebase Account** (free tier available)
- **Google Gemini API Key** (free tier available)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/manasdutta04/vayura.git
cd vayura
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard
4. Enable **Authentication**:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password"
   - Enable "Google" (optional)
5. Create **Firestore Database**:
   - Go to Firestore Database > Create database
   - Start in **production mode** (we'll add rules)
   - Choose a location
6. Create **Cloud Storage**:
   - Go to Storage > Get started
   - Start in production mode
   - Use the same location as Firestore
7. Get **Service Account Key**:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file as `firebase-service-account.json` in the project root

### 4. Configure Firebase Admin SDK

You have two options:

**Option A: Service Account JSON File (Recommended)**

- Place `firebase-service-account.json` in the project root
- The file will be automatically loaded

**Option B: Environment Variables**

- Extract values from the JSON file:
  - `project_id` → `FIREBASE_PROJECT_ID`
  - `client_email` → `FIREBASE_CLIENT_EMAIL`
  - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` characters)

### 5. Get Firebase Client Config

1. Go to Project Settings > General
2. Scroll to "Your apps"
3. Click the web icon (`</>`) to add a web app
4. Register the app and copy the config values

### 6. Get Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the API key

### 7. Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (if not using JSON file)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key\n-----END PRIVATE KEY-----\n"

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# OpenWeatherMap (Optional)
OPENWEATHERMAP_API_KEY=your_openweathermap_key

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 8. Deploy Firestore Rules and Indexes

1. **Security Rules**:
   - Go to Firestore Database > Rules
   - Copy content from `firestore.rules`
   - Paste and publish

2. **Indexes**:
   - When you run the app, Firestore will show index creation links
   - Click the links to create indexes automatically
   - Or manually create from `firestore.indexes.json`

### 9. Seed Initial Data

```bash
# Seed districts data
npx tsx scripts/seed-districts.ts

# Seed forest cover data
npx tsx scripts/seed-forest-cover-data.ts
```

### 10. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Troubleshooting

### Firebase Admin SDK Errors

- Ensure `firebase-service-account.json` is in the project root
- Or verify environment variables are set correctly
- Check that the service account has proper permissions

### Firestore Index Errors

- Click the error link to create indexes automatically
- Or manually create indexes in Firebase Console

### Authentication Issues

- Verify Firebase Authentication is enabled
- Check that Email/Password provider is enabled
- Ensure Firebase config in `.env.local` is correct

### Gemini API Errors

- Verify API key is correct
- Check API quota limits
- Ensure the API key has proper permissions

## Next Steps

- Read [CONTRIBUTING.md](./CONTRIBUTING.md) to start contributing
- Check [DATA_SOURCES.md](./DATA_SOURCES.md) for data source information
- Explore the codebase and find areas to improve

## Need Help?

- Open a [GitHub Issue](https://github.com/manasdutta04/vayura/issues)
- Check existing issues and discussions
- Read the [README.md](./README.md) for more information
