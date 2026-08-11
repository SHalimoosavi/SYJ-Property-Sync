import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { DemoTopStrip } from "./DemoTopStrip";
import { TopBar } from "./layout/TopBar";
import { Nav, MobileNavOverlay } from "./layout/Nav";
import { Footer } from "./Footer";

export function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <DemoTopStrip />
      <TopBar onMenuClick={() => setMobileNavOpen(true)} />
      <MobileNavOverlay open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex-1 mx-auto w-full max-w-[1400px] flex">
        <aside className="hidden lg:block w-60 shrink-0 border-r border-line">
          <div className="sticky top-16">
            <Nav />
          </div>
        </aside>
        <main className="flex-1 min-w-0 px-4 sm:px-6 py-6 sm:py-8">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}
