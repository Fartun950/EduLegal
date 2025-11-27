import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const LegalOfficerLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole="officer" />
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Header title="Legal Officer" userName="Legal Officer" userRole="officer" />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default LegalOfficerLayout

