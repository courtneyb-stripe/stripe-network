import { Routes, Route, useLocation } from 'react-router-dom'
import { PrototypeProvider } from './context/PrototypeContext'
import Shell from './components/Shell'
import PrototypeHub from './screens/PrototypeHub'
import Overview from './screens/Overview'
import NetworkList from './screens/NetworkList'
import AccountDetail from './screens/AccountDetail'
import SettingsPage from './screens/SettingsPage'
import ActionRequiredDetail from './screens/ActionRequiredDetail'
import RiskAnalysis from './screens/RiskAnalysis'
import FinancialAccountsList from './screens/FinancialAccountsList'
import FinancialAccountDetail from './screens/FinancialAccountDetail'
import TransactionsList from './screens/TransactionsList'
import Components from './screens/Components'
import CapabilityExplorerPage from './screens/CapabilityExplorerPage'

function App() {
  const { pathname } = useLocation()
  const isPrototypeHub = pathname === '/'

  return (
    <div className="relative h-screen w-full bg-surface">
      <PrototypeProvider>
        <Routes>
          <Route path="/" element={<PrototypeHub />} />
          <Route path="/overview" element={<Shell><Overview /></Shell>} />
          <Route path="/network" element={<Shell><NetworkList /></Shell>} />
          <Route path="/network/capability-explorer" element={<Shell><CapabilityExplorerPage /></Shell>} />
          <Route path="/network/:id" element={<Shell><AccountDetail /></Shell>} />
          <Route path="/network/:id/settings" element={<Shell><SettingsPage /></Shell>} />
          <Route path="/network/:id/risk-analysis" element={<Shell><RiskAnalysis /></Shell>} />
          <Route path="/network/:id/financial-accounts" element={<Shell><FinancialAccountsList /></Shell>} />
          <Route path="/network/:id/financial-accounts/:faId" element={<Shell><FinancialAccountDetail /></Shell>} />
          <Route path="/network/:id/actions/:actionId" element={<Shell><ActionRequiredDetail /></Shell>} />
          <Route path="/transactions" element={<Shell><TransactionsList /></Shell>} />
          <Route path="/components" element={<Shell><Components /></Shell>} />
        </Routes>
      </PrototypeProvider>
    </div>
  )
}

export default App
