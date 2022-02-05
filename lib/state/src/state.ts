declare const getApp;
const useAppInstance1 = (useState, useEffect) => {
  const [app, setApp] = useState(null);
  useEffect(() => {
    if (!app) {
      setApp(getApp());
    }
  }, []);
  return app;
};

const useAppState1 = (useState, useEffect, useCallback, name, initialValue) => {
  const app = useAppInstance1(useState, useEffect);
  const [state, setState] = useState(initialValue);
  useEffect(() => {
    if (app && !Reflect.has(app.globalData, name)) {
      app.globalData[name] = initialValue;
    } else if (app && Reflect.has(app.globalData, name)) {
      setState(app.globalData[name]);
    }

    if (app) {
      if (!Reflect.has(app, "stateCb")) {
        app.stateCb = {};
      }

      if (name in app.stateCb) {
        app.stateCb[name].add(setState);
      } else {
        app.stateCb[name] = new Set([setState]);
      }
    }

    return () => {
      if (app && app.stateCb && app.stateCb[name]) {
        app.stateCb[name].delete(setState);
      }
    };
  }, [app]);

  // 观察者模式
  const setter = useCallback(
    (v) => {
      if (app && app.stateCb) {
        const cbs = app.stateCb[name];
        cbs.forEach((fb) => fb(v));
        if (app) app.globalData[name] = typeof v === "function" ? v(state) : v;
      }
    },
    [app]
  );

  return [state, setter];
};
// 收集React系的hook依赖之后才能使用自定义hook
export const createAppHook = (useState, useEffect, useCallback) => {
  const useAppInstance = () => {
    return useAppInstance1(useState, useEffect);
  };
  const useAppState = (name: string, initialValue?: any) => {
    return useAppState1(useState, useEffect, useCallback, name, initialValue);
  };
  return { useAppInstance, useAppState };
};
