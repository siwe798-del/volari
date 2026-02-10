import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
        <div className="d-flex align-items-center">
            <div className="navbar--logo" style={{backgroundImage: 'url(/assets/logos/logovolaris.png)', width: '120px', height: '2rem', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center'}} aria-label="Logo Volaris"></div>
            <div style={{width: '2px', height: '2.5rem', backgroundColor: '#e0e0e0', margin: '0 15px'}}></div>
            <div className="navbar--logo" style={{backgroundImage: 'url(/assets/logos/invexbancologo.png)', width: '120px', height: '2rem', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center'}} aria-label="Logo Invex"></div>
        </div>

        <div className="d-flex justify-content-center align-items-center">
        </div>
    </nav>
  );
};

export default Navbar;