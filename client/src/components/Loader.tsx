import React from 'react';

const Loader: React.FC = () => {
    return (
        <div className="loader-overlay">
            <div className="loader-content">
                <div className="loader-logo" style={{backgroundImage: 'url(/assets/logos/logovolaris.png)', width: '150px', height: '50px', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', margin: '0 auto'}}></div>
                <div className="loader-spinner"></div>
            </div>
        </div>
    );
};

export default Loader;
