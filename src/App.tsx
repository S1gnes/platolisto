import { useEffect } from 'react';
import { createHashRouter, Navigate, Outlet, ScrollRestoration, useLocation } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { Toaster } from './components/Toast';
import { useT } from './i18n';
import { Bartender } from './screens/Bartender';
import { Deals } from './screens/Deals';
import { Dishes } from './screens/Dishes';
import { Home } from './screens/Home';
import { ShoppingList } from './screens/List';
import { Onboarding } from './screens/Onboarding';
import { Plus } from './screens/Plus';
import { Profile } from './screens/Profile';
import { RecipeScreen } from './screens/Recipe';
import { Scan } from './screens/Scan';
import s from './App.module.css';

function RootLayout() {
  const t = useT();
  const { pathname } = useLocation();
  const dark = pathname.startsWith('/bartender');

  useEffect(() => {
    document.documentElement.lang = t.lang;
    document.title = t('meta.title');
  }, [t]);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.dataset.theme = 'bar';
    else delete root.dataset.theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#2A2118' : '#F6EFE4');
  }, [dark]);

  return (
    <div className={s.shell}>
      <Outlet />
      <Toaster />
      <ScrollRestoration />
    </div>
  );
}

const router = createHashRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/onboarding', element: <Onboarding /> },
      { path: '/scan', element: <Scan /> },
      { path: '/dishes', element: <Dishes /> },
      { path: '/recipe/:id', element: <RecipeScreen /> },
      { path: '/deals', element: <Deals /> },
      { path: '/list', element: <ShoppingList /> },
      { path: '/profile', element: <Profile /> },
      { path: '/plus', element: <Plus /> },
      { path: '/bartender', element: <Bartender /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
