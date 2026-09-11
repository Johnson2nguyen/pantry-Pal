function Header() {
  return (
    <header>
      <h1 onClick={() => location.reload()} style={{ cursor: "pointer" }}>
        <span id="logo-emoji">🥘</span>
        <span className="pantry">Pantry</span>
        <span className="pal">Pal</span>
        <span id="header-name">Johnson Nguyen</span>
      </h1>
      <p>Turn what's in your kitchen into your next meal</p>
    </header>
  );
}

export default Header;
