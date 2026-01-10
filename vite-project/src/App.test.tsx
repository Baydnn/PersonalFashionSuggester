// Temporary test file - delete after testing
import { createRoot } from 'react-dom/client'

function TestApp() {
  return (
    <div style={{ 
      padding: '50px', 
      backgroundColor: 'red', 
      color: 'white',
      fontSize: '24px',
      textAlign: 'center'
    }}>
      TEST: If you see this red box, React is working!
    </div>
  )
}

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(<TestApp />)
}
