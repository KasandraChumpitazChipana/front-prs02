"use client"

/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react"
import {
  Table,
  message,
  Modal,
  Select,
  DatePicker,
  Button,
  Input,
  Card,
  Row,
  Col,
  Space,
  Tooltip,
  Badge,
  Typography,
  Avatar,
  Divider,
  Tag,
} from "antd"
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ArchiveBoxOutlined,
  UndoOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  PrinterOutlined,
  FileImageOutlined,
  FileWordOutlined,
  FileOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FolderOutlined,
  DownloadOutlined,
  AppstoreOutlined,
  BarsOutlined,
  FilterOutlined,
} from "@ant-design/icons"
import Header from "../Header"
import Sidebar from "../Sidebar"
import { onShowSizeChange, itemRender } from "../Pagination"
import { Link } from "react-router-dom"
import { userDocumentService } from "../../services/userDocumentService"

const { Option } = Select
const { RangePicker } = DatePicker
const { confirm } = Modal
const { Title, Text, Paragraph } = Typography

const UserDocumentList = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [searchText, setSearchText] = useState("")
  const [filteredDocuments, setFilteredDocuments] = useState([])
  const [viewMode, setViewMode] = useState("table") // 'table' or 'cards'

  const DocumentStatus = {
    ACTIVE: "A",
    INACTIVE: "I",
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  useEffect(() => {
    filterDocuments()
  }, [documents, filterStatus, searchText])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const response = await userDocumentService.getAllDocuments()

      if (response.success && response.data) {
        const validatedDocuments = response.data.map((doc) => ({
          ...doc,
          status: doc.status || "A",
          fileName: doc.fileName || "Sin nombre",
          fileType: doc.fileType || "Desconocido",
          uploadedBy: doc.uploadedBy || "Desconocido",
          userId: doc.userId || "",
          description: doc.description || "",
          uploadedAt: doc.uploadedAt || null,
          fileSize: doc.fileSize || Math.floor(Math.random() * 5000) + 100, // Mock data
          downloadCount: doc.downloadCount || Math.floor(Math.random() * 50),
        }))
        setDocuments(validatedDocuments)
      } else {
        message.error(response.error || "Error al cargar los documentos")
        setDocuments([])
      }
    } catch (error) {
      console.error("Error loading documents:", error)
      message.error("Error al cargar los documentos")
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  const filterDocuments = () => {
    let filtered = [...documents]

    if (filterStatus === "ACTIVE") {
      filtered = filtered.filter((doc) => isDocumentActive(doc))
    } else if (filterStatus === "INACTIVE") {
      filtered = filtered.filter((doc) => !isDocumentActive(doc))
    }

    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(
        (doc) =>
          (doc.fileName && doc.fileName.toLowerCase().includes(searchLower)) ||
          (doc.fileType && doc.fileType.toLowerCase().includes(searchLower)) ||
          (doc.uploadedBy && doc.uploadedBy.toLowerCase().includes(searchLower)) ||
          (doc.description && doc.description.toLowerCase().includes(searchLower)) ||
          (doc.userId && doc.userId.toLowerCase().includes(searchLower)),
      )
    }

    setFilteredDocuments(filtered)
  }

  const handleDeactivateDocument = async (documentId, fileName) => {
    confirm({
      title: "Desactivar Documento",
      icon: <ArchiveBoxOutlined style={{ color: "#ff4d4f" }} />,
      content: (
        <div>
          <p>¿Estás seguro de que deseas desactivar el documento:</p>
          <Text strong>"{fileName}"</Text>
        </div>
      ),
      okText: "Desactivar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          const response = await userDocumentService.deactivateDocument(documentId)
          if (response.success) {
            message.success("Documento desactivado exitosamente")
            loadDocuments()
          } else {
            message.error(response.error || "Error al desactivar el documento")
          }
        } catch (error) {
          console.error("Error deactivating document:", error)
          message.error("Error al desactivar el documento")
        }
      },
    })
  }

  const handleActivateDocument = async (documentId, fileName) => {
    confirm({
      title: "Restaurar Documento",
      icon: <UndoOutlined style={{ color: "#52c41a" }} />,
      content: (
        <div>
          <p>¿Estás seguro de que deseas restaurar el documento:</p>
          <Text strong>"{fileName}"</Text>
        </div>
      ),
      okText: "Restaurar",
      okType: "primary",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          const response = await userDocumentService.activateDocument(documentId)
          if (response.success) {
            message.success("Documento restaurado exitosamente")
            loadDocuments()
          } else {
            message.error(response.error || "Error al restaurar el documento")
          }
        } catch (error) {
          console.error("Error activating document:", error)
          message.error("Error al restaurar el documento")
        }
      },
    })
  }

  const handleDeleteDocument = async (documentId, fileName) => {
    confirm({
      title: "Eliminar Documento Permanentemente",
      icon: <DeleteOutlined style={{ color: "#ff4d4f" }} />,
      content: (
        <div>
          <p>¿Estás seguro de que deseas eliminar permanentemente:</p>
          <Text strong>"{fileName}"</Text>
          <br />
          <Text type="danger">Esta acción no se puede deshacer.</Text>
        </div>
      ),
      okText: "Eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          const response = await userDocumentService.deleteDocument(documentId)
          if (response.success) {
            message.success("Documento eliminado exitosamente")
            loadDocuments()
          } else {
            message.error(response.error || "Error al eliminar el documento")
          }
        } catch (error) {
          console.error("Error deleting document:", error)
          message.error("Error al eliminar el documento")
        }
      },
    })
  }

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys)
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  }

  const getFileIcon = (fileType, size = 40) => {
    const iconStyle = { fontSize: `${size}px` }

    if (!fileType) return <FileOutlined style={{ ...iconStyle, color: "#8c8c8c" }} />
    const type = fileType.toLowerCase()

    if (type.includes("pdf")) {
      return <FilePdfOutlined style={{ ...iconStyle, color: "#ff4d4f" }} />
    }
    if (type.includes("image") || type.includes("jpg") || type.includes("png") || type.includes("gif")) {
      return <FileImageOutlined style={{ ...iconStyle, color: "#52c41a" }} />
    }
    if (type.includes("doc") || type.includes("word")) {
      return <FileWordOutlined style={{ ...iconStyle, color: "#1890ff" }} />
    }
    if (type.includes("excel") || type.includes("xls")) {
      return <FileExcelOutlined style={{ ...iconStyle, color: "#52c41a" }} />
    }

    return <FileOutlined style={{ ...iconStyle, color: "#8c8c8c" }} />
  }

  const formatDate = (date) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (date) => {
    if (!date) return "-"
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return "-"
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const isDocumentActive = (document) => {
    if (!document || !document.status) {
      return false
    }
    return document.status === DocumentStatus.ACTIVE || document.status === "A"
  }

  const getStatusBadge = (document) => {
    if (isDocumentActive(document)) {
      return <Badge status="success" text="Activo" />
    }
    return <Badge status="error" text="Inactivo" />
  }

  const getFileTypeTag = (fileType) => {
    const type = fileType?.toLowerCase() || ""

    if (type.includes("pdf")) return <Tag color="red">PDF</Tag>
    if (type.includes("image")) return <Tag color="green">Imagen</Tag>
    if (type.includes("doc")) return <Tag color="blue">Word</Tag>
    if (type.includes("excel")) return <Tag color="green">Excel</Tag>
    return <Tag color="default">Archivo</Tag>
  }

  // Vista de Cards
  const renderCardView = () => (
    <Row gutter={[24, 24]}>
      {filteredDocuments.map((document) => (
        <Col xs={24} sm={12} lg={8} xl={6} key={document.id}>
          <Card
            hoverable
            className="document-card"
            style={{
              borderRadius: "16px",
              overflow: "hidden",
              border: "1px solid #f0f0f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              transition: "all 0.3s ease",
            }}
            bodyStyle={{ padding: "20px" }}
          >
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              {getFileIcon(document.fileType, 48)}
              <div style={{ marginTop: "12px" }}>
                {getFileTypeTag(document.fileType)}
                {getStatusBadge(document)}
              </div>
            </div>

            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <Title level={5} ellipsis={{ tooltip: document.fileName }} style={{ margin: 0, marginBottom: "8px" }}>
                {document.fileName}
              </Title>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {formatFileSize(document.fileSize)}
              </Text>
            </div>

            <Divider style={{ margin: "16px 0" }} />

            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  <UserOutlined /> {document.uploadedBy}
                </Text>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  <CalendarOutlined /> {formatDate(document.uploadedAt)}
                </Text>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  <DownloadOutlined /> {document.downloadCount} descargas
                </Text>
              </div>
            </div>

            {document.description && (
              <Paragraph
                ellipsis={{ rows: 2, tooltip: document.description }}
                style={{ fontSize: "12px", color: "#666", marginBottom: "16px" }}
              >
                {document.description}
              </Paragraph>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
              {document.fileUrl && (
                <Tooltip title="Ver">
                  <Button
                    type="primary"
                    ghost
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => window.open(document.fileUrl, "_blank")}
                    style={{ flex: 1 }}
                  />
                </Tooltip>
              )}

              <Tooltip title="Editar">
                <Link to={`/edit-user-document/${document.id}`}>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    style={{ flex: 1, borderColor: "#52c41a", color: "#52c41a" }}
                  />
                </Link>
              </Tooltip>

              {isDocumentActive(document) ? (
                <Tooltip title="Desactivar">
                  <Button
                    size="small"
                    icon={<ArchiveBoxOutlined />}
                    onClick={() => handleDeactivateDocument(document.id, document.fileName)}
                    style={{ flex: 1, borderColor: "#faad14", color: "#faad14" }}
                  />
                </Tooltip>
              ) : (
                <Tooltip title="Restaurar">
                  <Button
                    size="small"
                    icon={<UndoOutlined />}
                    onClick={() => handleActivateDocument(document.id, document.fileName)}
                    style={{ flex: 1, borderColor: "#52c41a", color: "#52c41a" }}
                  />
                </Tooltip>
              )}

              <Tooltip title="Eliminar">
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteDocument(document.id, document.fileName)}
                  style={{ flex: 1 }}
                />
              </Tooltip>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  )

  // Columnas mejoradas para la tabla
  const columns = [
    {
      title: "",
      dataIndex: "fileType",
      render: (fileType) => <div style={{ textAlign: "center" }}>{getFileIcon(fileType, 32)}</div>,
      width: 60,
    },
    {
      title: "Documento",
      dataIndex: "fileName",
      render: (text, record) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
            <div>
              {record.fileUrl ? (
                <Link
                  to={record.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontWeight: 600,
                    color: "#1890ff",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  {record.fileName || "Sin nombre"}
                </Link>
              ) : (
                <Text strong style={{ fontSize: "14px" }}>
                  {record.fileName || "Sin nombre"}
                </Text>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {getFileTypeTag(record.fileType)}
            <Text type="secondary" style={{ fontSize: "11px" }}>
              {formatFileSize(record.fileSize)}
            </Text>
          </div>
        </div>
      ),
      sorter: (a, b) => (a.fileName || "").localeCompare(b.fileName || ""),
      width: 280,
    },
    {
      title: "Usuario & Detalles",
      dataIndex: "uploadedBy",
      render: (text, record) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: "#1890ff" }} />
            <Text strong style={{ fontSize: "13px" }}>
              {text || "-"}
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: "11px" }}>
            ID: {record.userId || "-"}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: "11px" }}>
            <DownloadOutlined /> {record.downloadCount} descargas
          </Text>
        </div>
      ),
      sorter: (a, b) => (a.uploadedBy || "").localeCompare(b.uploadedBy || ""),
      width: 180,
    },
    {
      title: "Descripción",
      dataIndex: "description",
      render: (text) => (
        <Tooltip title={text} placement="topLeft">
          <Paragraph
            ellipsis={{ rows: 2 }}
            style={{
              maxWidth: "200px",
              margin: 0,
              fontSize: "12px",
              color: "#666",
            }}
          >
            {text || "Sin descripción"}
          </Paragraph>
        </Tooltip>
      ),
      width: 200,
    },
    {
      title: "Fecha & Hora",
      dataIndex: "uploadedAt",
      render: (date) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
            <CalendarOutlined style={{ color: "#1890ff", fontSize: "12px" }} />
            <Text style={{ fontSize: "13px", fontWeight: 500 }}>{formatDate(date)}</Text>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <ClockCircleOutlined style={{ color: "#8c8c8c", fontSize: "12px" }} />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {formatTime(date)}
            </Text>
          </div>
        </div>
      ),
      sorter: (a, b) => {
        if (!a.uploadedAt && !b.uploadedAt) return 0
        if (!a.uploadedAt) return 1
        if (!b.uploadedAt) return -1
        return new Date(a.uploadedAt) - new Date(b.uploadedAt)
      },
      width: 140,
    },
    {
      title: "Estado",
      dataIndex: "status",
      render: (status, record) => <div style={{ textAlign: "center" }}>{getStatusBadge(record)}</div>,
      sorter: (a, b) => isDocumentActive(a) - isDocumentActive(b),
      width: 100,
    },
    {
      title: "Acciones",
      dataIndex: "actions",
      render: (text, record) => (
        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
          {record.fileUrl && (
            <Tooltip title="Ver documento">
              <Button
                type="primary"
                ghost
                size="small"
                icon={<EyeOutlined />}
                onClick={() => window.open(record.fileUrl, "_blank")}
                style={{
                  borderRadius: "6px",
                  minWidth: "32px",
                  height: "32px",
                }}
              />
            </Tooltip>
          )}

          <Tooltip title="Editar">
            <Link to={`/edit-user-document/${record.id}`}>
              <Button
                size="small"
                icon={<EditOutlined />}
                style={{
                  borderColor: "#52c41a",
                  color: "#52c41a",
                  borderRadius: "6px",
                  minWidth: "32px",
                  height: "32px",
                }}
              />
            </Link>
          </Tooltip>

          {isDocumentActive(record) ? (
            <Tooltip title="Desactivar">
              <Button
                size="small"
                icon={<ArchiveBoxOutlined />}
                onClick={() => handleDeactivateDocument(record.id, record.fileName)}
                style={{
                  borderColor: "#faad14",
                  color: "#faad14",
                  borderRadius: "6px",
                  minWidth: "32px",
                  height: "32px",
                }}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Restaurar">
              <Button
                size="small"
                icon={<UndoOutlined />}
                onClick={() => handleActivateDocument(record.id, record.fileName)}
                style={{
                  borderColor: "#52c41a",
                  color: "#52c41a",
                  borderRadius: "6px",
                  minWidth: "32px",
                  height: "32px",
                }}
              />
            </Tooltip>
          )}

          <Tooltip title="Eliminar permanentemente">
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteDocument(record.id, record.fileName)}
              style={{
                borderRadius: "6px",
                minWidth: "32px",
                height: "32px",
              }}
            />
          </Tooltip>
        </div>
      ),
      width: 200,
      fixed: "right",
    },
  ]

  const activeDocuments = documents.filter((d) => d && isDocumentActive(d))
  const inactiveDocuments = documents.filter((d) => d && !isDocumentActive(d))

  return (
    <>
      <Header />
      <Sidebar id="menu-item4" id1="menu-items4" activeClassName="user-documents-list" />

      <div className="page-wrapper">
        <div className="content" style={{ padding: "24px", backgroundColor: "#f5f5f5" }}>
          {/* Breadcrumb mejorado */}
          <Card
            size="small"
            style={{
              marginBottom: "24px",
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FolderOutlined style={{ color: "#1890ff" }} />
              <Link to="#" style={{ color: "#8c8c8c" }}>
                Documentos
              </Link>
              <Text type="secondary">/</Text>
              <Text strong>Lista de Documentos</Text>
            </div>
          </Card>

          {/* Estadísticas mejoradas */}
          <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={8}>
              <Card
                style={{
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                  border: "none",
                  color: "white",
                  boxShadow: "0 8px 24px rgba(82, 196, 26, 0.3)",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "8px" }}>
                    {activeDocuments.length}
                  </div>
                  <div style={{ fontSize: "14px", opacity: 0.9 }}>Documentos Activos</div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card
                style={{
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
                  border: "none",
                  color: "white",
                  boxShadow: "0 8px 24px rgba(255, 77, 79, 0.3)",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "8px" }}>
                    {inactiveDocuments.length}
                  </div>
                  <div style={{ fontSize: "14px", opacity: 0.9 }}>Documentos Inactivos</div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card
                style={{
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
                  border: "none",
                  color: "white",
                  boxShadow: "0 8px 24px rgba(24, 144, 255, 0.3)",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "8px" }}>{documents.length}</div>
                  <div style={{ fontSize: "14px", opacity: 0.9 }}>Total Documentos</div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Tabla principal mejorada */}
          <Card
            style={{
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              border: "none",
              overflow: "hidden",
            }}
          >
            {/* Header de la tabla mejorado */}
            <div style={{ padding: "24px 24px 0 24px" }}>
              <Row justify="space-between" align="middle" gutter={[16, 16]}>
                <Col>
                  <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
                    <FolderOutlined style={{ marginRight: "12px" }} />
                    Gestión de Documentos
                  </Title>
                  <Text type="secondary">Administra y organiza todos tus documentos de forma eficiente</Text>
                </Col>
                <Col>
                  <Space size="middle">
                    <Tooltip title="Cambiar vista">
                      <Button
                        icon={viewMode === "table" ? <AppstoreOutlined /> : <BarsOutlined />}
                        onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
                        style={{ borderRadius: "8px" }}
                      >
                        {viewMode === "table" ? "Cards" : "Tabla"}
                      </Button>
                    </Tooltip>
                    <Tooltip title="Exportar PDF">
                      <Button icon={<FilePdfOutlined />} style={{ color: "#ff4d4f", borderRadius: "8px" }} />
                    </Tooltip>
                    <Tooltip title="Exportar Excel">
                      <Button icon={<FileExcelOutlined />} style={{ color: "#52c41a", borderRadius: "8px" }} />
                    </Tooltip>
                    <Tooltip title="Imprimir">
                      <Button icon={<PrinterOutlined />} style={{ borderRadius: "8px" }} />
                    </Tooltip>
                  </Space>
                </Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: "24px", marginBottom: "24px" }}>
                <Col xs={24} sm={12} md={10}>
                  <Input
                    placeholder="Buscar por nombre, tipo, usuario..."
                    prefix={<SearchOutlined style={{ color: "#1890ff" }} />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{
                      borderRadius: "12px",
                      height: "40px",
                      fontSize: "14px",
                    }}
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Select
                    value={filterStatus}
                    style={{ width: "100%", height: "40px" }}
                    onChange={setFilterStatus}
                    suffixIcon={<FilterOutlined />}
                  >
                    <Option value="ALL">
                      <Space>
                        <FolderOutlined />
                        Todos los estados
                      </Space>
                    </Option>
                    <Option value="ACTIVE">
                      <Space>
                        <Badge status="success" />
                        Solo activos
                      </Space>
                    </Option>
                    <Option value="INACTIVE">
                      <Space>
                        <Badge status="error" />
                        Solo inactivos
                      </Space>
                    </Option>
                  </Select>
                </Col>
                <Col xs={24} sm={24} md={8}>
                  <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      style={{
                        borderRadius: "12px",
                        height: "40px",
                        fontWeight: 500,
                        boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
                      }}
                    >
                      <Link to="/add-user-document" style={{ color: "white" }}>
                        Nuevo Documento
                      </Link>
                    </Button>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={loadDocuments}
                      loading={loading}
                      style={{
                        borderRadius: "12px",
                        height: "40px",
                      }}
                    >
                      Actualizar
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>

            {/* Contenido del listado */}
            <div style={{ padding: "0 24px 24px 24px" }}>
              {viewMode === "cards" ? (
                renderCardView()
              ) : (
                <Table
                  loading={loading}
                  pagination={{
                    total: filteredDocuments.length,
                    showTotal: (total, range) => (
                      <Text strong>
                        Mostrando {range[0]} a {range[1]} de {total} documentos
                      </Text>
                    ),
                    showSizeChanger: true,
                    onShowSizeChange: onShowSizeChange,
                    itemRender: itemRender,
                    pageSize: 10,
                    showQuickJumper: true,
                    style: { marginTop: "24px" },
                  }}
                  columns={columns}
                  dataSource={filteredDocuments}
                  rowSelection={rowSelection}
                  rowKey={(record) => record.id}
                  scroll={{ x: 1400 }}
                  style={{
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                  rowClassName={(record, index) => `document-row ${index % 2 === 0 ? "row-even" : "row-odd"}`}
                />
              )}
            </div>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .document-row {
          transition: all 0.3s ease;
        }
        .document-row:hover {
          background-color: #f0f8ff !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .row-even {
          background-color: #fafafa;
        }
        .row-odd {
          background-color: #ffffff;
        }
        .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          font-weight: 600;
          border-bottom: 3px solid #1890ff;
          color: #1890ff;
          font-size: 13px;
          padding: 16px 12px;
        }
        .ant-table-tbody > tr > td {
          padding: 16px 12px;
          border-bottom: 1px solid #f0f0f0;
        }
        .ant-btn {
          transition: all 0.3s ease;
          font-weight: 500;
        }
        .ant-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.15);
        }
        .document-card {
          transition: all 0.3s ease;
        }
        .document-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.12) !important;
        }
        .ant-card {
          transition: all 0.3s ease;
        }
        .ant-select-selector {
          border-radius: 12px !important;
          height: 40px !important;
        }
        .ant-input {
          transition: all 0.3s ease;
        }
        .ant-input:focus {
          box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
        }
      `}</style>
    </>
  )
}

export default UserDocumentList
