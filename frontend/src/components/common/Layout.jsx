import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <Header />
      <div className="main">
        <Sidebar />
        <main>{children}</main>
      </div>
    </div>
  );
}
