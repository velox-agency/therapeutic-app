# Therapeutic App - Complete Project Context Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Core Concept & Business Logic](#core-concept--business-logic)
3. [Technology Stack](#technology-stack)
4. [Project Architecture](#project-architecture)
5. [Database Schema](#database-schema)
6. [File Structure](#file-structure)
7. [Key Features by User Role](#key-features-by-user-role)
8. [Component Library](#component-library)
9. [Hooks & State Management](#hooks--state-management)
10. [Contexts & Theming](#contexts--theming)
11. [Authentication & Authorization](#authentication--authorization)
12. [Navigation Flow](#navigation-flow)
13. [Styling & Design System](#styling--design-system)
14. [Development Workflow](#development-workflow)

---

## Project Overview

**Therapeutic App** is a mobile application (built with Expo/React Native) that facilitates therapy and developmental support for children with autism spectrum disorder (ASD) and related developmental conditions.

### Key Objectives

- **For Parents**: Track their child's developmental progress, monitor therapy sessions, complete M-CHAT-R screenings, access therapeutic resources, and celebrate milestones through gamification
- **For Therapists**: Manage their patient caseload, set therapeutic goals, track progress, monitor sessions, and provide personalized therapy plans
- **Ecosystem**: Bridge the gap between parents and therapists through a collaborative platform

### Current Status

- **MVP Phase**: Core features implemented with real data integration via Supabase
- **Platform**: iOS, Android (via Expo SDK 54)
- **Language Support**: English, French, Arabic (i18n via i18n-js)
- **Theme Support**: Light and Dark modes

---

## Core Concept & Business Logic

### User Roles & Permissions

The app operates with **two primary user roles**:

#### 1. **Parent/Guardian**

- Creates account and manages child profiles
- Accesses child's therapy progress dashboard
- Completes M-CHAT-R screening assessments for developmental risk assessment
- Views and tracks therapeutic goals
- Monitors upcoming therapy sessions
- Earns badges/stars through gamification system
- Accesses therapeutic resources (articles, videos, exercises)
- Searches for and enrolls with therapists

#### 2. **Therapist**

- Creates account and completes onboarding profile (specialization, experience, credentials)
- Manages patient caseload (enrolled children via parent-therapist relationships)
- Creates and tracks therapeutic goals for patients
- Logs daily progress on goals
- Schedules and manages therapy sessions
- Views dashboard with key metrics (active patients, sessions, goal progress)
- Accesses comprehensive patient profiles

### Core Workflows

#### Parent Workflow

```
Sign Up → Create Child Profile → Screening Assessment →
Enroll with Therapist → Track Goals & Progress → Earn Badges
```

#### Therapist Workflow

```
Sign Up → Complete Onboarding → View Patients →
Create Goals → Log Progress → Schedule Sessions
```

#### Shared Features

- Goal creation and progress tracking
- Session management
- Resource access and sharing
- Communication markers (visible to both parties)

---

## Technology Stack

### Frontend

- **Framework**: React Native 0.81.5 with Expo SDK 54
- **Routing**: expo-router 6.0.23 (file-based routing similar to Next.js)
- **State Management**: React Hooks + Context API
- **Navigation**: React Navigation 7.1.8 (with bottom tabs)
- **Language**: TypeScript 5.9.2

### Backend & Database

- **Backend**: Supabase (PostgreSQL + Auth)
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth (email/password)
- **Real-time Sync**: Supabase Realtime subscriptions

### UI & Animation

- **Icons**: @expo/vector-icons (Ionicons)
- **Fonts**: @expo-google-fonts (Inter, Poppins)
- **Animations**: React Native Reanimated 4.1.1
- **Chart Library**: Victory Native 41.20.2
- **Calendar**: react-native-calendars 1.1314.0
- **Markdown**: react-native-markdown-display 7.0.2
- **Linear Gradient**: expo-linear-gradient 15.0.8

### Utilities

- **Local Storage**: @react-native-async-storage/async-storage 2.2.0
- **Date Picker**: @react-native-community/datetimepicker 8.4.4
- **Localization**: i18n-js 4.5.1 with expo-localization 17.0.8
- **Image Handling**: expo-image 3.0.11
- **Haptic Feedback**: expo-haptics 15.0.8

### Development Tools

- **Linting**: ESLint 9.25.0 with expo config
- **Package Manager**: Bun

---

## Project Architecture

### Overview

The project follows a **modular, role-based architecture** with clear separation of concerns:

```
therapeutic-app/
├── app/                          # Main app source code (expo-router)
│   ├── _layout.tsx              # Root layout with auth routing logic
│   ├── (auth)/                  # Public auth routes (login, signup, onboarding)
│   ├── (parent)/                # Parent-only routes
│   ├── (therapist)/             # Therapist-only routes
│   ├── shared/                  # Shared routes (accessible by both roles)
│   └── modal.tsx                # Root modal component
├── components/                   # Reusable UI components
│   ├── ui/                      # Core UI components (Button, Input, Card, etc.)
│   ├── themed/                  # Theme-aware components
│   ├── children/                # Child-specific components
│   ├── goals/                   # Goal-related components
│   ├── gamification/            # Badge and star components
│   ├── screening/               # Screening assessment components
│   ├── sessions/                # Session-related components
│   └── resources/               # Resources components
├── hooks/                        # Custom React hooks
│   ├── useAuth.tsx              # Authentication hook
│   ├── useChildren.ts           # Children data management
│   ├── useGoals.ts              # Goals CRUD and calculations
│   ├── useScreening.ts          # M-CHAT-R screening logic
│   └── use-*.ts                 # Theme and color scheme hooks
├── contexts/                     # React Context providers
│   ├── ThemeContext.tsx         # Light/Dark theme management
│   ├── LanguageContext.tsx      # i18n language switching
│   └── index.ts                 # Context exports
├── constants/                    # App constants
│   └── theme.ts                 # Design system (colors, typography, spacing)
├── lib/                          # Utility libraries
│   ├── supabase.ts              # Supabase client setup
│   ├── auth.ts                  # Auth helper functions
│   ├── gamification.ts          # Badge and star calculations
│   └── mchat.ts                 # M-CHAT-R scoring logic
├── types/                        # TypeScript type definitions
│   └── database.types.ts        # Supabase schema types
├── locales/                      # i18n translation files
│   ├── en.json                  # English translations
│   ├── fr.json                  # French translations
│   └── ar.json                  # Arabic translations
├── assets/                       # Static images and icons
└── package.json, tsconfig.json, etc.
```

### Architectural Principles

1. **Role-Based Routing**: (auth), (parent), (therapist), shared folder organization
2. **Component Composition**: Small, single-purpose components that compose into screens
3. **Hook-Based Logic**: Custom hooks encapsulate domain logic (auth, goals, children, etc.)
4. **Type Safety**: Full TypeScript with Supabase-generated types
5. **Context-Driven Styling**: Centralized theme system via Context API
6. **Separation of Concerns**: Lib folder for utilities, hooks for state, components for UI

---

## Database Schema

### Tables Overview

#### **profiles**

User profiles for all app users (parents and therapists)

```
id          UUID (PK, FK to auth.users)
role        'parent' | 'therapist'
full_name   string
phone       string (nullable)
avatar_url  string (nullable)
created_at  timestamp
updated_at  timestamp
```

#### **therapist_profiles**

Extended profile for therapist users

```
id                  UUID (PK, FK to profiles)
specialization      string (nullable) - "speech_language", "occupational", "behavioral", "developmental", "special_education", "physical"
bio                 string (nullable)
years_experience    integer (nullable)
license_number      string (nullable)
clinic_address      string (nullable)
is_verified         boolean (default: false)
```

#### **children**

Child profiles created by parents

```
id          UUID (PK)
parent_id   UUID (FK to profiles)
first_name  string
birth_date  date
gender      string (nullable)
avatar_seed string (nullable) - seed for generating avatar
total_stars integer - cumulative gamification stars
created_at  timestamp
```

#### **patient_therapist**

Many-to-many relationship between therapists and children

```
id          UUID (PK)
child_id    UUID (FK to children)
therapist_id UUID (FK to profiles)
status      'active' | 'paused' | 'completed'
started_at  timestamp
notes       string (nullable)
```

#### **goals**

Therapeutic goals set by therapists for children

```
id                      UUID (PK)
patient_therapist_id    UUID (FK to patient_therapist, nullable)
child_id                UUID (FK to children)
title                   string
description             string (nullable)
category                'communication' | 'social' | 'motor' | 'cognitive' | 'self_care' | 'behavior'
priority                'low' | 'medium' | 'high'
target_frequency        integer - e.g., "5 times per week"
frequency_period        'daily' | 'weekly' | 'monthly'
status                  'active' | 'paused' | 'completed'
target_value            float (nullable) - e.g., "10 seconds"
unit                    string (nullable) - e.g., "seconds", "words"
start_date              date
end_date                date (nullable)
is_active               boolean
created_by              UUID (FK to profiles) - therapist who created it
created_at              timestamp
```

#### **daily_logs**

Progress logs for goals

```
id              UUID (PK)
goal_id         UUID (FK to goals)
child_id        UUID (FK to children)
logged_by       UUID (FK to profiles) - parent or therapist
log_date        date
logged_at       timestamp
achieved_value  float (nullable) - actual value achieved
notes           string (nullable)
stars_earned    integer - gamification reward
created_at      timestamp
```

#### **sessions**

Therapy sessions between therapist and child

```
id                  UUID (PK)
patient_therapist_id UUID (FK to patient_therapist)
scheduled_at        timestamp
duration_minutes    integer
status              'scheduled' | 'completed' | 'cancelled'
location            string (nullable)
session_notes       string (nullable)
created_at          timestamp
```

#### **screenings**

M-CHAT-R assessments completed by parents

```
id              UUID (PK)
child_id        UUID (FK to children)
parent_id       UUID (FK to profiles)
answers         JSONB - 20 M-CHAT-R questions and responses
total_score     integer - risk score (0-20)
risk_level      'low' | 'medium' | 'high'
completed_at    timestamp
follow_up_requested boolean
```

#### **badges**

Achievement badges available in the app

```
id                  UUID (PK)
name                string
description         string (nullable)
icon_name           string (nullable) - Ionicons name
requirement_type    'stars_total' | 'goals_completed' | 'streak_days'
requirement_value   integer - threshold to earn badge
```

#### **child_badges**

Badges earned by children

```
id          UUID (PK)
child_id    UUID (FK to children)
badge_id    UUID (FK to badges)
earned_at   timestamp
```

#### **resources**

Therapeutic resources (articles, videos, exercises)

```
id              UUID (PK)
title           string
content         string (nullable)
type            'article' | 'video' | 'exercise'
category        'meltdown' | 'sensory' | 'communication'
media_url       string (nullable)
thumbnail_url   string (nullable)
created_at      timestamp
```

### Key Relationships

```
profiles (1) ──→ (∞) children [parent_id]
profiles (1) ──→ (1) therapist_profiles [id]
children (∞) ──← (∞) profiles [patient_therapist.child_id, therapist_id]
therapist (1) ──→ (∞) goals [created_by]
goals (1) ──→ (∞) daily_logs [goal_id]
children (1) ──→ (∞) daily_logs [child_id]
children (1) ──→ (∞) screenings [child_id]
children (∞) ──← (∞) badges [child_badges.child_id, badge_id]
```

---

## File Structure

### App Routes Structure

#### **(auth)** - Authentication Routes

Route-based screens for unauthenticated users

| File                       | Purpose                                                                 |
| -------------------------- | ----------------------------------------------------------------------- |
| `_layout.tsx`              | Stack layout for auth routes                                            |
| `login.tsx`                | Email/password login screen                                             |
| `signup.tsx`               | Account creation with role selection (parent/therapist)                 |
| `role-selection.tsx`       | Dedicated role selection screen                                         |
| `therapist-onboarding.tsx` | Multi-step onboarding for therapists (specialization, experience, etc.) |

#### **(parent)** - Parent-Only Routes

Tab-based navigation for authenticated parents

| File                        | Purpose                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------- |
| `_layout.tsx`               | Tab layout with bottom navigation (Dashboard, Children, Screening, Sessions, Profile) |
| `dashboard.tsx`             | Parent home screen showing child summaries and quick stats                            |
| `children/index.tsx`        | List of all children profiles created by parent                                       |
| `children/add.tsx`          | Form to add a new child profile                                                       |
| `children/[id].tsx`         | Child detail page with tabs: Overview, Goals, Sessions, Activity                      |
| `children/gamification.tsx` | Child's badge and star achievements                                                   |
| `screening/index.tsx`       | M-CHAT-R assessment start screen                                                      |
| `screening/start.tsx`       | Quiz interface for screening questions                                                |
| `screening/result.tsx`      | Screening results and risk assessment                                                 |
| `sessions/index.tsx`        | List of scheduled therapy sessions                                                    |
| `therapists/index.tsx`      | Browse and connect with therapists                                                    |
| `therapists/[id].tsx`       | Therapist profile and enrollment                                                      |
| `profile.tsx`               | Parent profile settings and information                                               |

#### **(therapist)** - Therapist-Only Routes

Tab-based navigation for authenticated therapists

| File                 | Purpose                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| `_layout.tsx`        | Tab layout with bottom navigation (Dashboard, Patients, Sessions, Profile, Goals*) - *Goals hidden from tabs |
| `dashboard.tsx`      | Therapist home screen with key metrics and quick actions                                                     |
| `patients/index.tsx` | List of therapist's enrolled patients                                                                        |
| `patients/[id].tsx`  | Patient detail page with tabs: Overview, Goals, Sessions, Screening                                          |
| `goals.tsx`          | Goals list page grouped by patient (accessed via dashboard quick action)                                     |
| `sessions.tsx`       | All sessions scheduled by therapist                                                                          |
| `profile.tsx`        | Therapist profile and account settings                                                                       |

#### **shared/** - Shared Routes

Routes accessible by both parents and therapists

| File                    | Purpose                                                                   |
| ----------------------- | ------------------------------------------------------------------------- |
| `_layout.tsx`           | Stack layout for shared routes                                            |
| `goals/_layout.tsx`     | Stack layout for goal routes                                              |
| `goals/create.tsx`      | Full goal creation form (rich UI with category grid, priority, frequency) |
| `goals/[id].tsx`        | Goal detail page with edit and delete options                             |
| `goals/daily-log.tsx`   | Log daily progress on a goal                                              |
| `goals/list.tsx`        | Goals list for a specific patient                                         |
| `edit-profile.tsx`      | Profile editing (name, avatar, phone)                                     |
| `settings/index.tsx`    | App settings (language, theme, notifications)                             |
| `resources/_layout.tsx` | Stack layout for resources                                                |
| `resources/index.tsx`   | Browse therapeutic resources                                              |
| `resources/[id].tsx`    | Resource detail page                                                      |

#### **Root & Modal**

| File                 | Purpose                                                        |
| -------------------- | -------------------------------------------------------------- |
| `_layout.tsx`        | Root layout with authorization and role-based routing logic    |
| `modal.tsx`          | Root modal presentation (if used)                              |
| `(tabs)/_layout.tsx` | Fallback tabs layout (not currently used, structure available) |

### Components Structure

#### **ui/** - Core UI Components

Reusable, unstyled (or minimally styled) components

| Component             | Purpose                                                                               |
| --------------------- | ------------------------------------------------------------------------------------- |
| `Button.tsx`          | Customizable button with variants (primary, secondary, outline), sizes, loading state |
| `Input.tsx`           | Text input with label, icon (left/right), error state, multiline support              |
| `Card.tsx`            | Container with elevation shadow and variants                                          |
| `Avatar.tsx`          | User/child avatar with initials or image                                              |
| `StatCard.tsx`        | Display metric with label and icon                                                    |
| `ProgressBar.tsx`     | Linear progress indicator                                                             |
| `EmptyState.tsx`      | Empty state with icon, title, subtitle                                                |
| `ErrorState.tsx`      | Error state with retry button                                                         |
| `LoadingSpinner.tsx`  | Loading indicator                                                                     |
| `Collapsible.tsx`     | Expandable/collapsible section                                                        |
| `icon-symbol.tsx`     | Icon resolution helper                                                                |
| `icon-symbol.ios.tsx` | iOS-specific icon resolution                                                          |

#### **themed/** - Theme-Aware Components

Components that respect theme context

| Component        | Purpose                                    |
| ---------------- | ------------------------------------------ |
| `ThemedText.tsx` | Text with automatic theme-aware color      |
| `ThemedView.tsx` | View with automatic theme-aware background |

#### **children/** - Child Profile Components

| Component       | Purpose                                                   |
| --------------- | --------------------------------------------------------- |
| `ChildCard.tsx` | Card displaying child info (name, age, diagnosis, avatar) |

#### **goals/** - Goal-Related Components

| Component              | Purpose                                             |
| ---------------------- | --------------------------------------------------- |
| `GoalCard.tsx`         | Compact goal display with title, category, priority |
| `GoalProgressCard.tsx` | Goal with progress bar, log button, stats           |

#### **gamification/** - Gamification Components

| Component           | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `BadgeCard.tsx`     | Badge display with icon, name, description |
| `StarAnimation.tsx` | Animated star effect for earned stars      |

#### **screening/** - Assessment Components

| Component           | Purpose                                       |
| ------------------- | --------------------------------------------- |
| `QuestionCard.tsx`  | M-CHAT-R question with yes/no buttons         |
| `RiskIndicator.tsx` | Visual risk level indicator (low/medium/high) |

#### **sessions/** - Session Components

| Component         | Purpose                                        |
| ----------------- | ---------------------------------------------- |
| `SessionCard.tsx` | Session card with date, time, duration, status |

#### **resources/** - Resource Components

| Component          | Purpose                                         |
| ------------------ | ----------------------------------------------- |
| `ResourceCard.tsx` | Resource card with thumbnail, title, type badge |

#### **Other Components**

| Component                | Purpose                                     |
| ------------------------ | ------------------------------------------- |
| `ParallaxScrollView.tsx` | Scrollable view with parallax header effect |
| `external-link.tsx`      | Link component that opens external URLs     |
| `haptic-tab.tsx`         | Tab with haptic feedback                    |
| `hello-wave.tsx`         | Greeting animation component                |

### Hooks Structure

| Hook                      | Purpose                                                              |
| ------------------------- | -------------------------------------------------------------------- |
| `useAuth.tsx`             | Authentication state (user, profile, loading, login, logout, signup) |
| `useChildren.ts`          | Manage and fetch children profiles                                   |
| `useGoals.ts`             | Goals CRUD operations and progress calculations                      |
| `useScreening.ts`         | M-CHAT-R screening logic                                             |
| `use-color-scheme.ts`     | Detect system color scheme (light/dark)                              |
| `use-color-scheme.web.ts` | Web-specific color scheme detection                                  |
| `use-theme-color.ts`      | Get theme color for specific color name                              |

### Contexts Structure

| Context               | Purpose                                                |
| --------------------- | ------------------------------------------------------ |
| `ThemeContext.tsx`    | Light/Dark mode state and colors provider              |
| `LanguageContext.tsx` | Language selection (en, fr, ar) and translation helper |

### Lib Utilities

| File              | Purpose                                                               |
| ----------------- | --------------------------------------------------------------------- |
| `supabase.ts`     | Supabase client initialization and basic auth functions               |
| `auth.ts`         | Additional authentication helpers (profile creation, role assignment) |
| `gamification.ts` | Star and badge calculation logic                                      |
| `mchat.ts`        | M-CHAT-R scoring and risk assessment logic                            |

### Constants

| File       | Purpose                                                                                                                                                    |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `theme.ts` | Complete design system: Colors (11 palettes), Typography (font families, sizes, weights), Spacing (t-shirt sizes), ComponentStyle (shadows, border radius) |

### Types

| File                | Purpose                                             |
| ------------------- | --------------------------------------------------- |
| `database.types.ts` | Auto-generated Supabase schema types and interfaces |

### Locales (i18n)

| File      | Purpose                      |
| --------- | ---------------------------- |
| `en.json` | English translations strings |
| `fr.json` | French translations strings  |
| `ar.json` | Arabic translations strings  |

---

## Key Features by User Role

### Parent Features

#### 1. **Child Profile Management**

- Create and manage multiple child profiles
- Store child information (name, birth date, gender, avatar)
- View child's developmental progress
- Track therapy enrollment and sessions

#### 2. **M-CHAT-R Screening**

- Complete developmental risk assessment (20 questions)
- Automatic scoring and risk level determination (low/medium/high)
- Historical screening records
- Early detection of developmental delays

#### 3. **Therapist Connection**

- Browse available therapists with specializations
- View therapist profiles (experience, credentials, bio)
- Enroll child with selected therapist
- Manage therapist relationships

#### 4. **Goal Tracking**

- View goals set by therapist for their child
- Log daily progress on goals
- Track goal completion percentage
- View goal history and analytics

#### 5. **Session Monitoring**

- View upcoming therapy sessions
- See session details (date, time, duration, location, notes)
- Historical session records
- Session notes and feedback

#### 6. **Gamification System**

- Earn stars for logging goal progress
- Unlock and collect badges
- Visual achievement showcase
- Motivational milestone celebrations

#### 7. **Resources Library**

- Access therapeutic resources (articles, videos, exercises)
- Resource categorization (meltdown, sensory, communication)
- Searchable and filterable resources
- Resource sharing capabilities

#### 8. **Dashboard & Insights**

- Quick overview of child's status
- Recent activity feed
- Upcoming sessions and goals
- Star and badge count

### Therapist Features

#### 1. **Patient Caseload**

- Manage multiple patient-family relationships
- View all enrolled children
- Track patient status (active, paused, completed)
- Patient management interface

#### 2. **Professional Profile**

- Complete onboarding with specialization selection
- License and credential management
- Professional bio and experience level
- Clinic location information
- Profile verification status

#### 3. **Goal Management**

- Create therapeutic goals for patients
- Define goal categories (communication, social, motor, cognitive, self-care, behavior)
- Set priority levels (low, medium, high)
- Configure frequency targets (daily/weekly/monthly with number)
- Optional target measurement (value + unit for quantified tracking)
- Goal status management (active, paused, completed)
- Goals list grouped by patient

#### 4. **Progress Tracking**

- Log daily progress on patient goals
- Record achieved values and notes
- View progress history and trends
- Automatic star calculation for parents

#### 5. **Session Management**

- Schedule therapy sessions with patients
- Manage session status (scheduled, completed, cancelled)
- Record session notes and observations
- View session calendar and list
- Duration and location tracking

#### 6. **Dashboard & Analytics**

- Key metrics display (active patients, sessions today, goals due)
- Active patient list with status
- Upcoming sessions overview
- Recently created goals
- Quick action buttons (add goal, schedule session)

#### 7. **Patient Insights**

- Patient profile with enrollment details
- Child's developmental information
- Screening results (M-CHAT-R scores)
- Goal progress and engagement
- Session history and frequency

### Shared Features

#### 1. **Goal Details & Tracking**

- View comprehensive goal information
- Track progress with daily logs
- Visual progress indicators
- Goal achievement celebration

#### 2. **Profile Management**

- Edit personal information (name, phone, avatar)
- Update profile settings
- Account management

#### 3. **Settings**

- Language selection (English, French, Arabic)
- Theme preference (Light, Dark, System)
- Notification preferences (if applicable)
- Privacy and security settings

#### 4. **Resource Access**

- Browse therapeutic resources
- Filter by type and category
- View detailed resource content
- Share resources with team

---

## Component Library

### Design System Philosophy

**"Therapeutic Playful Professional"** - combining medical credibility with engaging, gamified elements (inspired by Duolingo)

### Colors

#### Primary (Calming Blue)

```
#E3F2FD (50)  → #0A2472 (900)
Main brand blue: #2196F3 (500)
```

Used for: Primary actions, links, selected states, brand elements

#### Secondary (Warm Orange)

```
#FFF3E0 (50) → #E65100 (900)
Achievement orange: #FF9800 (500)
```

Used for: Achievements, badges, highlights, success states

#### Success (Growth Green)

```
#E8F5E9 (50) → #1B5E20 (900)
Growth green: #4CAF50 (500)
```

Used for: Positive progress, completed goals, approvals

#### Warning (Caution Yellow)

```
#FFF9C4 (50) → #F57F17 (900)
Caution yellow: #FBC02D (500)
```

Used for: Alerts, warnings, needs attention

#### Error (Alert Red)

```
#FFEBEE (50) → #B71C1C (900)
Alert red: #F44336 (500)
```

Used for: Errors, cancellations, risks (high risk screening)

#### Surface & Neutral

```
surface: #FFFFFF (light), #121212 (dark)
divider: #E0E0E0 (light), #303030 (dark)
background: #F5F5F5 (light), #0A0E27 (dark)
```

### Typography

#### Font Families

- **Primary (Regular)**: Inter
- **Primary Bold**: Inter Bold (weight: 700)
- **Secondary**: Poppins (for display/headings)

#### Font Sizes

- **h1**: 32px (headings, large titles)
- **h2**: 28px (section titles)
- **h3**: 24px (subsection titles)
- **h4**: 20px (prominent text)
- **body**: 16px (main content)
- **small**: 14px (secondary text)
- **tiny**: 12px (tertiary text, labels)

#### Font Weights

- **regular**: 400
- **semibold**: 600
- **bold**: 700

### Spacing System

T-shirt sizing approach:

```
xs:  4px
sm:  8px
md:  12px
lg:  16px
xl:  24px
xxl: 32px
```

### Component Styles

- **Border Radius**:
  - sm: 8px (small buttons, inputs)
  - md: 12px (cards, modals)
  - lg: 16px (large cards, prominent elements)
  - xl: 24px (modal top corners)

- **Shadows**:
  - small: Subtle shadow (0px 1px 3px rgba(0,0,0,0.1))
  - medium: Standard shadow
  - large: Prominent shadow

### Component States

All interactive components support:

- **Default**: Normal state
- **Hover**: Enhanced visual feedback
- **Active**: Selected/pressed state
- **Disabled**: Disabled with reduced opacity
- **Loading**: Loading indicator
- **Error**: Error state with red border/text

---

## Hooks & State Management

### useAuth Hook

```typescript
const {
  user,           // Current authenticated user (auth.users)
  profile,        // User's profile from profiles table
  loading,        // Initial loading state
  initialized,    // Auth state initialized

  // Methods
  signUp(email, password, fullName, role, phone?),
  signIn(email, password),
  signOut(),
  refreshProfile(),
} = useAuth();
```

**Purpose**: Centralized authentication state management and methods
**Usage**: Auth routing, profile access, login/logout flows

### useChildren Hook

```typescript
const {
  children,       // Array of child profiles for current parent
  loading,        // Loading state
  addChild(data), // Create new child
  updateChild(id, data),
  deleteChild(id),
  fetchChildren(),
} = useChildren();
```

**Purpose**: Manage parent's children profiles
**Usage**: Children list page, profile creation

### useGoals Hook

```typescript
const {
  goals,                  // Goals for specific patient/child
  loading,                // Loading state

  // Methods
  fetchGoals(childId),
  createGoal(data),
  updateGoal(id, data),
  deleteGoal(id),
  logProgress(goalId, achieved_value, notes),
  calculateProgress(goalId),
  getGoalsByCategory(childId),
} = useGoals();
```

**Purpose**: Goal CRUD operations and progress calculations
**Usage**: Goal pages, progress tracking, goal creation

### useScreening Hook

```typescript
const {
  screening,      // Latest screening for child
  loading,        // Loading state

  // Methods
  startScreening(),
  submitAnswers(childId, answers),
  calculateScore(answers),
  getRiskLevel(score),
  fetchScreeningHistory(childId),
} = useScreening();
```

**Purpose**: M-CHAT-R screening logic
**Usage**: Screening flow (start, questions, results)

### useColorScheme Hook

```typescript
const colorScheme = useColorScheme(); // 'light' | 'dark' | null
```

**Purpose**: Detect system color scheme preference
**Usage**: Implement theme switching

### useThemeColor Hook

```typescript
const color = useThemeColor({}, "text", "primary");
```

**Purpose**: Get theme-aware color
**Usage**: Dynamic styling based on theme

---

## Contexts & Theming

### ThemeContext

Manages light/dark mode and provides color palette

```typescript
const {
  theme,          // 'light' | 'dark'
  setTheme(theme),
  colors: {
    primary, secondary, success, warning, error,
    surface, background, divider, text, border
  },
  isDark,         // boolean
} = useTheme();
```

**Default**: System preference or saved in AsyncStorage
**Persistence**: AsyncStorage
**Scope**: Entire app via NavigationThemeProvider

### LanguageContext

Manages i18n translations and language selection

```typescript
const {
  language,           // 'en' | 'fr' | 'ar'
  setLanguage(lang),
  t(key, params?),    // Translate key with optional parameters
  isRTL,              // Right-to-left for Arabic
} = useLanguage();
```

**Default**: Device locale or 'en'
**Persistence**: AsyncStorage
**Available Languages**: English (en), French (fr), Arabic (ar)

---

## Authentication & Authorization

### Auth Flow

#### Sign Up (Parent)

1. Email & password entry
2. Full name input
3. Phone number (optional)
4. Profile creation in `profiles` table with role='parent'
5. Auth state change triggers home navigation

#### Sign Up (Therapist)

1. Email & password entry
2. Full name input
3. Phone number (optional)
4. Redirect to `therapist-onboarding`
5. Specialization selection (6 options)
6. Professional details (bio, experience, license, address)
7. Profile completion in `therapist_profiles` table
8. Redirect to therapist dashboard

#### Onboarding Check

- **Root layout** checks `therapist_profiles.specialization`
- If null and role='therapist', redirect to onboarding
- If complete, allow access to therapist routes

### Permission Model

Using **namespace-based routing** instead of explicit permissions:

- **(auth)** routes: No auth required
- **(parent)** routes: Require role='parent' + completed profile
- **(therapist)** routes: Require role='therapist' + completed specialization
- **shared** routes: Both roles allowed

### Role Enforcement

Checked in root `_layout.tsx`:

```typescript
if (profile.role === "therapist" && inParentGroup) {
  router.replace("/(therapist)/dashboard");
}
if (profile.role === "parent" && inTherapistGroup) {
  router.replace("/(parent)/dashboard");
}
```

---

## Navigation Flow

### Tab-Based Navigation

#### Parent Navigation (5 tabs)

```
┌─────────────────────────┐
│ Dashboard               │
│ Children                │
│ Screening               │
│ Sessions                │
│ Profile                 │
└─────────────────────────┘
```

- Each tab has its own stack of screens
- Can navigate to shared screens from any tab
- Deep linking supported via expo-router

#### Therapist Navigation (4 tabs + hidden Goals)

```
┌─────────────────────────┐
│ Dashboard               │
│ Patients                │
│ Sessions                │
│ Profile                 │
│ Goals (hidden, deep link │  via dashboard)
└─────────────────────────┘
```

### Navigation Patterns

#### Stack Navigation

Used within tabs for screen hierarchies:

- Parent: Dashboard → Children → Child [id] → Child Goals/Sessions
- Therapist: Dashboard → Patients → Patient [id] → Editing Goals

#### Modal Navigation

Used for:

- Goal creation (modal in patient detail page)
- Resource viewing (if applicable)
- Important confirmations

#### Deep Linking

Expo-router enables deep linking:

```
therapeuticapp:///(parent)/children/[id]
therapeuticapp:///(therapist)/goals
```

---

## Styling & Design System

### Implementation Approach

1. **Centers on `constants/theme.ts`**
   - Single source of truth for all design tokens
   - Colors, typography, spacing, component styles
   - Imported into all components

2. **Theme Context**
   - Switches between light/dark at runtime
   - Provides `colors` object with theme-aware values
   - Used in components via `useTheme()` hook

3. **Styled Components Pattern**
   - `StyleSheet.create()` for performance
   - Dynamic styles computed from theme context
   - Example:

   ```typescript
   const { colors } = useTheme();
   const styles = StyleSheet.create({
     container: { backgroundColor: colors.background },
     text: { color: colors.text },
   });
   ```

4. **Component Variants**
   - Button: primary, secondary, outline
   - Card: elevated, outlined, flat
   - Input: default, error, disabled
   - Avatar: initials, image, placeholder

### Color Usage by Context

| Element        | Light   | Dark    |
| -------------- | ------- | ------- |
| Background     | #F5F5F5 | #0A0E27 |
| Surface        | #FFFFFF | #121212 |
| Primary Text   | #1a1a1a | #FFFFFF |
| Secondary Text | #666666 | #AAAAAA |
| Tertiary Text  | #999999 | #555555 |
| Dividers       | #E0E0E0 | #303030 |
| Primary Action | #2196F3 | #2196F3 |
| Success        | #4CAF50 | #4CAF50 |
| Error          | #F44336 | #F44336 |

---

## Development Workflow

### Environment Setup

```bash
# Install dependencies
npm install  # or bun install

# Create .env file with Supabase keys
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Running the App

```bash
# Start dev server
npm start

# Open in:
# - iOS Simulator: i
# - Android Emulator: a
# - Web: w
# - Expo Go: Scan QR code
```

### Code Structure Conventions

#### File Naming

- **Components**: PascalCase.tsx (Button.tsx, Card.tsx)
- **Hooks**: useXxx.ts (useAuth.tsx, useGoals.ts)
- **Util files**: kebab-case.ts (firebase-config.ts)
- **Routes**: kebab-case.tsx or [param].tsx

#### Component Template

```typescript
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, Typography } from '@/constants/theme';

export default function MyComponent() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.heading}>Heading</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  heading: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
  },
});
```

### Key Patterns

#### Data Fetching with Hooks

```typescript
useEffect(() => {
  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchFromSupabase();
      setState(data);
    } catch (error) {
      setError(error?.message);
    } finally {
      setLoading(false);
    }
  };
  load();
}, [dependency]);
```

#### Type-Safe Queries

```typescript
const { data, error } = await supabase
  .from("goals")
  .select("*")
  .eq("child_id", childId)
  .order("created_at", { ascending: false });
```

#### Context Usage

```typescript
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

const { colors, isDark } = useTheme();
const { t, language, setLanguage } = useLanguage();
```

### Testing Checklist

- [ ] Responsive on mobile (both orientations)
- [ ] Works in light AND dark mode
- [ ] Translations present for all text (use `t()`)
- [ ] No hardcoded colors (use context colors)
- [ ] Loading states handled
- [ ] Empty states handled
- [ ] Error states handled
- [ ] Forms validate properly
- [ ] Back navigation works
- [ ] DeepNav links if applicable

### Performance Optimization

1. **Use React.memo** for pure components
2. **Lazy load heavy screens** if needed
3. **Optimize images** (compress, right dimensions)
4. **Avoid inline functions** in render
5. **Use FlatList for long lists** not ScrollView
6. **Cache goal calculations** in useMemo hooks

### Common Issues & Solutions

| Issue                   | Solution                                        |
| ----------------------- | ----------------------------------------------- |
| Modal not closing       | Ensure state update before route change         |
| Styling not updating    | Check if using `useTheme()` hook                |
| Infinite loop           | Check dependency arrays in `useEffect`          |
| Image not showing       | Verify URL valid and permissions correct        |
| Translation not working | Ensure key exists in all locale JSONs           |
| Performance slow        | Use React DevTools Profiler to find bottlenecks |

---

## Important Notes for Future Development

### For New LLM Integration

1. **Always check role context** - Different features for parent vs therapist
2. **Type safety matters** - Use generated Supabase types
3. **i18n for all user-facing text** - Add strings to all locale files
4. **Theme-aware colors** - Use `useTheme()` not hardcoded colors
5. **Test both roles** - Login as parent and therapist to verify flows
6. **Mobile-first thinking** - Design for small screens first
7. **Accessibility** - Use semantic elements, proper contrast, readable text

### Common Modifications

- **Adding new goal category**: Add to `GoalCategory` type, CATEGORIES constant in create.tsx
- **New badge requirement**: Add to `BadgeRequirementType`, update gamification.ts logic
- **New resource category**: Add to `ResourceCategory` type, update components
- **New user role**: Requires changes to auth, routing, role type, and profile table
- **New language**: Add locale JSON file, register in LanguageContext

### Database Migrations

- Use Supabase UI or migrations folder
- Always test on development database first
- Generate new types after schema changes
- Update interfaces in database.types.ts

---

## File Summary Reference

### Critical Files (High Priority)

- `app/_layout.tsx` - Auth routing, role checking
- `lib/supabase.ts` - DB connection
- `hooks/useAuth.tsx` - Auth state
- `constants/theme.ts` - Design system
- `contexts/ThemeContext.tsx` - Theme provider

### Feature-Specific Files

- **Goals**: `shared/goals/create.tsx`, `hooks/useGoals.ts`
- **Gamification**: `lib/gamification.ts`, `components/gamification/`
- **Screening**: `app/(parent)/screening/`, `lib/mchat.ts`
- **Therapist**: `app/(therapist)/`, `app/(auth)/therapist-onboarding.tsx`

### Last Updated

February 5, 2026

---

**End of Project Context Documentation**
