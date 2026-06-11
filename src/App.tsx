import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import WaybillCreate from '@/pages/WaybillCreate'
import Tracking from '@/pages/Tracking'
import Cost from '@/pages/Cost'
import Loading from '@/pages/Loading'
import Exception from '@/pages/Exception'
import Account from '@/pages/Account'

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/waybill/create" element={<WaybillCreate />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/cost" element={<Cost />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/exception" element={<Exception />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </Layout>
    </Router>
  )
}
