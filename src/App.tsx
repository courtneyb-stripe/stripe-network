import Overview from './components/Overview'
import Shell from './components/Shell'

function App() {
  return (
    <div className="h-screen w-full bg-surface">
      <Shell>
        <Overview />
      </Shell>
    </div>
  )
}

export default App
