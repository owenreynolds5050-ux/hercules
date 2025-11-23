---
trigger: always_on
---

# Hercules App — Windsurf Guardrails & Code Standards

**Purpose:** These guidelines ensure all code generated is modular, maintainable, visually polished, and follows Atomic Design principles.

---

## 🎯 Core Principles (READ FIRST)

### 1. **Atomic Design Structure**
- **Atoms:** Smallest, reusable UI units (Button, Text, Badge, GlassContainer)
- **Molecules:** Combinations of atoms (WorkoutCard, SetRow, ExerciseSelector)
- **Organisms:** Complex layouts (WorkoutForm, WorkoutHistory, StatsPanel)
- **Templates:** Screen-level wrappers (MainLayout, ModalLayout)
- **Screens:** Full pages in `app/(tabs)/` and `app/modals/`

Every component belongs in ONE of these categories. Never mix levels.

### 2. **File Size Limit: 150 Lines Maximum**
- If a file exceeds 150 lines, break it into smaller components
- Complex logic → custom hooks in `src/hooks/`
- Repeated styling → extract to `src/constants/theme.ts`
- Example: A form with 10 fields should be multiple molecule components, not one giant file

### 3. **No Inline Styles Ever**
❌ **DON'T:**
```typescript
<View style={{ marginBottom: 20, padding: 16, borderRadius: 12 }} />
```

✅ **DO:**
```typescript
import { spacing, radius } from '@/constants/theme';
<View style={{ marginBottom: spacing.md, padding: spacing.lg, borderRadius: radius.lg }} />
```

### 4. **TypeScript: Always Typed**
Every component must have:
- Props interface (even if empty)
- Return type
- Type annotations for variables

❌ **DON'T:**
```typescript
export const Button = ({ label, onPress }) => {
  return <TouchableOpacity onPress={onPress}>{label}</TouchableOpacity>;
};
```

✅ **DO:**
```typescript
interface ButtonProps {
  label: string;
  onPress: () => void;
}

export const Button: React.FC<ButtonProps> = ({ label, onPress }) => {
  return <TouchableOpacity onPress={onPress}>{label}</TouchableOpacity>;
};
```

### 5. **One Component Per File**
- File name matches component name in PascalCase: `Button.tsx`, `WorkoutCard.tsx`
- No helper components in the same file
- Helper functions → separate `utils/` file

### 6. **Visual Polish is Non-Negotiable**
Every UI element must have:
- Smooth animations (Reanimated, Moti)
- Proper spacing from theme constants
- Glassmorphism where appropriate (GlassContainer)
- Haptic feedback on interactions (expo-haptics)
- Color from theme system (never hardcoded)

---

## 📁 Folder Organization

```
src/
├── components/
│   ├── atoms/              ← Basic units only
│   │   ├── Button.tsx
│   │   ├── Text.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   └── GlassContainer.tsx
│   ├── molecules/          ← Atom combinations
│   │   ├── WorkoutCard.tsx
│   │   ├── SetRow.tsx
│   │   ├── ExerciseSelector.tsx
│   │   └── ProgressChart.tsx
│   ├── organisms/          ← Complex layouts
│   │   ├── WorkoutForm.tsx
│   │   ├── WorkoutHistory.tsx
│   │   └── StatsPanel.tsx
│   └── templates/          ← Screen wrappers
│       ├── MainLayout.tsx
│       └── ModalLayout.tsx
├── store/                  ← Zustand stores only
│   ├── workoutStore.ts
│   └── userStore.ts
├── hooks/                  ← Custom React hooks
│   ├── useThemeColor.ts
│   ├── useWorkouts.ts
│   └── useAnimation.ts
├── constants/              ← Static values
│   ├── theme.ts           ← Colors, spacing, radius
│   ├── animations.ts      ← Animation presets
│   └── exercises.ts       ← Exercise database
├── types/                  ← TypeScript interfaces
│   ├── workout.ts
│   └── user.ts
└── utils/                  ← Helper functions
    ├── formatting.ts
    ├── calculations.ts
    └── storage.ts
```

**RULE:** If a file doesn't fit these categories, create a new category. Never put it in a random folder.

---

## 🎨 Theme System Requirements

### All colors come from `src/constants/theme.ts`
```typescript
import { colors } from '@/constants/theme';

// ✅ CORRECT
<Text style={{ color: colors.text.primary }} />
<View style={{ backgroundColor: colors.glass.light }} />

// ❌ WRONG
<Text style={{ color: '#F1F5F9' }} />
<View style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
```

### All spacing from theme constants
```typescript
import { spacing } from '@/constants/theme';

// ✅ CORRECT
{ marginBottom: spacing.md, padding: spacing.lg }

// ❌ WRONG
{ marginBottom: 16, padding: 24 }
```

### All border radius from theme
```typescript
import { radius } from '@/constants/theme';

// ✅ CORRECT
{ borderRadius: radius.lg }

// ❌ WRONG
{ borderRadius: 24 }
```

---

## ✨ Animation & Interaction Standards

