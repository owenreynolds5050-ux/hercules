# 🎯 Button Reliability Guide — Hercules App

**Purpose:** Ensure 100% first-click reliability for all buttons across the Hercules app by following proven patterns for state management, handler memoization, and async operation handling.

---

## 📋 Table of Contents

1. [Core Principles](#core-principles)
2. [Common Button Reliability Issues](#common-button-reliability-issues)
3. [The Reliability Checklist](#the-reliability-checklist)
4. [Implementation Patterns](#implementation-patterns)
5. [Real-World Examples](#real-world-examples)
6. [Testing Your Buttons](#testing-your-buttons)
7. [Troubleshooting Guide](#troubleshooting-guide)

---

## 🎯 Core Principles

### **Rule #1: Always Memoize Button Handlers**
Every function passed to `onPress` must be wrapped with `useCallback` and include proper dependencies.

**Why?** Unmemoized handlers create new function references on every render, causing:
- Stale closures (referencing old state/props)
- Button components re-rendering unnecessarily
- Race conditions in async operations
- Unreliable button presses after multiple interactions

### **Rule #2: Prevent Concurrent Operations**
For async operations (especially navigation or data persistence), use loading states to prevent multiple simultaneous executions.

**Why?** Users can tap buttons multiple times rapidly, causing:
- Duplicate API calls
- State corruption
- Navigation bugs
- Blocked UI from overlays

### **Rule #3: Reset State Before and After Critical Operations**
Always clean up state that could block future interactions (e.g., modal visibility, loading flags, overlays).

**Why?** Lingering state from previous operations can:
- Block touch events on subsequent interactions
- Cause buttons to appear responsive but not execute
- Create frustrating user experiences

---

## ⚠️ Common Button Reliability Issues

### **Issue #1: Stale Closures**
```typescript
❌ BAD - Handler not memoized, creates stale closure
const MyComponent = () => {
  const [count, setCount] = useState(0);
  
  const handlePress = () => {
    console.log(count); // Always logs initial value!
  };
  
  return <Button onPress={handlePress} />;
};

✅ GOOD - Properly memoized with dependencies
const MyComponent = () => {
  const [count, setCount] = useState(0);
  
  const handlePress = useCallback(() => {
    console.log(count); // Always logs current value
  }, [count]);
  
  return <Button onPress={handlePress} />;
};
```

### **Issue #2: Race Conditions in Async Operations**
```typescript
❌ BAD - No protection against concurrent calls
const handleFinish = async () => {
  const result = await saveData();
  router.push('/success');
};

✅ GOOD - Loading state prevents concurrent operations
const [isProcessing, setIsProcessing] = useState(false);

const handleFinish = useCallback(async () => {
  if (isProcessing) return; // Guard clause
  
  setIsProcessing(true);
  try {
    const result = await saveData();
    router.push('/success');
  } finally {
    setIsProcessing(false);
  }
}, [isProcessing, router]);
```

### **Issue #3: Blocking Overlay State**
```typescript
❌ BAD - Overlay state not reset before new operation
const handleStart = () => {
  startSession();
  router.push('/session');
};

✅ GOOD - Explicitly reset blocking state
const handleStart = useCallback(() => {
  setCompletionOverlayVisible(false); // Clear any lingering overlays
  startSession();
  router.push('/session');
}, [startSession, router, setCompletionOverlayVisible]);
```

---

## ✅ The Reliability Checklist

Before implementing ANY button, verify:

- [ ] **Handler is memoized** with `useCallback`
- [ ] **All dependencies** are in the dependency array
- [ ] **Loading state** exists for async operations
- [ ] **Guard clause** prevents concurrent execution (if async)
- [ ] **Haptic feedback** is triggered (for UX polish)
- [ ] **State cleanup** happens on success AND error
- [ ] **Blocking states** (overlays, modals) are reset appropriately
- [ ] **Button disabled state** reflects loading/processing status
- [ ] **Navigation happens AFTER** state cleanup (not before)
- [ ] **Cleanup effect** on unmount if state could block future use

---

## 🛠️ Implementation Patterns

### **Pattern 1: Simple Navigation Button**

```typescript
import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/atoms/Button';

const MyComponent: React.FC = () => {
  const router = useRouter();
  
  const handleNavigate = useCallback(() => {
    void Haptics.selectionAsync();
    router.push('/target-screen');
  }, [router]);
  
  return <Button label="Go" onPress={handleNavigate} />;
};
```

**Key Points:**
- ✅ Memoized with `useCallback`
- ✅ Router in dependency array
- ✅ Haptic feedback for UX
- ✅ Type-safe component

---

### **Pattern 2: Async Operation Button (Save, Submit, Finish)**

```typescript
import React, { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/atoms/Button';

const MyComponent: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = useCallback(async () => {
    // Guard: Prevent concurrent submissions
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    void Haptics.selectionAsync();
    
    try {
      const result = await submitData();
      
      if (!result.success) {
        throw new Error('Submission failed');
      }
      
      // Reset state BEFORE navigation
      setIsSubmitting(false);
      router.replace('/success');
    } catch (error) {
      console.error('[MyComponent] Submit failed:', error);
      setIsSubmitting(false);
      
      // Show error to user
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [isSubmitting, router]);
  
  return (
    <Button 
      label="Submit" 
      onPress={handleSubmit}
      loading={isSubmitting}
      disabled={isSubmitting}
    />
  );
};
```

**Key Points:**
- ✅ Loading state prevents double-clicks
- ✅ Guard clause at start
- ✅ State reset BEFORE navigation
- ✅ Error handling included
- ✅ Loading/disabled props on button
- ✅ Try-finally for guaranteed cleanup

---

### **Pattern 3: Button with State Management (Zustand)**

```typescript
import React, { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/atoms/Button';
import { useMyStore } from '@/store/myStore';

const MyComponent: React.FC = () => {
  const router = useRouter();
  const startSession = useMyStore((state) => state.startSession);
  const setOverlayVisible = useMyStore((state) => state.setOverlayVisible);
  const [isStarting, setIsStarting] = useState(false);
  
  const handleStart = useCallback(() => {
    if (isStarting) return;
    
    setIsStarting(true);
    void Haptics.selectionAsync();
    
    // Reset any blocking overlays from previous operations
    setOverlayVisible(false);
    
    // Start session
    startSession();
    
    setIsStarting(false);
    router.push('/session');
  }, [isStarting, startSession, setOverlayVisible, router]);
  
  return (
    <Button 
      label="Start Session" 
      onPress={handleStart}
      disabled={isStarting}
    />
  );
};
```

**Key Points:**
- ✅ All store selectors in dependencies
- ✅ Overlay state explicitly reset
- ✅ Guard clause for concurrent operations
- ✅ Clean state flow

---

### **Pattern 4: Button in Memoized Component (FlatList, useMemo)**

```typescript
import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/atoms/Button';

const MyComponent: React.FC = () => {
  const handleAction = useCallback(() => {
    void Haptics.selectionAsync();
    performAction();
  }, []);
  
  // IMPORTANT: Include handler in dependency array
  const footerComponent = useMemo(
    () => (
      <View>
        <Button label="Action" onPress={handleAction} />
      </View>
    ),
    [handleAction] // ← CRITICAL: Must include handler
  );
  
  return <FlatList ListFooterComponent={footerComponent} />;
};
```

**Key Points:**
- ✅ Handler memoized with `useCallback`
- ✅ Memoized component includes handler in deps
- ✅ Prevents stale closure bugs

---

### **Pattern 5: Multiple Buttons with Shared State**

```typescript
import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/atoms/Button';

const MyComponent: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSave = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      await saveData();
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);
  
  const handleCancel = useCallback(() => {
    if (isProcessing) return; // Don't allow cancel during save
    void Haptics.selectionAsync();
    router.back();
  }, [isProcessing, router]);
  
  return (
    <View>
      <Button 
        label="Save" 
        onPress={handleSave}
        loading={isProcessing}
        disabled={isProcessing}
      />
      <Button 
        label="Cancel" 
        onPress={handleCancel}
        disabled={isProcessing}
      />
    </View>
  );
};
```

**Key Points:**
- ✅ Shared loading state across buttons
- ✅ All buttons disabled during processing
- ✅ Prevents conflicting operations

---

### **Pattern 6: Cleanup Effect for Blocking State**

```typescript
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Button } from '@/components/atoms/Button';
import { useMyStore } from '@/store/myStore';

const MyComponent: React.FC = () => {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const setOverlayVisible = useMyStore((state) => state.setOverlayVisible);
  
  // Cleanup effect: Reset state on unmount
  useEffect(() => {
    return () => {
      setIsProcessing(false);
      setOverlayVisible(false);
    };
  }, [setOverlayVisible]);
  
  const handleFinish = useCallback(async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      await finishOperation();
      setOverlayVisible(false); // Reset before navigation
      router.replace('/complete');
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, setOverlayVisible, router]);
  
  return <Button label="Finish" onPress={handleFinish} />;
};
```

**Key Points:**
- ✅ Cleanup effect on unmount
- ✅ Resets blocking state
- ✅ Prevents state leaking to next mount

---

## 🎬 Real-World Examples from Hercules

### **Example 1: Finish Workout Button**
**Location:** `app/workout-session.tsx`

```typescript
const [isFinishingWorkout, setIsFinishingWorkout] = useState(false);

const handleFinishWorkout = useCallback(async () => {
  // Prevent concurrent finish operations
  if (isFinishingWorkout) {
    return;
  }

  setIsFinishingWorkout(true);

  const workout = endSession();

  if (!workout) {
    setIsFinishingWorkout(false);
    return;
  }

  setCompletionOverlayVisible(true);

  try {
    await addWorkout(workout);
    // Reset overlay BEFORE navigation to prevent blocking
    setCompletionOverlayVisible(false);
    setIsFinishingWorkout(false);
    router.replace('/(tabs)/workout');
  } catch (error) {
    console.error('[workout-session] Failed to persist workout', error);
    setCompletionOverlayVisible(false);
    setIsFinishingWorkout(false);
    router.replace('/(tabs)');
  }
}, [isFinishingWorkout, endSession, setCompletionOverlayVisible, addWorkout, router]);

// In JSX:
<Button 
  label="Finish Workout" 
  onPress={handleFinishWorkout}
  disabled={!hasExercises || isFinishingWorkout}
  loading={isFinishingWorkout}
/>
```

**What Makes This Reliable:**
1. ✅ Loading state prevents double-clicks
2. ✅ Guard clause at the start
3. ✅ Overlay reset before navigation (critical!)
4. ✅ Error handling with cleanup
5. ✅ Button reflects processing state
6. ✅ All dependencies included

---

### **Example 2: Start Workout from Plan**
**Location:** `app/(tabs)/index.tsx`

```typescript
const handlePlanActionStart = useCallback(() => {
  if (!todaysPlan) {
    return;
  }

  void Haptics.selectionAsync();

  // Explicitly reset overlay state before starting new session
  setCompletionOverlayVisible(false);

  const workoutExercises: WorkoutExercise[] = todaysPlan.exercises.map((exercise) => ({
    name: exercise.name,
    sets: createDefaultSetLogs(),
  }));

  startSession(todaysPlan.id, workoutExercises);
  router.push('/(tabs)/workout');
}, [todaysPlan, startSession, router, setCompletionOverlayVisible]);
```

**What Makes This Reliable:**
1. ✅ Early return if no data
2. ✅ Haptic feedback
3. ✅ **Overlay reset before session start** (prevents blocking future sessions)
4. ✅ Proper memoization
5. ✅ All dependencies included

---

### **Example 3: Delete Plan (Confirmation Dialog)**
**Location:** `app/(tabs)/plans.tsx`

```typescript
const confirmDeletePlan = useCallback(async () => {
  if (!pendingDeletePlan) {
    return;
  }

  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

  // Update schedules that reference this plan
  schedules.forEach((schedule: Schedule) => {
    const nextWeekdays = { ...schedule.weekdays };
    let didUpdate = false;

    (Object.keys(nextWeekdays) as (keyof Schedule['weekdays'])[]).forEach((day) => {
      if (nextWeekdays[day] === pendingDeletePlan.id) {
        nextWeekdays[day] = null;
        didUpdate = true;
      }
    });

    if (didUpdate) {
      void updateSchedule({ ...schedule, weekdays: nextWeekdays });
    }
  });

  void removePlan(pendingDeletePlan.id);
  setExpandedPlanId((prev) => (prev === pendingDeletePlan.id ? null : prev));
  setPendingDeletePlan(null); // Close dialog
}, [pendingDeletePlan, removePlan, schedules, updateSchedule]);
```

**What Makes This Reliable:**
1. ✅ Guard clause for missing data
2. ✅ Warning haptic for destructive action
3. ✅ Cascade updates to related data
4. ✅ State cleanup at end
5. ✅ Proper memoization

---

## 🧪 Testing Your Buttons

### **Manual Test Checklist:**

1. **Single Click Test**
   - Click button once
   - Verify action completes successfully
   - ✅ Pass if works on first click

2. **Rapid Click Test**
   - Click button 5+ times rapidly
   - Verify only ONE operation executes
   - ✅ Pass if no duplicate operations

3. **Repeated Operation Test**
   - Complete full user flow (e.g., finish workout)
   - Immediately repeat the same flow
   - Verify button works on first click
   - ✅ Pass if works every time

4. **Error Recovery Test**
   - Trigger operation with network error
   - Verify button becomes clickable again
   - Retry operation
   - ✅ Pass if recovers properly

5. **State Cleanup Test**
   - Start operation that shows overlay
   - Complete operation
   - Start new operation
   - Verify no visual artifacts or blocking state
   - ✅ Pass if clean

### **Automated Test Pattern:**

```typescript
describe('Button Reliability', () => {
  it('should handle rapid clicks without duplicate operations', async () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(<Button label="Test" onPress={mockOnPress} />);
    
    const button = getByText('Test');
    
    // Rapid fire clicks
    fireEvent.press(button);
    fireEvent.press(button);
    fireEvent.press(button);
    
    // Should only call once if loading state prevents duplicates
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
```

---

## 🔧 Troubleshooting Guide

### **Problem: Button works first time, then stops working**

**Likely Cause:** Stale overlay or modal state blocking touch events

**Solution:**
1. Check for any overlays/modals that might be visible
2. Add explicit state resets before starting new operations
3. Add cleanup effect on component unmount

```typescript
// Add cleanup effect
useEffect(() => {
  return () => {
    setOverlayVisible(false);
    setModalVisible(false);
  };
}, [setOverlayVisible]);
```

---

### **Problem: Button requires multiple clicks to work**

**Likely Cause:** Stale closure from unmemoized handler

**Solution:**
1. Wrap handler with `useCallback`
2. Include all dependencies in array
3. Verify memoized components include handler in deps

```typescript
// Before
const handlePress = () => { ... };

// After
const handlePress = useCallback(() => { ... }, [dep1, dep2]);
```

---

### **Problem: Button executes action multiple times**

**Likely Cause:** No guard clause for concurrent operations

**Solution:**
1. Add loading state
2. Add guard clause at start of handler
3. Disable button during operation

```typescript
const [isProcessing, setIsProcessing] = useState(false);

const handlePress = useCallback(async () => {
  if (isProcessing) return; // Guard clause
  
  setIsProcessing(true);
  try {
    await doWork();
  } finally {
    setIsProcessing(false);
  }
}, [isProcessing]);
```

---

### **Problem: Button disabled but handler still fires**

**Likely Cause:** Handler not checking disabled state

**Solution:**
1. Add guard clause checking the disabled condition
2. Verify button `disabled` prop is set
3. Check if parent component is blocking touches

```typescript
const handlePress = useCallback(() => {
  if (isDisabled || isLoading) return;
  // ... rest of handler
}, [isDisabled, isLoading]);
```

---

## 📚 Quick Reference

### **Import Checklist:**
```typescript
import React, { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/atoms/Button';
```

### **Template for Async Button:**
```typescript
const [isProcessing, setIsProcessing] = useState(false);

const handleAction = useCallback(async () => {
  if (isProcessing) return;
  
  setIsProcessing(true);
  void Haptics.selectionAsync();
  
  try {
    await performAction();
    // Reset state before navigation
    setIsProcessing(false);
    router.push('/success');
  } catch (error) {
    console.error('Action failed:', error);
    setIsProcessing(false);
  }
}, [isProcessing, router]);

return (
  <Button 
    label="Action" 
    onPress={handleAction}
    disabled={isProcessing}
    loading={isProcessing}
  />
);
```

---

## 🎯 Summary

**Three Rules for 100% Reliable Buttons:**

1. **ALWAYS MEMOIZE** handlers with `useCallback` + proper dependencies
2. **PREVENT CONCURRENCY** with loading states and guard clauses
3. **CLEAN UP STATE** before navigation and on unmount

**Follow these patterns, and your buttons will work perfectly on the first click, every time.**

---

**Document Version:** 1.0  
**Last Updated:** Nov 16, 2025  
**Maintained By:** Hercules Development Team
