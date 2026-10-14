import sys

def inject_wakelock(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    wakelock_code = """
  // --- Screen Wake Lock API ---
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
          console.log('Screen Wake Lock is active');
        }
      } catch (err: any) {
        console.error(`${err.name}, ${err.message}`);
      }
    };

    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    requestWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (wakeLock !== null) {
        wakeLock.release().then(() => { wakeLock = null; });
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  // -----------------------------
"""
    
    if 'wakeLock' not in content:
        # Find where to inject: after the first useEffect or right after component mount
        # Let's just find the first useEffect and place it before it
        if 'useEffect(() => {' in content:
            content = content.replace('useEffect(() => {', wakelock_code + '\n  useEffect(() => {', 1)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Injected into {filepath}")
        else:
            print(f"Could not find injection point in {filepath}")
    else:
        print(f"WakeLock already in {filepath}")

inject_wakelock('src/app/pos/page.tsx')
inject_wakelock('src/app/customer-display/page.tsx')