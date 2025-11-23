# 🚀 Button Quick Reference — Hercules App

**Use this as a quick checklist when implementing any new button.**

---

## ✅ Pre-Implementation Checklist

Before writing any button code:

- [ ] Identify button type: Navigation, Async Operation, or State Toggle
- [ ] Determine if operation can be concurrent (most can't)
- [ ] List all dependencies for the handler
- [ ] Decide if cleanup is needed on unmount

---

## 📝 Code Templates

### **Template 1: Simple Navigation Button**

```typescript
import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/atoms/Button';

const MyComponent: React.FC = () => {
  const router = useRouter();
  
  const handleNavigate = useCallback(() => {
    void Haptics.selectionAsync();
    router.push('/destination');
  }, [router]);
  
  return <Button label="Go" onPress={handleNavigate} />;
};
```

**Copy-paste for:** Back buttons, navigation buttons, tab switches

---

### **Template 2: Async Save/Submit Button**

```typescript
import React, { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/atoms/Button';

const MyComponent: React.FC = () => {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = useCallback(async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    void Haptics.selectionAsync();
    
    try {
      await performAction();
      setIsProcessing(false);
      router.push('/success');
    } catch (error) {
      console.error('Action failed:', error);
      setIsProcessing(false);
    }
  }, [isProcessing, router]);
  
  return (
    <Button 
      label="Submit" 
      onPress={handleSubmit}
      disabled={isProcessing}
      loading={isProcessing}
    />
  );
};
```

**Copy-paste for:** Save buttons, submit buttons, create buttons, finish buttons

---

### **Template 3: Button with Zustand Store**

```typescript
import React, { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/atoms/Button';
import { useMyStore } from '@/store/myStore';

const MyComponent: React.FC = () => {
  const router = useRouter();
  const performAction = useMyStore((state) => state.performAction);
  const setOverlayVisible = useMyStore((state) => state.setOverlayVisible);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleAction = useCallback(() => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    void Haptics.selectionAsync();
    
    // Reset blocking state
    setOverlayVisible(false);
    
    performAction();
    setIsProcessing(false);
    router.push('/next');
  }, [isProcessing, performAction, setOverlayVisible, router]);
  
  return (
    <Button 
      label="Action" 
      onPress={handleAction}
      disabled={isProcessing}
    />
  );
};
```

**Copy-paste for:** Start session, start workout, reset state

---

### **Template 4: Button with Cleanup Effect**

```typescript
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { useMyStore } from '@/store/myStore';

const MyComponent: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const setOverlayVisible = useMyStore((state) => state.setOverlayVisible);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsProcessing(false);
      setOverlayVisible(false);
    };
  }, [setOverlayVisible]);
  
  const handleAction = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      await doWork();
      setOverlayVisible(false);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, setOverlayVisible]);
  
  return <Button label="Action" onPress={handleAction} />;
};
```

**Copy-paste for:** Screens with overlays, modals, or blocking state

---

## 🔍 Common Mistakes

### ❌ **Mistake #1: Forgot useCallback**
```typescript
const handlePress = () => { ... }; // Creates new function every render!
```
**Fix:** `const handlePress = useCallback(() => { ... }, [deps]);`

---

### ❌ **Mistake #2: Missing Dependencies**
```typescript
const handlePress = useCallback(() => {
  console.log(count); // Uses count
}, []); // Missing count in deps!
```
**Fix:** `useCallback(() => { ... }, [count]);`

---

### ❌ **Mistake #3: No Guard Clause**
```typescript
const handleSubmit = async () => {
  await save(); // Can be called multiple times!
};
```
**Fix:** Add loading state + guard clause

---

### ❌ **Mistake #4: State Reset After Navigation**
```typescript
router.push('/next');
setOverlayVisible(false); // Too late! State blocks next screen
```
**Fix:** Reset state BEFORE navigation

---

## 🎯 Import Checklist

Always include:
```typescript
import React, { useCallback } from 'react'; // + useState, useEffect if needed
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/atoms/Button';
```

---

## 🧪 Quick Test

After implementing button:

1. **Single click** → Works? ✅
2. **Spam click 5x** → Only runs once? ✅
3. **Use twice in session** → Works second time? ✅
4. **Error scenario** → Recovers properly? ✅

If all pass → You're good! 🎉

---

## 📞 Need Help?

See full guide: `.windsurf/button-reliability-guide.md`

**Remember:** Memoize, Guard, Cleanup. Every time. 🔥
