import { useState } from "react";
import "./index.css";

import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import GamePage from "./pages/GamePage";
import LandingPage from "./pages/LandingPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("landing");

  return (
    <div className="site-shell">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />

      {currentPage === "landing" ? (
        <LandingPage onStartPrototype={() => setCurrentPage("game")} />
      ) : (
        <GamePage />
      )}

      <Footer />
    </div>
  );
}