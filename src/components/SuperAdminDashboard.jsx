import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Building2,
  Users,
  Mail,
  Phone,
  MapPin,
  Save,
  X,
  Loader2,
  RefreshCw,
  LogOut,
  Key,
  QrCode,
  Copy,
  Check
} from 'lucide-react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [copiedLink, setCopiedLink] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    adminUsername: '',
    adminPassword: '',
    adminName: '',
    restaurantName: '',
    restaurantPhone: '',
    restaurantEmail: '',
    restaurantAddress: '',
    restaurantPosition: [0, 0],
    restaurantLogo: ''
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const ensureToken = () => {
    if (!token) {
      window.alert('Your session has expired. Please sign in again.');
      navigate('/');
      return null;
    }
    return token;
  };

  const fetchOrganizations = async () => {
    const authToken = ensureToken();
    if (!authToken) return;

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/organizations', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch organizations');
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const authToken = ensureToken();
      if (!authToken) return;

      const response = await fetch('http://localhost:5000/api/organizations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setOrganizations([data.organization, ...organizations]);
        setShowCreateModal(false);
        resetForm();
        alert('Organization created successfully!\n\nCredentials:\n' +
              `OrgId: ${data.organization.orgId}\n` +
              `Username: ${data.admin.username}\n` +
              `Password: ${data.credentials.password}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create organization');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const authToken = ensureToken();
      if (!authToken) return;

      const response = await fetch(`http://localhost:5000/api/organizations/${selectedOrg.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        })
      });

      if (response.ok) {
        const updated = await response.json();
        setOrganizations(organizations.map(org => 
          org._id === selectedOrg.id ? updated : org
        ));
        setShowEditModal(false);
        setSelectedOrg(null);
        resetForm();
        alert('Organization updated successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update organization');
      }
    } catch (error) {
      console.error('Error updating organization:', error);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orgId) => {
    if (!window.confirm('Are you sure you want to deactivate this organization?')) {
      return;
    }

    const authToken = ensureToken();
    if (!authToken) return;

    try {
      setLoading(true);
      const org = organizations.find(o => o.orgId === orgId);
      
      const response = await fetch(`http://localhost:5000/api/organizations/${org._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setOrganizations(organizations.map(o => 
          o.orgId === orgId ? { ...o, isActive: false } : o
        ));
        alert('Organization deactivated successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to deactivate organization');
      }
    } catch (error) {
      console.error('Error deleting organization:', error);
      alert('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (org) => {
    const authToken = ensureToken();
    if (!authToken) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/organizations/${org._id}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedOrg(data);
        setShowViewModal(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch organization details');
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (org) => {
    setSelectedOrg(org);
    setFormData({
      name: org.name || '',
      email: org.email || '',
      phone: org.phone || '',
      address: org.address || '',
      adminUsername: '',
      adminPassword: '',
      adminName: '',
      restaurantName: '',
      restaurantPhone: '',
      restaurantEmail: '',
      restaurantAddress: '',
      restaurantPosition: [0, 0],
      restaurantLogo: ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      adminUsername: '',
      adminPassword: '',
      adminName: '',
      restaurantName: '',
      restaurantPhone: '',
      restaurantEmail: '',
      restaurantAddress: '',
      restaurantPosition: [0, 0],
      restaurantLogo: ''
    });
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  const handleViewPassword = async (org) => {
    const authToken = ensureToken();
    if (!authToken) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/organizations/${org._id}/users`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const users = await response.json();
        const adminUser = users.find(u => u.role === 'org_admin');
        if (adminUser) {
          setSelectedUser(adminUser);
          setSelectedOrg(org);
          setShowPasswordModal(true);
        } else {
          setError('Admin user not found');
        }
      } else {
        setError('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const authToken = ensureToken();
    if (!authToken) return;

    try {
      setLoading(true);
      setError('');
      const orgId = selectedOrg._id || selectedOrg.organization?._id;
      const response = await fetch(`http://localhost:5000/api/organizations/${orgId}/users/${selectedUser._id}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword })
      });

      if (response.ok) {
        alert('Password reset successfully!');
        setShowResetPasswordModal(false);
        setShowPasswordModal(false);
        setNewPassword('');
        setSelectedUser(null);
        setSelectedOrg(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const getCustomerLink = (orgId, tableNumber = '{tableNumber}') => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/qr-entry/${orgId}/${tableNumber}`;
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(''), 2000);
  };

  const filteredOrgs = organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.orgId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Define styles inside component to access isMobile state
  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: isMobile ? '1rem' : '2rem',
    marginTop: '60px',
    paddingBottom: '2rem'
  };

  const headerStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem'
  };

  const buttonStyle = {
    backgroundColor: '#FF0000',
    color: 'white',
    border: 'none',
    padding: isMobile ? '0.625rem 1rem' : '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontSize: isMobile ? '0.875rem' : '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: isMobile ? '1rem' : '1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #FFE5E5'
  };

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: isMobile ? '0.5rem' : '1rem'
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    borderRadius: isMobile ? '0.75rem' : '1rem',
    padding: isMobile ? '1rem' : '2rem',
    maxWidth: isMobile ? '100%' : '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    margin: isMobile ? '0.5rem' : '1rem'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={{ width: isMobile ? '100%' : 'auto' }}>
          <h1 style={{ 
            color: '#FF0000', 
            margin: 0, 
            fontSize: isMobile ? '1.5rem' : '2rem' 
          }}>
            Super Admin Dashboard
          </h1>
          <p style={{ 
            color: '#666', 
            marginTop: '0.5rem',
            fontSize: isMobile ? '0.875rem' : '1rem'
          }}>
            Manage Organizations & Restaurants
          </p>
        </div>
        <div style={{ 
          display: 'flex', 
          gap: isMobile ? '0.5rem' : '1rem', 
          alignItems: 'center',
          flexWrap: 'wrap',
          width: isMobile ? '100%' : 'auto'
        }}>
          <button
            onClick={fetchOrganizations}
            style={{ 
              ...buttonStyle, 
              backgroundColor: '#666',
              flex: isMobile ? '1 1 auto' : 'none',
              minWidth: isMobile ? '0' : 'auto'
            }}
          >
            <RefreshCw size={isMobile ? 16 : 18} />
            {isMobile ? '' : 'Refresh'}
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            style={{
              ...buttonStyle,
              flex: isMobile ? '1 1 auto' : 'none',
              minWidth: isMobile ? '0' : 'auto'
            }}
          >
            <PlusCircle size={isMobile ? 16 : 18} />
            {isMobile ? 'Create' : 'Create Organization'}
          </button>
          <button
            onClick={handleLogout}
            style={{ 
              ...buttonStyle, 
              backgroundColor: '#dc3545',
              flex: isMobile ? '1 1 auto' : 'none',
              minWidth: isMobile ? '0' : 'auto'
            }}
          >
            <LogOut size={isMobile ? 16 : 18} />
            {isMobile ? 'Logout' : 'Logout'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <Search 
            size={20} 
            style={{ 
              position: 'absolute', 
              left: '1rem', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#999'
            }} 
          />
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 3rem',
              border: '2px solid #FFE5E5',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#FFE5E5',
          color: '#FF0000',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Organizations List */}
      {loading && !organizations.length ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Loader2 size={48} className="animate-spin" style={{ color: '#FF0000' }} />
          <p style={{ marginTop: '1rem', color: '#666' }}>Loading organizations...</p>
        </div>
      ) : filteredOrgs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Building2 size={64} style={{ color: '#ccc', marginBottom: '1rem' }} />
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            {searchQuery ? 'No organizations found' : 'No organizations yet. Create your first one!'}
          </p>
        </div>
      ) : (
        <div>
          {filteredOrgs.map((org) => (
            <div key={org._id} style={cardStyle}>
              <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between', 
                alignItems: isMobile ? 'flex-start' : 'flex-start',
                gap: isMobile ? '1rem' : '0'
              }}>
                <div style={{ flex: 1, width: '100%' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    <Building2 size={isMobile ? 20 : 24} style={{ color: '#FF0000' }} />
                    <h3 style={{ 
                      margin: 0, 
                      color: '#333', 
                      fontSize: isMobile ? '1rem' : '1.25rem' 
                    }}>
                      {org.name}
                    </h3>
                    {!org.isActive && (
                      <span style={{
                        backgroundColor: '#ffcccc',
                        color: '#cc0000',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        Inactive
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#666', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <Mail size={16} />
                      <span>{org.email}</span>
                    </div>
                    {org.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <Phone size={16} />
                        <span>{org.phone}</span>
                      </div>
                    )}
                    {org.address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <MapPin size={16} />
                        <span>{org.address}</span>
                      </div>
                    )}
                  </div>
                  <div style={{
                    backgroundColor: '#F8F9FA',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    color: '#666',
                    marginBottom: '0.5rem'
                  }}>
                    OrgId: {org.orgId}
                  </div>
                  
                  {/* Direct Ordering Toggle */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    backgroundColor: '#F8F9FA',
                    borderRadius: '0.5rem',
                    marginBottom: '0.5rem',
                    border: '1px solid #E0E0E0'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#333', marginBottom: '0.25rem' }}>
                        Direct Ordering
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>
                        {org.settings?.allowDirectOrdering !== false 
                          ? 'Customers can place orders directly' 
                          : 'Waiter confirmation mode'}
                      </div>
                    </div>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={org.settings?.allowDirectOrdering !== false}
                        onChange={async (e) => {
                          const authToken = ensureToken();
                          if (!authToken) return;
                          
                          try {
                            const orgId = org._id || org.id;
                            const response = await fetch(`http://localhost:5000/api/organizations/${orgId}`, {
                              method: 'PUT',
                              headers: {
                                'Authorization': `Bearer ${authToken}`,
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                settings: {
                                  ...org.settings,
                                  allowDirectOrdering: e.target.checked
                                }
                              })
                            });

                            if (response.ok) {
                              const updated = await response.json();
                              setOrganizations(organizations.map(o => 
                                o._id === orgId || o.id === orgId ? { ...o, ...updated } : o
                              ));
                              message.success('Setting updated successfully!');
                            } else {
                              const errorData = await response.json();
                              message.error(errorData.error || 'Failed to update setting');
                            }
                          } catch (error) {
                            console.error('Error updating setting:', error);
                            message.error('Error updating setting');
                          }
                        }}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                    </label>
                  </div>
                  
                  {/* Customer Access Link */}
                  <div style={{
                    backgroundColor: '#E8F5E9',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    marginTop: '0.5rem',
                    border: '1px solid #C8E6C9'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <QrCode size={16} style={{ color: '#4CAF50' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#2E7D32' }}>
                        Customer Access Link Template:
                      </span>
                    </div>
                    <div style={{
                      backgroundColor: 'white',
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                      marginBottom: '0.5rem',
                      color: '#666'
                    }}>
                      {getCustomerLink(org.orgId)}
                    </div>
                    <p style={{ 
                      fontSize: '0.7rem', 
                      color: '#666', 
                      margin: '0.25rem 0 0.5rem 0',
                      fontStyle: 'italic'
                    }}>
                      Replace {'{tableNumber}'} with actual table number (e.g., 1, 2, 3...)
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      backgroundColor: 'white',
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      wordBreak: 'break-all'
                    }}>
                      <span style={{ flex: 1 }}>{getCustomerLink(org.orgId)}</span>
                      <button
                        onClick={() => copyToClipboard(getCustomerLink(org.orgId), org.orgId)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          border: '1px solid #4CAF50',
                          borderRadius: '0.25rem',
                          backgroundColor: copiedLink === org.orgId ? '#4CAF50' : 'white',
                          color: copiedLink === org.orgId ? 'white' : '#4CAF50',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.75rem'
                        }}
                        title="Copy link template"
                      >
                        {copiedLink === org.orgId ? (
                          <>
                            <Check size={14} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  flexWrap: 'wrap',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: isMobile ? 'flex-start' : 'flex-end'
                }}>
                  <button
                    onClick={() => handleView(org)}
                    style={{
                      padding: isMobile ? '0.625rem' : '0.5rem',
                      border: '1px solid #FFE5E5',
                      borderRadius: '0.5rem',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: isMobile ? '0.75rem' : 'inherit'
                    }}
                    title="View Details"
                  >
                    <Eye size={isMobile ? 16 : 18} style={{ color: '#666' }} />
                    {isMobile && <span>View</span>}
                  </button>
                  <button
                    onClick={() => handleEdit(org)}
                    style={{
                      padding: isMobile ? '0.625rem' : '0.5rem',
                      border: '1px solid #FFE5E5',
                      borderRadius: '0.5rem',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: isMobile ? '0.75rem' : 'inherit'
                    }}
                    title="Edit"
                  >
                    <Edit size={isMobile ? 16 : 18} style={{ color: '#666' }} />
                    {isMobile && <span>Edit</span>}
                  </button>
                  <button
                    onClick={() => handleViewPassword(org)}
                    style={{
                      padding: isMobile ? '0.625rem' : '0.5rem',
                      border: '1px solid #FFE5E5',
                      borderRadius: '0.5rem',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: isMobile ? '0.75rem' : 'inherit'
                    }}
                    title="View/Reset Password"
                  >
                    <Key size={isMobile ? 16 : 18} style={{ color: '#FF9800' }} />
                    {isMobile && <span>Password</span>}
                  </button>
                  <button
                    onClick={() => handleDelete(org.orgId)}
                    style={{
                      padding: isMobile ? '0.625rem' : '0.5rem',
                      border: '1px solid #FFE5E5',
                      borderRadius: '0.5rem',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: isMobile ? '0.75rem' : 'inherit'
                    }}
                    title="Deactivate"
                  >
                    <Trash2 size={isMobile ? 16 : 18} style={{ color: '#FF0000' }} />
                    {isMobile && <span>Delete</span>}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div style={modalStyle} onClick={() => setShowCreateModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#FF0000', margin: 0 }}>Create Organization</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '600' }}>
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #FFE5E5', borderRadius: '0.5rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '600' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #FFE5E5', borderRadius: '0.5rem' }}
                  />
                </div>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                  gap: '1rem' 
                }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '600' }}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid #FFE5E5', borderRadius: '0.5rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '600' }}>
                      Restaurant Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.restaurantPhone}
                      onChange={(e) => setFormData({ ...formData, restaurantPhone: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid #FFE5E5', borderRadius: '0.5rem' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '600' }}>
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #FFE5E5', borderRadius: '0.5rem' }}
                  />
                </div>
                <div style={{ borderTop: '2px solid #FFE5E5', paddingTop: '1rem', marginTop: '1rem' }}>
                  <h3 style={{ color: '#FF0000', marginBottom: '1rem' }}>Admin User</h3>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '600' }}>
                        Admin Username *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.adminUsername}
                        onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', border: '2px solid #FFE5E5', borderRadius: '0.5rem' }}
                      />
                    </div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', 
                      gap: '1rem' 
                    }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '600' }}>
                          Admin Password *
                        </label>
                        <input
                          type="password"
                          required
                          value={formData.adminPassword}
                          onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', border: '2px solid #FFE5E5', borderRadius: '0.5rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '600' }}>
                          Admin Name
                        </label>
                        <input
                          type="text"
                          value={formData.adminName}
                          onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', border: '2px solid #FFE5E5', borderRadius: '0.5rem' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ borderTop: '2px solid #FFE5E5', paddingTop: '1rem', marginTop: '1rem' }}>
                  <h3 style={{ color: '#FF0000', marginBottom: '1rem' }}>Restaurant Details (Optional)</h3>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '600' }}>
                        Restaurant Name
                      </label>
                      <input
                        type="text"
                        value={formData.restaurantName}
                        onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', border: '2px solid #FFE5E5', borderRadius: '0.5rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '600' }}>
                        Restaurant Email
                      </label>
                      <input
                        type="email"
                        value={formData.restaurantEmail}
                        onChange={(e) => setFormData({ ...formData, restaurantEmail: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', border: '2px solid #FFE5E5', borderRadius: '0.5rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '600' }}>
                        Restaurant Address
                      </label>
                      <textarea
                        value={formData.restaurantAddress}
                        onChange={(e) => setFormData({ ...formData, restaurantAddress: e.target.value })}
                        rows={2}
                        style={{ width: '100%', padding: '0.75rem', border: '2px solid #FFE5E5', borderRadius: '0.5rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                gap: '1rem', 
                marginTop: '1.5rem' 
              }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ ...buttonStyle, flex: 1, width: isMobile ? '100%' : 'auto' }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Create Organization
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '2px solid #FFE5E5',
                    borderRadius: '0.5rem',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    color: '#666',
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedOrg && (
        <div style={modalStyle} onClick={() => setShowViewModal(false)}>
          <div style={{
            ...modalContentStyle, 
            maxWidth: isMobile ? '100%' : '800px'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#FF0000', margin: 0 }}>Organization Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>
            {selectedOrg.organization && (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                  <h3 style={{ color: '#333', marginBottom: '1rem', borderBottom: '2px solid #FFE5E5', paddingBottom: '0.5rem' }}>
                    Organization Information
                  </h3>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div><strong>Name:</strong> {selectedOrg.organization.name}</div>
                    <div><strong>Email:</strong> {selectedOrg.organization.email}</div>
                    <div><strong>Phone:</strong> {selectedOrg.organization.phone || 'N/A'}</div>
                    <div><strong>Address:</strong> {selectedOrg.organization.address || 'N/A'}</div>
                    <div><strong>OrgId:</strong> <code style={{ backgroundColor: '#F8F9FA', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>{selectedOrg.organization.orgId}</code></div>
                    <div><strong>Status:</strong> 
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        marginLeft: '0.5rem',
                        backgroundColor: selectedOrg.organization.isActive ? '#E8F5E9' : '#FFE5E5',
                        color: selectedOrg.organization.isActive ? '#2E7D32' : '#C62828'
                      }}>
                        {selectedOrg.organization.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      marginTop: '0.75rem',
                      padding: '0.75rem',
                      backgroundColor: '#F8F9FA',
                      borderRadius: '0.5rem',
                      border: '1px solid #E0E0E0'
                    }}>
                      <strong style={{ flex: 1 }}>Allow Direct Ordering:</strong>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedOrg.organization.settings?.allowDirectOrdering !== false}
                          onChange={async (e) => {
                            const authToken = ensureToken();
                            if (!authToken) return;
                            
                            try {
                              const orgId = selectedOrg.organization._id || selectedOrg.organization.id;
                              const response = await fetch(`http://localhost:5000/api/organizations/${orgId}`, {
                                method: 'PUT',
                                headers: {
                                  'Authorization': `Bearer ${authToken}`,
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                  settings: {
                                    ...selectedOrg.organization.settings,
                                    allowDirectOrdering: e.target.checked
                                  }
                                })
                              });

                              if (response.ok) {
                                const updated = await response.json();
                                setSelectedOrg({
                                  ...selectedOrg,
                                  organization: updated
                                });
                                setOrganizations(organizations.map(org => 
                                  org._id === orgId || org.id === orgId ? { ...org, ...updated } : org
                                ));
                                alert('Setting updated successfully!');
                              } else {
                                const errorData = await response.json();
                                alert(errorData.error || 'Failed to update setting');
                              }
                            } catch (error) {
                              console.error('Error updating setting:', error);
                              alert('Error updating setting');
                            }
                          }}
                          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <span style={{ 
                          color: selectedOrg.organization.settings?.allowDirectOrdering !== false ? '#2E7D32' : '#666',
                          fontWeight: '500'
                        }}>
                          {selectedOrg.organization.settings?.allowDirectOrdering !== false ? 'Enabled' : 'Disabled'}
                        </span>
                      </label>
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#666', 
                      marginTop: '0.25rem',
                      fontStyle: 'italic',
                      paddingLeft: '0.5rem'
                    }}>
                      {selectedOrg.organization.settings?.allowDirectOrdering !== false 
                        ? 'Customers can place orders directly' 
                        : 'Customers can only view menu and request waiter confirmation'}
                    </div>
                    <div><strong>Created:</strong> {new Date(selectedOrg.organization.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                {selectedOrg.restaurant && (
                  <div>
                    <h3 style={{ color: '#333', marginBottom: '1rem', borderBottom: '2px solid #FFE5E5', paddingBottom: '0.5rem' }}>
                      Restaurant Details
                    </h3>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      <div><strong>Name:</strong> {selectedOrg.restaurant.name}</div>
                      <div><strong>Email:</strong> {selectedOrg.restaurant.email || 'N/A'}</div>
                      <div><strong>Phone:</strong> {selectedOrg.restaurant.phone || 'N/A'}</div>
                      <div><strong>Address:</strong> {selectedOrg.restaurant.address || 'N/A'}</div>
                      {selectedOrg.restaurant.position && selectedOrg.restaurant.position[0] !== 0 && (
                        <div>
                          <strong>Location:</strong> 
                          <a 
                            href={`https://www.google.com/maps?q=${selectedOrg.restaurant.position[0]},${selectedOrg.restaurant.position[1]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ marginLeft: '0.5rem', color: '#FF0000' }}
                          >
                            View on Map
                          </a>
                        </div>
                      )}
                      {selectedOrg.restaurant.logo && (
                        <div>
                          <strong>Logo:</strong>
                          <img 
                            src={selectedOrg.restaurant.logo} 
                            alt="Restaurant Logo" 
                            style={{ 
                              maxWidth: '100px', 
                              maxHeight: '100px', 
                              marginLeft: '0.5rem',
                              borderRadius: '0.5rem',
                              border: '1px solid #FFE5E5'
                            }} 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {selectedOrg.admin && (
                  <div>
                    <h3 style={{ color: '#333', marginBottom: '1rem', borderBottom: '2px solid #FFE5E5', paddingBottom: '0.5rem' }}>
                      Admin User
                    </h3>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      <div><strong>Username:</strong> {selectedOrg.admin.username}</div>
                      <div><strong>Name:</strong> {selectedOrg.admin.name || 'N/A'}</div>
                      <div><strong>Email:</strong> {selectedOrg.admin.email || 'N/A'}</div>
                      <div><strong>Role:</strong> {selectedOrg.admin.role}</div>
                      <div><strong>Status:</strong> 
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          marginLeft: '0.5rem',
                          backgroundColor: selectedOrg.admin.isActive ? '#E8F5E9' : '#FFE5E5',
                          color: selectedOrg.admin.isActive ? '#2E7D32' : '#C62828'
                        }}>
                          {selectedOrg.admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {selectedOrg.admin.lastLogin && (
                        <div><strong>Last Login:</strong> {new Date(selectedOrg.admin.lastLogin).toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <h3 style={{ color: '#333', marginBottom: '1rem', borderBottom: '2px solid #FFE5E5', paddingBottom: '0.5rem' }}>
                    Customer Access
                  </h3>
                  <div style={{
                    backgroundColor: '#E8F5E9',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #C8E6C9'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <QrCode size={20} style={{ color: '#4CAF50' }} />
                      <strong style={{ color: '#2E7D32' }}>Customer Access Link Template (QR Code):</strong>
                    </div>
                    <div style={{
                      backgroundColor: 'white',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                      marginBottom: '0.5rem',
                      color: '#666'
                    }}>
                      {getCustomerLink(selectedOrg.organization.orgId)}
                    </div>
                    <p style={{ fontSize: '0.7rem', color: '#666', margin: '0 0 0.75rem 0', fontStyle: 'italic' }}>
                      Replace {'{tableNumber}'} with actual table number (e.g., 1, 2, 3...) when generating QR codes
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      backgroundColor: 'white',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ flex: 1 }}>{getCustomerLink(selectedOrg.organization.orgId)}</span>
                      <button
                        onClick={() => copyToClipboard(getCustomerLink(selectedOrg.organization.orgId), 'view')}
                        style={{
                          padding: '0.5rem',
                          border: '1px solid #4CAF50',
                          borderRadius: '0.5rem',
                          backgroundColor: copiedLink === 'view' ? '#4CAF50' : 'white',
                          color: copiedLink === 'view' ? 'white' : '#4CAF50',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.875rem'
                        }}
                      >
                        {copiedLink === 'view' ? (
                          <>
                            <Check size={16} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div style={{
                      backgroundColor: '#FFF3E0',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #FFE0B2',
                      marginTop: '0.5rem'
                    }}>
                      <p style={{ fontSize: '0.75rem', color: '#E65100', margin: 0, fontWeight: '600' }}>
                        💡 Example: For Table 5, the link would be:
                      </p>
                      <p style={{ fontSize: '0.7rem', color: '#666', margin: '0.25rem 0 0 0', fontFamily: 'monospace' }}>
                        {getCustomerLink(selectedOrg.organization.orgId, '5')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Password View/Reset Modal */}
      {showPasswordModal && selectedOrg && selectedUser && (
        <div style={modalStyle} onClick={() => {
          setShowPasswordModal(false);
          setShowResetPasswordModal(false);
          setSelectedUser(null);
          setNewPassword('');
        }}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#FF0000', margin: 0 }}>Password Management</h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setShowResetPasswordModal(false);
                  setSelectedUser(null);
                  setNewPassword('');
                }}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>
            
            {!showResetPasswordModal ? (
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ color: '#333', marginBottom: '1rem' }}>User Information</h3>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div><strong>Organization:</strong> {selectedOrg.name}</div>
                    <div><strong>Username:</strong> {selectedUser.username}</div>
                    <div><strong>Name:</strong> {selectedUser.name || 'N/A'}</div>
                    <div><strong>Role:</strong> {selectedUser.role}</div>
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: '#FFF3E0',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1.5rem',
                  border: '1px solid #FFE0B2'
                }}>
                  <p style={{ margin: 0, color: '#E65100', fontWeight: '600' }}>
                    ⚠️ Passwords are encrypted and cannot be viewed for security reasons.
                  </p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#666' }}>
                    You can reset the password to a new one below.
                  </p>
                </div>
                
                <button
                  onClick={() => setShowResetPasswordModal(true)}
                  style={{
                    ...buttonStyle,
                    width: '100%',
                    backgroundColor: '#FF9800'
                  }}
                >
                  <Key size={18} />
                  Reset Password
                </button>
              </div>
            ) : (
              <div>
                <h3 style={{ color: '#333', marginBottom: '1rem' }}>Reset Password</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '600' }}>
                    New Password *
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #FFE5E5',
                      borderRadius: '0.5rem',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div style={{ 
                display: 'flex', 
                flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                gap: '1rem' 
              }}>
                  <button
                    onClick={handleResetPassword}
                    disabled={loading || !newPassword || newPassword.length < 6}
                    style={{
                      ...buttonStyle,
                      flex: 1,
                      backgroundColor: '#FF9800',
                      opacity: (!newPassword || newPassword.length < 6) ? 0.5 : 1,
                      cursor: (!newPassword || newPassword.length < 6) ? 'not-allowed' : 'pointer',
                      width: isMobile ? '100%' : 'auto'
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Reset Password
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowResetPasswordModal(false);
                      setNewPassword('');
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: '2px solid #FFE5E5',
                      borderRadius: '0.5rem',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      color: '#666',
                      width: isMobile ? '100%' : 'auto'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedOrg && (
        <div style={modalStyle} onClick={() => setShowEditModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#FF0000', margin: 0 }}>Edit Organization</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedOrg(null);
                }}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '600' }}>
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #FFE5E5', borderRadius: '0.5rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '600' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #FFE5E5', borderRadius: '0.5rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '600' }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #FFE5E5', borderRadius: '0.5rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '600' }}>
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #FFE5E5', borderRadius: '0.5rem' }}
                  />
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                gap: '1rem', 
                marginTop: '1.5rem' 
              }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ ...buttonStyle, flex: 1, width: isMobile ? '100%' : 'auto' }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Update Organization
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedOrg(null);
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '2px solid #FFE5E5',
                    borderRadius: '0.5rem',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    color: '#666',
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;

