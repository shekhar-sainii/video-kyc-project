import React from "react";
import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import routes from "./routeConfig";
import AppLayout from "../layouts/AppLayout";
import ProtectedRoute from "../auth/ProtectedRoute";
import PublicRoute from "../auth/PublicRoute";
import PageLoader from "../components/common/PageLoader";

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader text="Loading page..." />}>
      <Routes>
        {routes.map((route, index) => {
          const Page = route.component;

          let element = (
            <AppLayout layout={route.layout}>
              <Page />
            </AppLayout>
          );

          if (route.protected || route.permission) {
            element = (
              <ProtectedRoute permission={route.permission}>
                {element}
              </ProtectedRoute>
            );
          }

          if (route.guestOnly) {
            element = (
              <PublicRoute>
                {element}
              </PublicRoute>
            );
          }

          // Error pages (no layout)
          if (!route.layout) {
            element = <Page />;
          }

          return (
            <Route
              key={index}
              path={route.path}
              element={element}
            />
          );
        })}
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
