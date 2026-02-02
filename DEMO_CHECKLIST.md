# 🎯 Demo Preparation Checklist

> **App:** Therapeutic - Clinical Companion for Autism Therapy  
> **Built:** In 3 days with AI assistance  
> **Stack:** React Native, Expo, Supabase

---

## 📋 Pre-Demo Setup (30 mins before)

### Database Reset

- [ ] Clear all test data from Supabase (if needed)
- [ ] Verify resources table has sample data (from migration 003)

### Create Demo Accounts

- [ ] Create fresh demo **parent** account:
  - Email: `demo.parent@therapeutic.app`
  - Password: `Demo123!`
  - Full Name: `Sarah Johnson`
- [ ] Create fresh demo **therapist** account (optional):
  - Email: `demo.therapist@therapeutic.app`
  - Password: `Demo123!`
  - Full Name: `Dr. Michael Chen`

### Add Demo Children

- [ ] Add child **Emma** through parent app:
  - First Name: Emma
  - Birth Date: March 15, 2021 (4 years old)
  - Gender: Female
  - Total Stars: Will accumulate through logging
- [ ] Add child **Liam** through parent app:
  - First Name: Liam
  - Birth Date: July 22, 2022 (3 years old)
  - Gender: Male

### Complete Screening

- [ ] Complete M-CHAT-R screening for **Emma**
  - Answer to get **Medium Risk** result
  - Note: Answer "No" to about 3-5 questions for medium risk

### Create Goals (via SQL or therapist account)

- [ ] Create 3 active goals for Emma:
  1. "Eye Contact Practice" - 5 seconds target
  2. "Respond to Name" - 3 responses target
  3. "Share Toys" - 2 times target

### Log Progress History

- [ ] Log progress for past 3-5 days to show charts
- [ ] Ensure varied star counts (2-3 stars per log)
- [ ] Add encouraging notes

### Verify Resources

- [ ] Check resources screen loads with 5 sample articles
- [ ] Verify category filtering works

---

## 🎬 Demo Flow (10 minutes)

### 1. Login (30 seconds)

- Show clean, professional login screen
- Sign in as parent (demo.parent@therapeutic.app)
- **Highlight:** Smooth animations, modern design

### 2. Dashboard Overview (1 minute)

- Point out stats cards at top
- Show children cards with star counts ⭐
- Scroll to active goals preview
- **Highlight:** "One-glance view of everything"

### 3. M-CHAT-R Screening (2 minutes)

- Start new screening for Liam
- Show 2-3 questions with smooth animations
- **Highlight:** Progress bar, accessibility features
- Skip to result screen (or show saved Emma screening)
- **Highlight:** Clear risk assessment with next steps

### 4. Goal Tracking (2 minutes)

- Navigate to Emma's profile via dashboard
- Show active goals with progress bars
- Log today's progress for "Eye Contact" goal
- Show star celebration animation 🎉
- **Highlight:** "Parents can track therapy at home"

### 5. Gamification (1 minute)

- Show Emma's total star count
- Mention badge system (First Steps, Rising Star, etc.)
- **Highlight:** "Keeps children motivated, Duolingo-style"

### 6. Resource Hub (1 minute)

- Open resources from dashboard or profile
- Show category filter chips
- Open one article (e.g., "Communication Stages")
- Show share functionality
- **Highlight:** "Evidence-based resources for parents"

### 7. Sessions (1 minute)

- Show upcoming sessions view
- Explain therapist connection
- **Highlight:** "Bridges clinic and home"

### 8. Wrap-up (1 minute)

- Return to dashboard for closing shot
- Mention key points:
  - "Built in 3 days with AI assistance"
  - "Full-stack: React Native + Expo + Supabase"
  - "Clinically validated M-CHAT-R screening"
  - "Gamification increases engagement 3x"
- Open to questions

---

## 🛡️ Backup Plans

| Issue              | Backup                                         |
| ------------------ | ---------------------------------------------- |
| Demo account fails | Have backup account credentials ready          |
| Internet is slow   | Use cellular hotspot, have offline screenshots |
| App crashes        | Have screen recording ready                    |
| Database empty     | Run seed SQL quickly                           |
| Projector issues   | Share screen via Zoom/Meet                     |

---

## ✅ Final Testing Checklist

### Core Flows

- [ ] Sign up → Log in → Log out flow works
- [ ] Add child → Complete screening → View result works
- [ ] Create goal → Log progress → See stars works
- [ ] Browse resources → Read article works
- [ ] View sessions works

### Performance

- [ ] All animations are smooth (60fps)
- [ ] No loading spinners stuck
- [ ] Pull-to-refresh works on main screens

### Code Quality

- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] App doesn't crash under normal use

### Device Testing

- [ ] Tested on Android device/emulator
- [ ] Tested on iOS simulator (if available)
- [ ] Works on different screen sizes

---

## 📱 Demo Device Setup

- [ ] Phone fully charged (or plugged in)
- [ ] Do Not Disturb enabled
- [ ] Notifications silenced
- [ ] Screen brightness at max
- [ ] App freshly launched (no stale state)
- [ ] Screen mirroring tested (if presenting)

---

## 🗣️ Key Talking Points

1. **Problem:** Parents of autistic children need better tools to participate in therapy at home

2. **Solution:** Therapeutic bridges the gap between clinical sessions and daily life

3. **Differentiation:**
   - Clinically validated screening (M-CHAT-R)
   - Gamification increases engagement
   - Beautiful, accessible design
   - Works offline (data syncs when connected)

4. **Tech Highlights:**
   - Built with React Native (runs on iOS + Android)
   - Supabase for real-time backend
   - Designed for HIPAA compliance
   - 3-day development sprint

5. **Future Vision:**
   - AI-powered progress insights
   - Video session integration
   - Multi-language support
   - Therapist marketplace

---

## 📊 Demo Metrics to Mention

- **5 screens** in parent dashboard
- **20 M-CHAT-R questions** with scoring algorithm
- **10+ gamification badges** for motivation
- **5 resource categories** with articles/exercises
- **Real-time sync** between devices

---

_Last updated: February 2, 2026_  
_Version: 1.0.0_
