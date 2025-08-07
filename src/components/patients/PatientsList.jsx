/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Table, Button, Switch, message, Modal, Tag } from "antd";
import Header from '../Header';
import Sidebar from '../Sidebar';
import { onShowSizeChange, itemRender } from '../Pagination'
import { 
    blogimg10, imagesend, pdficon, pdficon3, pdficon4, plusicon, 
    refreshicon, searchnormal, blogimg12, blogimg2, blogimg4, 
    blogimg6, blogimg8 
} from '../imagepath';
import { Link } from 'react-router-dom';

// Import the management service - adjust the path based on your project structure
// You might need to change this path depending on where you place the managementService.js file
import { managementService } from '../../services/ManagementService';

const { confirm } = Modal;

const PatientsList = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showActiveOnly, setShowActiveOnly] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [apiError, setApiError] = useState(false);

    // Cargar usuarios al montar el componente y cuando cambie el filtro
    useEffect(() => {
        loadUsers();
    }, [showActiveOnly]);

    const loadUsers = async () => {
        setLoading(true);
        setApiError(false);
        try {
            let userData;
            if (showActiveOnly) {
                userData = await managementService.getActiveUsers();
            } else {
                // Obtener todos los usuarios y filtrar por inactivos
                const allUsers = await managementService.getAllUsers();
                userData = allUsers.filter(user => !user.isActive());
            }
            setUsers(userData);
        } catch (error) {
            console.error('Error loading users:', error);
            setApiError(true);
            
            // Fallback to mock data if API is not available
            try {
                const mockUsers = managementService.getMockUsers();
                const filteredMockUsers = showActiveOnly 
                    ? mockUsers.filter(user => user.isActive())
                    : mockUsers.filter(user => !user.isActive());
                setUsers(filteredMockUsers);
                message.warning('API no disponible, mostrando datos de ejemplo');
            } catch (mockError) {
                message.error('Error al cargar los usuarios');
                setUsers([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const onSelectChange = (newSelectedRowKeys) => {
        console.log("selectedRowKeys changed: ", newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    // Buscar usuarios
    const handleSearch = async (value) => {
        if (!value.trim()) {
            loadUsers();
            return;
        }
        
        setLoading(true);
        try {
            const searchResults = await managementService.searchUsers(value);
            // Filtrar por estado si es necesario
            const filteredResults = showActiveOnly 
                ? searchResults.filter(user => user.isActive())
                : searchResults.filter(user => !user.isActive());
            setUsers(filteredResults);
        } catch (error) {
            console.error('Error searching users:', error);
            
            // Fallback to local search if API search fails
            try {
                const currentUsers = apiError ? managementService.getMockUsers() : await managementService.getAllUsers();
                const searchTerm = value.toLowerCase();
                const localSearchResults = currentUsers.filter(user => 
                    (user.firstname.toLowerCase().includes(searchTerm) ||
                     user.lastname.toLowerCase().includes(searchTerm) ||
                     user.email.toLowerCase().includes(searchTerm) ||
                     user.documentNumber.includes(searchTerm)) &&
                    (showActiveOnly ? user.isActive() : !user.isActive())
                );
                setUsers(localSearchResults);
                message.warning('Búsqueda realizada localmente');
            } catch (fallbackError) {
                message.error('Error al buscar usuarios');
            }
        } finally {
            setLoading(false);
        }
    };

    // Desactivar usuario (eliminación lógica)
    const handleDeactivateUser = async (userId, userName) => {
        confirm({
            title: `¿Estás seguro de desactivar a ${userName}?`,
            content: 'El usuario será desactivado pero no eliminado permanentemente.',
            icon: <img src={imagesend} alt="#" width={50} height={46} />,
            okText: 'Sí, desactivar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await managementService.deactivateUser(userId);
                    message.success('Usuario desactivado correctamente');
                    loadUsers(); // Recargar la lista
                } catch (error) {
                    console.error('Error deactivating user:', error);
                    if (apiError) {
                        message.warning('Función no disponible en modo offline');
                    } else {
                        message.error('Error al desactivar el usuario');
                    }
                }
            },
        });
    };

    // Restaurar usuario
    const handleRestoreUser = async (userId, userName) => {
        confirm({
            title: `¿Estás seguro de restaurar a ${userName}?`,
            content: 'El usuario será reactivado en el sistema.',
            okText: 'Sí, restaurar',
            okType: 'primary',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await managementService.restoreUser(userId);
                    message.success('Usuario restaurado correctamente');
                    loadUsers(); // Recargar la lista
                } catch (error) {
                    console.error('Error restoring user:', error);
                    if (apiError) {
                        message.warning('Función no disponible en modo offline');
                    } else {
                        message.error('Error al restaurar el usuario');
                    }
                }
            },
        });
    };

    // Eliminar físicamente (solo para usuarios inactivos)
    const handleDeleteUser = async (userId, userName) => {
        confirm({
            title: `¿Estás seguro de eliminar permanentemente a ${userName}?`,
            content: 'Esta acción no se puede deshacer. El usuario será eliminado completamente del sistema.',
            icon: <img src={imagesend} alt="#" width={50} height={46} />,
            okText: 'Sí, eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    const result = await managementService.deleteUserPhysically(userId);
                    if (result) {
                        message.success('Usuario eliminado permanentemente');
                        loadUsers(); // Recargar la lista
                    } else {
                        message.error('No se pudo encontrar el usuario para eliminar');
                    }
                } catch (error) {
                    console.error('Error deleting user:', error);
                    if (apiError) {
                        message.warning('Función no disponible en modo offline');
                    } else {
                        message.error('Error al eliminar el usuario');
                    }
                }
            },
        });
    };

    const columns = [
        {
            title: "Nombre",
            dataIndex: "firstname",
            key: "name",
            sorter: (a, b) => a.firstname.localeCompare(b.firstname),
            render: (text, record) => (
                <>
                    <h2 className="profile-image">
                        <Link to="#" className="avatar avatar-sm me-2">
                            <img
                                className="avatar-img rounded-circle"
                                src={record.userImage || blogimg2}
                                alt="#"
                            />
                        </Link>
                        <Link to="#">{`${record.firstname} ${record.lastname}`}</Link>
                        {record.isActive() ? (
                            <Tag color="green" style={{ marginLeft: '8px' }}>Activo</Tag>
                        ) : (
                            <Tag color="red" style={{ marginLeft: '8px' }}>Inactivo</Tag>
                        )}
                    </h2>
                </>
            )
        },
        {
            title: "Tipo Documento",
            dataIndex: "documentType",
            sorter: (a, b) => a.documentType.localeCompare(b.documentType)
        },
        {
            title: "Número Documento",
            dataIndex: "documentNumber",
            sorter: (a, b) => a.documentNumber.localeCompare(b.documentNumber)
        },
        {
            title: "Rol",
            dataIndex: "role",
            sorter: (a, b) => a.role.localeCompare(b.role)
        },
        {
            title: "Teléfono",
            dataIndex: "phone",
            sorter: (a, b) => a.phone.localeCompare(b.phone),
            render: (text, record) => (
                <Link to="#">{record.phone}</Link>
            )
        },
        {
            title: "Email",
            dataIndex: "email",
            sorter: (a, b) => a.email.localeCompare(b.email)
        },
        {
            title: "Fecha Creación",
            dataIndex: "createdAt",
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (text, record) => 
                record.createdAt ? record.createdAt.toLocaleDateString() : 'N/A'
        },
        {
            title: "Acciones",
            dataIndex: "actions",
            render: (text, record) => (
                <div className="text-end">
                    <div className="dropdown dropdown-action">
                        <Link
                            to="#"
                            className="action-icon dropdown-toggle"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <i className="fas fa-ellipsis-v" />
                        </Link>
                        <div className="dropdown-menu dropdown-menu-end">
                            <Link className="dropdown-item" to={`/editpatients/${record.id}`}>
                                <i className="far fa-edit me-2" />
                                Editar
                            </Link>
                            {record.isActive() ? (
                                <Link 
                                    className="dropdown-item" 
                                    to="#" 
                                    onClick={() => handleDeactivateUser(record.id, `${record.firstname} ${record.lastname}`)}
                                >
                                    <i className="fa fa-ban me-2"></i>
                                    Desactivar
                                </Link>
                            ) : (
                                <>
                                    <Link 
                                        className="dropdown-item" 
                                        to="#"
                                        onClick={() => handleRestoreUser(record.id, `${record.firstname} ${record.lastname}`)}
                                    >
                                        <i className="fa fa-undo me-2"></i>
                                        Restaurar
                                    </Link>
                                    <Link 
                                        className="dropdown-item" 
                                        to="#"
                                        onClick={() => handleDeleteUser(record.id, `${record.firstname} ${record.lastname}`)}
                                    >
                                        <i className="fa fa-trash-alt me-2"></i>
                                        Eliminar Permanentemente
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <>
            <Header />
            <Sidebar id='menu-item2' id1='menu-items2' activeClassName='patient-list' />
            <div className="page-wrapper">
                <div className="content">
                    {/* Page Header */}
                    <div className="page-header">
                        <div className="row">
                            <div className="col-sm-12">
                                <ul className="breadcrumb">
                                    <li className="breadcrumb-item">
                                        <Link to="#">Usuarios</Link>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <i className="feather-chevron-right" />
                                    </li>
                                    <li className="breadcrumb-item active">
                                        Lista de Usuarios {showActiveOnly ? 'Activos' : 'Inactivos'}
                                        {apiError && (
                                            <span className="badge badge-warning ms-2">Modo Offline</span>
                                        )}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    {/* /Page Header */}
                    
                    {/* API Status Alert */}
                    {apiError && (
                        <div className="alert alert-warning" role="alert">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            La API no está disponible. Mostrando datos de ejemplo. Algunas funciones pueden no estar disponibles.
                        </div>
                    )}
                    
                    <div className="row">
                        <div className="col-sm-12">
                            <div className="card card-table show-entire">
                                <div className="card-body">
                                    {/* Table Header */}
                                    <div className="page-table-header mb-2">
                                        <div className="row align-items-center">
                                            <div className="col">
                                                <div className="doctor-table-blk">
                                                    <h3>
                                                        Lista de Usuarios {showActiveOnly ? 'Activos' : 'Inactivos'}
                                                        <span style={{ marginLeft: '20px' }}>
                                                            <Switch
                                                                checked={showActiveOnly}
                                                                onChange={setShowActiveOnly}
                                                                checkedChildren="Activos"
                                                                unCheckedChildren="Inactivos"
                                                            />
                                                        </span>
                                                    </h3>
                                                    <div className="doctor-search-blk">
                                                        <div className="top-nav-search table-search-blk">
                                                            <form onSubmit={(e) => {
                                                                e.preventDefault();
                                                                handleSearch(searchTerm);
                                                            }}>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    placeholder="Buscar por nombre, email o documento..."
                                                                    value={searchTerm}
                                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                                />
                                                                <button type="submit" className="btn">
                                                                    <img src={searchnormal} alt="#" />
                                                                </button>
                                                            </form>
                                                        </div>
                                                        <div className="add-group">
                                                            <Link
                                                                to="/addpatients"
                                                                className="btn btn-primary add-pluss ms-2"
                                                            >
                                                                <img src={plusicon} alt="#" />
                                                            </Link>
                                                            <button
                                                                onClick={loadUsers}
                                                                className="btn btn-primary doctor-refresh ms-2"
                                                                disabled={loading}
                                                            >
                                                                <img src={refreshicon} alt="#" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-auto text-end float-end ms-auto download-grp">
                                                <Link to="#" className="me-2">
                                                    <img src={pdficon} alt="#" />
                                                </Link>
                                                <Link to="#" className="me-2">
                                                    <img src={pdficon3} alt="#" />
                                                </Link>
                                                <Link to="#">
                                                    <img src={pdficon4} alt="#" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                    {/* /Table Header */}
                                    <div className="table-responsive doctor-list">
                                        <Table
                                            loading={loading}
                                            pagination={{
                                                total: users.length,
                                                showTotal: (total, range) =>
                                                    `Mostrando ${range[0]} a ${range[1]} de ${total} registros`,
                                                showSizeChanger: true,
                                                onShowSizeChange: onShowSizeChange,
                                                itemRender: itemRender,
                                            }}
                                            columns={columns}
                                            dataSource={users}
                                            rowSelection={rowSelection}
                                            rowKey={(record) => record.id}
                                            locale={{
                                                emptyText: loading ? 'Cargando...' : 
                                                          apiError ? 'No hay datos de ejemplo disponibles' :
                                                          'No se encontraron usuarios'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Notification Box */}
                <div className="notification-box">
                    <div className="msg-sidebar notifications msg-noti">
                        <div className="topnav-dropdown-header">
                            <span>Messages</span>
                        </div>
                        <div className="drop-scroll msg-list-scroll" id="msg_list">
                            <ul className="list-box">
                                <li>
                                    <Link to="#">
                                        <div className="list-item">
                                            <div className="list-left">
                                                <span className="avatar">R</span>
                                            </div>
                                            <div className="list-body">
                                                <span className="message-author">Richard Miles</span>
                                                <span className="message-time">12:28 AM</span>
                                                <div className="clearfix" />
                                                <span className="message-content">
                                                    Lorem ipsum dolor sit amet, consectetur adipiscing
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className="topnav-dropdown-footer">
                            <Link to="#">See all messages</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PatientsList;