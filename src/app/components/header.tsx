// components/Header.js
"use client";
import Link from 'next/link';

const Header = () => {
  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <h1 style={styles.title}>Smart Canteen</h1>
        <nav style={styles.nav}>
          <Link href="/login" style={styles.button}>
            Login
          </Link>
          <Link href="/signup" style={{ ...styles.button, backgroundColor: '#007bff' }}>
            Sign Up
          </Link>
        </nav>
      </div>
    </header>
  );
};

import { CSSProperties } from 'react';

const styles: { [key: string]: CSSProperties } = {
  header: {
    backgroundColor: '#333',
    padding: '10px 20px',
    color: 'white',
    textAlign: 'center',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '2rem',
    margin: 0,
  },
  nav: {
    display: 'flex',
    gap: '15px',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '5px',
    backgroundColor: '#28a745',
    color: 'white',
    textDecoration: 'none',
    textAlign: 'center',
    transition: 'background-color 0.3s',
  },
};

export default Header;
