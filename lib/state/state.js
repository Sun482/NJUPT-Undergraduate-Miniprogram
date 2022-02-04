export const useAppInstance = (useState, useEffect) => {
  const [app, setApp] = useState(null);
  useEffect(() => {
    if (!app) {
      setApp(getApp());
    }
  }, []);
  return app;
};
