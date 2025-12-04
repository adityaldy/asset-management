import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Auth Pages
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Dashboard
import Dashboard from './pages/Dashboard';

// Assets
import AssetList from './pages/AssetList';
import AssetDetail from './pages/AssetDetail';
import AddAsset from './pages/AddAsset';
import EditAsset from './pages/EditAsset';

// Transactions
import TransactionList from './pages/TransactionList';
import Checkout from './pages/Checkout';
import Checkin from './pages/Checkin';

// Master Data
import Categories from './pages/Categories';
import Locations from './pages/Locations';
import Users from './pages/Users';

// Reports
import Reports from './pages/Reports';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Toaster 
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                        success: {
                            style: {
                                background: '#10B981',
                            },
                        },
                        error: {
                            style: {
                                background: '#EF4444',
                            },
                        },
                    }}
                />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    
                    {/* Protected Routes */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }>
                        {/* Dashboard */}
                        <Route index element={<Dashboard />} />
                        <Route path="dashboard" element={<Navigate to="/" replace />} />
                        
                        {/* Assets */}
                        <Route path="assets" element={<AssetList />} />
                        <Route path="assets/add" element={
                            <ProtectedRoute allowedRoles={['admin', 'staff']}>
                                <AddAsset />
                            </ProtectedRoute>
                        } />
                        <Route path="assets/:uuid" element={<AssetDetail />} />
                        <Route path="assets/:uuid/edit" element={
                            <ProtectedRoute allowedRoles={['admin', 'staff']}>
                                <EditAsset />
                            </ProtectedRoute>
                        } />
                        
                        {/* Transactions */}
                        <Route path="transactions" element={<TransactionList />} />
                        <Route path="transactions/checkout" element={
                            <ProtectedRoute allowedRoles={['admin', 'staff']}>
                                <Checkout />
                            </ProtectedRoute>
                        } />
                        <Route path="transactions/checkin" element={
                            <ProtectedRoute allowedRoles={['admin', 'staff']}>
                                <Checkin />
                            </ProtectedRoute>
                        } />
                        
                        {/* Master Data */}
                        <Route path="categories" element={<Categories />} />
                        <Route path="locations" element={<Locations />} />
                        <Route path="users" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <Users />
                            </ProtectedRoute>
                        } />
                        
                        {/* Reports */}
                        <Route path="reports" element={
                            <ProtectedRoute allowedRoles={['admin', 'staff']}>
                                <Reports />
                            </ProtectedRoute>
                        } />
                    </Route>
                    
                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
