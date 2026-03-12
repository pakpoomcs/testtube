# Native Mobile QA Checklist — TestTube (Capacitor 8)

App loads from: `https://testtube-rho.vercel.app`
Native shell: Capacitor 8 · iOS · Android

Mark each item: ✅ Pass · ❌ Fail · ⚠️ Partial · N/A

---

## 1. Splash Screen & App Launch

| # | Test | iOS | Android |
|---|------|-----|---------|
| 1.1 | Splash screen appears immediately on cold launch | | |
| 1.2 | Splash dismisses cleanly (no white flash) | | |
| 1.3 | Auth state restored — logged-in user lands on Home, not Auth | | |
| 1.4 | Logged-out user lands on Auth screen | | |
| 1.5 | App launches correctly after force-quit and reopen | | |

---

## 2. Orientation Lock

| # | Test | iOS | Android |
|---|------|-----|---------|
| 2.1 | App stays portrait when device is rotated to landscape | | |
| 2.2 | App stays portrait when device is rotated to reverse landscape | | |
| 2.3 | Rotation lock respected even on iPad (portrait + portrait-upside-down only) | | |
| 2.4 | Control Center rotation lock toggle has no effect (app enforces its own lock) | | |

---

## 3. Safe Areas & Status Bar

| # | Test | iOS | Android |
|---|------|-----|---------|
| 3.1 | Header clears the notch / Dynamic Island on iPhone 14 Pro+ | | |
| 3.2 | Header clears the notch on iPhone X–13 | | |
| 3.3 | Content does not bleed under status bar on older iPhones (SE, 8) | | |
| 3.4 | Bottom tab bar sits above the home indicator bar | | |
| 3.5 | Test screen footer sits above the home indicator bar | | |
| 3.6 | Status bar text is legible (light/dark) against app background | | |
| 3.7 | Android status bar + navigation bar insets respected (edge-to-edge) | | |
| 3.8 | Content not obscured by Android nav bar on gesture-nav devices | | |
| 3.9 | Content not obscured by Android 3-button nav on button-nav devices | | |

---

## 4. Offline Banner

| # | Test | iOS | Android |
|---|------|-----|---------|
| 4.1 | Enable Airplane Mode before launch — banner appears on first render | | |
| 4.2 | Enable Airplane Mode while app is open — banner appears within 1 s | | |
| 4.3 | Disable Airplane Mode — banner disappears within 1 s | | |
| 4.4 | Banner does not overlap header content (positioned above header) | | |
| 4.5 | Banner text is fully readable; icon visible | | |
| 4.6 | Banner respects safe-area-inset-top (not hidden behind notch) | | |
| 4.7 | Banner absent when online (no flash / residual element) | | |
| 4.8 | Toggle Airplane Mode 3× rapidly — no duplicate banners, no crash | | |

---

## 5. Authentication

| # | Test | iOS | Android |
|---|------|-----|---------|
| 5.1 | Sign-up with new email works end-to-end | | |
| 5.2 | Sign-in with existing credentials works | | |
| 5.3 | Wrong password shows error message | | |
| 5.4 | Forgot Password flow sends email | | |
| 5.5 | Session persists after app backgrounded 5+ minutes | | |
| 5.6 | Session persists after device restart (token stored natively) | | |
| 5.7 | Sign-out clears session and redirects to Auth | | |
| 5.8 | Deep link to reset-password page works from email | | |

---

## 6. Keyboard & Input

| # | Test | iOS | Android |
|---|------|-----|---------|
| 6.1 | Keyboard pushes content up — no input hidden behind keyboard | | |
| 6.2 | Tapping outside keyboard area dismisses keyboard | | |
| 6.3 | Fill-in-the-blank input in TestScreen scrolls into view when focused | | |
| 6.4 | Auth email/password fields are not obscured by keyboard | | |
| 6.5 | iOS "Return" key on email field moves focus to password field | | |
| 6.6 | Android Back key dismisses keyboard (not the screen) when keyboard open | | |
| 6.7 | Password field masks characters; eye toggle (if present) works | | |
| 6.8 | Autocorrect/autocapitalize disabled on password and answer fields | | |

---

## 7. Navigation — iOS

| # | Test | Notes |
|---|------|-------|
| 7.1 | Swipe-back gesture from TestScreen navigates to previous page | |
| 7.2 | Swipe-back does NOT trigger mid-question on TestScreen (disabled or guarded) | |
| 7.3 | Bottom tab bar taps switch tabs without full page reload | |
| 7.4 | Active tab indicator updates on tab change | |
| 7.5 | Control Center swipe-down does not interfere with in-app gestures | |
| 7.6 | Notification Center swipe-down does not interfere with scrolling | |
| 7.7 | Home indicator swipe-up exits app cleanly (no hang) | |

---

## 8. Navigation — Android

| # | Test | Notes |
|---|------|-------|
| 8.1 | Back button on Auth screen — no crash, shows confirmation or exits | |
| 8.2 | Back button on Home tab — app goes to background (not crash) | |
| 8.3 | Back button during test — prompts save/exit or navigates to practice | |
| 8.4 | Back button on Report screen — navigates to Home (not back to test) | |
| 8.5 | Gesture navigation (swipe from edge) works same as back button | |
| 8.6 | Bottom tab bar taps work with gesture nav active | |

