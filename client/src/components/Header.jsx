function Header() {
  return (
    <header>
      <h1 onClick={() => location.reload()} style={{ cursor: "pointer" }}>
        <span id="logo-emoji">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="7"
              y="14"
              width="18"
              height="11"
              rx="2"
              stroke="#e8a838"
              strokeWidth="2"
            />
            <path
              d="M4 17H7"
              stroke="#e8a838"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M25 17H28"
              stroke="#e8a838"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M9 14C9 12 11 11 16 11C21 11 23 12 23 14"
              stroke="#e8a838"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect x="14" y="8" width="4" height="2" rx="1" fill="#e8a838" />
          </svg>
        </span>
        <span className="pantry">Pantry</span>
        <span className="pal">Pal</span>
        <span id="header-name">Johnson Nguyen</span>
      </h1>
      <p>Turn what's in your kitchen into your next meal</p>
    </header>
  );
}

export default Header;
