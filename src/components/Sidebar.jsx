import { NavLink } from 'react-router-dom'

const links = [
  { to: '/personas', label: 'Personas' },
  { to: '/aportes', label: 'Aportes' },
  { to: '/prestamos', label: 'Préstamos' },
  { to: '/rifas', label: 'Rifas' },
  { to: '/liquidacion', label: 'Liquidación' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        Natillera
        <span>Libro de cuentas</span>
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
