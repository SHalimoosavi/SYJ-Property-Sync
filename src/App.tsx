import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "./i18n";
import { DemoStoreProvider } from "./services/demoStore";
import { Layout } from "./components/Layout";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import SyncCenter from "./pages/SyncCenter";
import ValidationCenter from "./pages/ValidationCenter";
import Connectors from "./pages/Connectors";
import AuditLog from "./pages/AuditLog";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <I18nProvider>
      <DemoStoreProvider>
        <HashRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              <Route path="/sync-center" element={<SyncCenter />} />
              <Route path="/validation" element={<ValidationCenter />} />
              <Route path="/connectors" element={<Connectors />} />
              <Route path="/audit-log" element={<AuditLog />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Dashboard />} />
            </Route>
          </Routes>
        </HashRouter>
      </DemoStoreProvider>
    </I18nProvider>
  );
}