---

## 9. Haptic Feedback (TestScreen)

| # | Test | iOS | Android |
|---|------|-----|---------|
| 9.1 | Correct answer — light haptic pulse felt | | |
| 9.2 | Wrong answer — medium haptic pulse felt (noticeably stronger) | | |
| 9.3 | Haptics work with Silent Mode on (iOS vibration still fires) | | |
| 9.4 | No crash when haptics unavailable (simulator / older device) | | |
| 9.5 | No duplicate haptic if Submit tapped quickly twice | | |

---

## 10. TestScreen — Question Flow

| # | Test | iOS | Android |
|---|------|-----|---------|
| 10.1 | MCQ options render correctly and are tappable | | |
| 10.2 | Selected MCQ option highlighted immediately on tap | | |
| 10.3 | Submit button disabled until an option is selected | | |
| 10.4 | Correct feedback (green panel + ✅) appears after submit | | |
| 10.5 | Wrong feedback (red panel + ❌ + correct answer) appears after submit | | |
| 10.6 | Next Question advances to next without re-rendering splash | | |
| 10.7 | Last question shows "See Results →" on next button | | |
| 10.8 | Timer counts up correctly and persists if app is backgrounded | | |
| 10.9 | Progress bar advances with each question | | |
| 10.10 | Fill-in-the-blank: keyboard appears, typed text saved | | |
| 10.11 | True/False/Not Given: all 3 options tappable, correct one highlighted | | |
| 10.12 | Reading passage scrollable independently of question area | | |
| 10.13 | "Save Progress & Exit" saves to localStorage and returns to practice | | |
| 10.14 | Returning to same exam resumes from saved question index | | |

---

## 11. Report Screen

| # | Test | iOS | Android |
|---|------|-----|---------|
| 11.1 | Report shows correct score percentage | | |
| 11.2 | All questions with user answers listed | | |
| 11.3 | Correct/incorrect indicators match actual results | | |
| 11.4 | "Try Again" resets and loads fresh question set | | |
| 11.5 | "Back to Home" navigates to / | | |
| 11.6 | Report survives app background + foreground without data loss | | |

---

## 12. Scrolling & Layout

| # | Test | iOS | Android |
|---|------|-----|---------|
| 12.1 | Home tab scrolls smoothly (60 fps) | | |
| 12.2 | Explore feed scrolls smoothly | | |
| 12.3 | Dashboard / progress page scrolls without jank | | |
| 12.4 | No content clipped by bottom tab bar (sufficient padding) | | |
| 12.5 | Glass cards render with backdrop-blur on both platforms | | |
| 12.6 | No horizontal scroll / overflow on any screen | | |
| 12.7 | Large text accessibility setting — layout does not break | | |

---

## 13. Backgrounding & Foregrounding

| # | Test | iOS | Android |
|---|------|-----|---------|
| 13.1 | App in background 30 s — resumes to correct screen | | |
| 13.2 | App in background 5 min — resumes; Supabase session still valid | | |
| 13.3 | App receives phone call mid-test — timer paused or acceptable drift | | |
| 13.4 | App backgrounded during test submit — result saved correctly | | |
| 13.5 | iOS app switcher snapshot does not show sensitive data | | |

---

## 14. Low Memory & Stress

| # | Test | iOS | Android |
|---|------|-----|---------|
| 14.1 | Open 5 heavy apps then return to TestTube — no crash | | |
| 14.2 | Complete 3 full tests back-to-back — no memory leak / slowdown | | |
| 14.3 | Android low-memory kill + relaunch — auth session restored | | |

---

## 15. Accessibility

| # | Test | iOS | Android |
|---|------|-----|---------|
| 15.1 | VoiceOver (iOS) / TalkBack (Android) reads tab labels | | |
| 15.2 | Interactive elements have accessible labels | | |
| 15.3 | Dynamic Type (iOS) — text scales, no clipping | | |
| 15.4 | High contrast mode — all text readable | | |
| 15.5 | Minimum tap target 44 × 44 pt on all buttons | | |

---

## 16. Subscription & Paywall

| # | Test | iOS | Android |
|---|------|-----|---------|
| 16.1 | Free user sees question count badge after 8+ questions | | |
| 16.2 | Daily limit reached — paywall screen shown instead of next question | | |
| 16.3 | "Upgrade to Premium" button routes to /pricing | | |
| 16.4 | Limit resets the following day (or after midnight) | | |

---

## 17. Admin Panel

| # | Test | iOS | Android |
|---|------|-----|---------|
| 17.1 | Admin tab only visible for users with is_admin = true | | |
| 17.2 | Non-admin direct navigation to /admin shows access denied | | |
| 17.3 | Admin can add/edit exams and questions | | |

---

## Sign-off

| Build | Date | Tester | Device | OS | Result |
|-------|------|--------|--------|----|--------|
| | | | | | |
| | | | | | |
