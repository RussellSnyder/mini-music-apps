const BASE_URL = "/kaprekar-sequencer/";

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: "Home", href: BASE_URL },
  { label: "About", href: `${BASE_URL}about` },
];

export function Navbar() {
  return (
    <header className="topbar">
      <nav className="navbar" aria-label="Main navigation">
        <a href={BASE_URL} className="brand" aria-label="Home">
          Kaprekar Composition Tool
        </a>

        <div className="nav-links">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className="nav-link">
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
