import { Routes, Route } from 'react-router-dom'
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
import AccountBusinessInvoicesList from './screens/AccountBusinessInvoicesList'
import AccountMoneyMovementList from './screens/AccountMoneyMovementList'
import AccountMoneyReceivedList from './screens/AccountMoneyReceivedList'
import AccountPaymentsCollectedList from './screens/AccountPaymentsCollectedList'
import AccountSubscriptionsList from './screens/AccountSubscriptionsList'
import AccountDirectoryList from './screens/AccountDirectoryList'
import Components from './screens/Components'
import CapabilityExplorerPage from './screens/CapabilityExplorerPage'
import GanttPage from './screens/GanttPage'

function App() {
  return (
    <div className="relative h-screen w-full bg-surface">
      <PrototypeProvider>
        <Routes>
          <Route path="/" element={<PrototypeHub />} />
          <Route path="/overview" element={<Shell><Overview /></Shell>} />
          <Route path="/network" element={<Shell><NetworkList /></Shell>} />
          {/* Also at root so this never competes with /network/:id (static segment must win, but this is easier to reason about). */}
          <Route path="/capability-explorer" element={<Shell><CapabilityExplorerPage /></Shell>} />
          <Route path="/network/browse/:audience" element={<Shell><NetworkList /></Shell>} />
          <Route path="/network/capability-explorer" element={<Shell><CapabilityExplorerPage /></Shell>} />
          <Route path="/network/:id/money-movement/:movementType" element={<Shell><AccountMoneyMovementList /></Shell>} />
          <Route path="/network/:id/money-received/:kind" element={<Shell><AccountMoneyReceivedList /></Shell>} />
          <Route path="/network/:id/payments-collected" element={<Shell><AccountPaymentsCollectedList /></Shell>} />
          <Route path="/network/:id/subscriptions" element={<Shell><AccountSubscriptionsList /></Shell>} />
          <Route path="/network/:id/directory/:segment" element={<Shell><AccountDirectoryList /></Shell>} />
          <Route path="/network/:id/invoices" element={<Shell><AccountBusinessInvoicesList /></Shell>} />
          <Route path="/network/:id/financial-accounts" element={<Shell><FinancialAccountsList /></Shell>} />
          <Route path="/network/:id/financial-accounts/:faId" element={<Shell><FinancialAccountDetail /></Shell>} />
          <Route path="/network/:id/actions/:actionId" element={<Shell><ActionRequiredDetail /></Shell>} />
          <Route path="/network/:id/settings" element={<Shell><SettingsPage /></Shell>} />
          <Route path="/network/:id/risk-analysis" element={<Shell><RiskAnalysis /></Shell>} />
          <Route path="/network/:id" element={<Shell><AccountDetail /></Shell>} />
          <Route path="/transactions" element={<Shell><TransactionsList /></Shell>} />
          <Route path="/components" element={<Shell><Components /></Shell>} />
          <Route path="/gantt" element={<Shell><GanttPage /></Shell>} />
        </Routes>
      </PrototypeProvider>
    </div>
  )
}

export default App
