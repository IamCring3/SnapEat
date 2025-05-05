import React from 'react';
import ReactDOM from 'react-dom/client';

function TestApp() {
  return (
    <div>
      <h1>Test Application</h1>
      <p>If you can see this, React is working correctly.</p>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<TestApp />);
}
