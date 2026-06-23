import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Home, BarChart2, User, Plus, Map } from 'lucide-react'

export default function Layout() {
  const navigate = useNavigate()

  return (
    <div className="w-full bg-[var(--bg-primary)]">
      {/* Page content - Centered wrapper */}
      <main className="w-full max-w-2xl mx-auto px-4 md:px-6 min-h-screen flex flex-col pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 w-full z-50 bg-white border-t border-slate-200" role="navigation" aria-label="Main navigation">
        <div className="max-w-2xl mx-auto flex justify-between items-center px-4 py-2 relative">
          
          <NavLink
            to="/"
            end
            className={({ isActive }) => `flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors ${isActive ? 'bg-[#E6F4EA] text-[#059669]' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Home size={22} strokeWidth={1.5} />
            <span className="text-[0.65rem] font-medium mt-1">Home</span>
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) => `flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors ${isActive ? 'bg-[#E6F4EA] text-[#059669]' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <BarChart2 size={22} strokeWidth={1.5} />
            <span className="text-[0.65rem] font-medium mt-1">Analytics</span>
          </NavLink>

          {/* Central Plus Button */}
          <div className="flex flex-col items-center justify-center px-2">
            <button
              className="w-12 h-12 flex items-center justify-center rounded-xl text-white bg-[#059669] shadow-md shadow-emerald-200 cursor-pointer border-none"
              onClick={() => navigate('/report')}
              aria-label="Report a civic issue"
            >
              <Plus size={26} strokeWidth={2.5} />
            </button>
          </div>

          <NavLink
            to="/map"
            className={({ isActive }) => `flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors ${isActive ? 'bg-[#E6F4EA] text-[#059669]' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Map size={22} strokeWidth={1.5} />
            <span className="text-[0.65rem] font-medium mt-1">Map</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) => `flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors ${isActive ? 'bg-[#E6F4EA] text-[#059669]' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <User size={22} strokeWidth={1.5} />
            <span className="text-[0.65rem] font-medium mt-1">Profile</span>
          </NavLink>

        </div>
      </nav>
    </div>
  )
}
