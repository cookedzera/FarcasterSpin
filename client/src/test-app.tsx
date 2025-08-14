// Simple test app to debug rendering issues
function TestApp() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2c2c2e 0%, #1c1c1e 50%, #2c2c2e 100%)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        ARB<span style={{ color: '#60a5fa' }}>CASINO</span>
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', textAlign: 'center' }}>
        🎰 Arbitrum Testnet Token Casino
      </p>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '2rem',
        borderRadius: '1rem',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#22d3ee' }}>Testnet Ready!</h2>
        <p style={{ marginBottom: '1rem' }}>
          ✓ Server running on port 5000<br/>
          ✓ PostgreSQL database connected<br/>
          ✓ Testnet tokens configured<br/>
          ✓ Unlimited spins enabled for testing
        </p>
        <button 
          style={{
            background: 'linear-gradient(135deg, #22d3ee, #4ade80)',
            border: 'none',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
          onClick={() => window.location.reload()}
        >
          🎡 Test Spin Ready
        </button>
      </div>
    </div>
  );
}

export default TestApp;