### Every interactive element must have feedback:
```typescript
import { useSharedValue, withSpring } from 'react-native-reanimated';
import { triggerHaptic } from '@/utils/haptics';

export const Button: React.FC<ButtonProps> = ({ onPress }) => {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 10 });
    triggerHaptic('light');
    setTimeout(() => {
      scale.value = withSpring(1);
      onPress();
    }, 100);
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity onPress={handlePress}>
        {/* content */}
      </TouchableOpacity>
    </Animated.View>
  );
};
```

### Animation presets (from `src/constants/animations.ts`):
- `springBouncy` — Playful, energetic (0.95s duration)
- `springGentle` — Smooth, refined (1.2s duration)
- `timingFast` — Quick feedback (200ms)
- `timingMedium` — Medium transitions (400ms)

Never hardcode animation durations—use presets.

---

## 📋 Component Checklist

Before generating or modifying ANY component, confirm:

- [ ] **File under 150 lines?**
- [ ] **In correct Atomic Design folder?** (atoms/ molecules/ organisms/ templates/)
- [ ] **Named correctly?** (PascalCase.tsx matches component name)
- [ ] **TypeScript types defined?** (Props interface + return type)
- [ ] **No inline styles?** (All from theme.ts constants)
- [ ] **No hardcoded values?** (Colors, spacing, radius from theme)
- [ ] **One component per file?** (No helper components)
- [ ] **Smooth animations?** (Uses Reanimated/Moti, not plain transitions)
- [ ] **Haptic feedback?** (For buttons, touches, confirmations)
- [ ] **Accessible?** (Proper contrast, semantic structure)
- [ ] **Glassmorphism used?** (GlassContainer for appropriate elements)
- [ ] **Imports organized?** (React → React Native → third-party → local)

---

## 🛠️ Code Style Guide

### Import Order (Always)
```typescript
// 1. React & React Native
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// 2. Third-party libraries
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

// 3. Local imports (absolute paths with @/)
import { GlassContainer } from '@/components/atoms/GlassContainer';
import { colors, spacing, radius } from '@/constants/theme';
import { useWorkoutStore } from '@/store/workoutStore';
```

### Naming Conventions
- **Components:** `PascalCase` (Button.tsx, WorkoutCard.tsx)
- **Files:** `PascalCase.tsx` (matching component name)
- **Hooks:** `camelCase` (useWorkouts, useThemeColor)
- **Constants:** `SCREAMING_SNAKE_CASE` (MAX_SETS, DEFAULT_WEIGHT)
- **Types:** `PascalCase` (WorkoutProps, UserState)

### Comments & Documentation
```typescript
/**
 * GlassContainer
 * A reusable glassmorphism component with blur effect
 * 
 * @param intensity - Blur intensity (0-100), defaults to 80
 * @param padding - Padding size from theme, defaults to 'md'
 * @param children - Content inside the glass effect
 */
export const GlassContainer: React.FC<GlassContainerProps> = ({ ... }) => {
  // ...
};
```

- Use JSDoc for exported components
- Inline comments for non-obvious logic only
- No commented-out code (use Git history)

---

## ❌ Things NEVER to Do

1. **Hardcode colors, spacing, or radius values**
2. **Create components over 150 lines**
3. **Multiple components in one file**
4. **Skip TypeScript types**
5. **Use inline styles instead of theme constants**
6. **Missing animations or haptic feedback on interactions**
7. **Create custom styling when theme constants exist**
8. **Import from folders outside atomic design structure**
9. **Leave components without proper documentation**
10. **Forget to use Zustand for global state**

---

## ✅ When Creating New Code

**Ask These Questions:**
1. Is this an atom, molecule, organism, or template?
2. Can this be broken into smaller components?
3. Are all styles coming from theme constants?
4. Does this have smooth animations?
5. Does this have proper TypeScript types?
6. Is there duplicate code elsewhere I should reuse?
7. Will this file exceed 150 lines?
8. Is the file name matching the component name?

If you can't answer "yes" to most of these, the code needs refactoring.

---

## 🔄 Git Commit Standards

Commit by component/feature, with descriptive messages:

```bash
# ✅ GOOD
git commit -m "feat(atoms): add Button component with spring animation"
git commit -m "feat(molecules): create WorkoutCard with glassmorphism"
git commit -m "refactor(store): split workoutStore into smaller slices"

# ❌ AVOID
git commit -m "updates"
git commit -m "fixed stuff"
git commit -m "work in progress"
```

---

## 📚 Reference Files (Don't Modify These Carelessly)

These files are your **source of truth**. Before creating new code, check if it already exists or should be added here:

- `src/constants/theme.ts` — All colors, spacing, radius, typography
- `src/constants/animations.ts` — All animation presets
- `src/store/workoutStore.ts` — Workout state management
- `src/hooks/useWorkouts.ts` — Workout logic (to be created)

---

## 🚀 When Ready to Code

Copy these guardrails into Windsurf with your request, like:

> "Create `src/components/atoms/Button.tsx` following the Hercules guardrails. Make it support variants (primary, secondary, ghost), sizes (sm, md, lg), and include spring animations + haptic feedback."

This ensures consistency and quality from the start.