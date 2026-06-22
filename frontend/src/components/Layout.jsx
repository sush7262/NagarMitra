import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Home, BarChart2, User, Plus, Map } from 'lucide-react'

export default function Layout() {
  const navigate = useNavigate()

  return (
    <>
      {/* Page content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Floating Action Button — Report Issue */}
      <button
        className="fab"
        onClick={() => navigate('/report')}
        aria-label="Report a civic issue"
        id="fab-report"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* Bottom Navigation */}
      <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          id="nav-home"
        >
          <Home size={22} />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          id="nav-dashboard"
        >
          <BarChart2 size={22} />
          <span>Dashboard</span>
        </NavLink>

        {/* Spacer for FAB */}
        <div style={{ flex: 1 }} aria-hidden="true" />

        <NavLink
          to="/profile"
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          id="nav-profile"
        >
          <User size={22} />
          <span>Profile</span>
        </NavLink>
      </nav>
    </>
  )
}
