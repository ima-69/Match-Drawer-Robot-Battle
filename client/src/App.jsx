import { Routes, Route, Link } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import ViewerPage from "./pages/ViewerPage";
import BracketPage from "./pages/BracketPage";
import TournamentList from "./pages/TournamentList";

function App() {
  return (
    <div className="h-screen flex flex-col">
      <nav className="p-4 bg-gray-800 flex justify-between text-white">
        <div className="flex gap-4">
          <Link to="/">Viewer</Link>
          <Link to="/tournaments">Tournaments</Link>
          <Link to="/admin">Admin</Link>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<ViewerPage />} />
          <Route path="/tournaments" element={<TournamentList />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/bracket/:id" element={<BracketPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;