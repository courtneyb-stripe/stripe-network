import { Routes, Route } from 'react-router-dom'
import Shell from './components/Shell'
import Overview from './screens/Overview'
import NetworkList from './screens/NetworkList'
import AccountDetail from './screens/AccountDetail'

function App() {
  return (
    <div className="h-screen w-full bg-surface">
      <Shell>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/network" element={<NetworkList />} />
          <Route path="/account/:id" element={<AccountDetail />} />
        </Routes>
      </Shell>
    </div>
  )
}

export default App
