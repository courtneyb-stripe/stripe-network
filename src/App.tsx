import { Routes, Route } from 'react-router-dom'
import Shell from './components/Shell'
import Overview from './screens/Overview'
import NetworkList from './screens/NetworkList'
import AccountDetail from './screens/AccountDetail'
import ActionRequiredDetail from './screens/ActionRequiredDetail'
import RiskAnalysis from './screens/RiskAnalysis'
import FinancialAccountsList from './screens/FinancialAccountsList'
import FinancialAccountDetail from './screens/FinancialAccountDetail'
import TransactionsList from './screens/TransactionsList'
import Components from './screens/Components'

function App() {
  return (
    <div className="h-screen w-full bg-surface">
      <Shell>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/network" element={<NetworkList />} />
          <Route path="/network/:id" element={<AccountDetail />} />
          <Route path="/network/:id/risk-analysis" element={<RiskAnalysis />} />
          <Route path="/network/:id/financial-accounts" element={<FinancialAccountsList />} />
          <Route path="/network/:id/financial-accounts/:faId" element={<FinancialAccountDetail />} />
          <Route path="/network/:id/actions/:actionId" element={<ActionRequiredDetail />} />
          <Route path="/transactions" element={<TransactionsList />} />
          <Route path="/components" element={<Components />} />
        </Routes>
      </Shell>
    </div>
  )
}

export default App
