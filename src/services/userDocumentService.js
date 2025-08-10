// services/userDocumentService.js

import { 
    UserDocument, 
    CreateDocumentRequest, 
    UpdateDocumentRequest, 
    ApiResponse 
  } from '../types/UserDocument';
  
  /**
   * Servicio para gestión de documentos de usuarios
   */
  export class UserDocumentService {
    constructor() {
      this.baseUrl = 'https://8086-vallegrande-msuserdocum-u3inuptv0zt.ws-us120.gitpod.io/api/v1/user-documents';
    }
  
    /**
     * Configuración común para las peticiones fetch
     */
    getRequestConfig(method = 'GET', body = null) {
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      };
  
      if (body) {
        config.body = JSON.stringify(body);
      }
  
      return config;
    }
  
    /**
     * Manejo genérico de respuestas
     */
    async handleResponse(response) {
      try {
        if (!response.ok) {
          return new ApiResponse(
            null, 
            `Error ${response.status}: ${response.statusText}`,
            response.status
          );
        }
  
        // Para respuestas 204 No Content
        if (response.status === 204) {
          return new ApiResponse(null, null, response.status);
        }
  
        const data = await response.json();
        return new ApiResponse(data, null, response.status);
      } catch (error) {
        return new ApiResponse(
          null, 
          `Error parsing response: ${error.message}`,
          response.status
        );
      }
    }
  
    /**
     * Obtener todos los documentos activos
     * GET /api/v1/user-documents
     */
    async getAllActiveDocuments() {
      try {
        const response = await fetch(this.baseUrl, this.getRequestConfig());
        return await this.handleResponse(response);
      } catch (error) {
        return new ApiResponse(null, `Network error: ${error.message}`, 0);
      }
    }
  
    /**
     * Obtener documentos por ID de usuario
     * GET /api/v1/user-documents/user/{userId}
     */
    async getDocumentsByUserId(userId) {
      if (!userId) {
        return new ApiResponse(null, 'userId is required', 400);
      }
  
      try {
        const url = `${this.baseUrl}/user/${userId}`;
        const response = await fetch(url, this.getRequestConfig());
        return await this.handleResponse(response);
      } catch (error) {
        return new ApiResponse(null, `Network error: ${error.message}`, 0);
      }
    }
  
    /**
     * Obtener documento por ID
     * GET /api/v1/user-documents/{id}
     */
    async getDocumentById(id) {
      if (!id) {
        return new ApiResponse(null, 'Document ID is required', 400);
      }
  
      try {
        const url = `${this.baseUrl}/${id}`;
        const response = await fetch(url, this.getRequestConfig());
        return await this.handleResponse(response);
      } catch (error) {
        return new ApiResponse(null, `Network error: ${error.message}`, 0);
      }
    }
  
    /**
     * Crear nuevo documento
     * POST /api/v1/user-documents
     */
    async createDocument(createRequest) {
      if (!(createRequest instanceof CreateDocumentRequest)) {
        return new ApiResponse(null, 'Invalid CreateDocumentRequest', 400);
      }
  
      if (!createRequest.isValid()) {
        return new ApiResponse(null, 'Required fields are missing', 400);
      }
  
      try {
        const response = await fetch(
          this.baseUrl, 
          this.getRequestConfig('POST', createRequest)
        );
        return await this.handleResponse(response);
      } catch (error) {
        return new ApiResponse(null, `Network error: ${error.message}`, 0);
      }
    }
  
    /**
     * Actualizar documento
     * PUT /api/v1/user-documents/{id}
     */
    async updateDocument(id, updateRequest) {
      if (!id) {
        return new ApiResponse(null, 'Document ID is required', 400);
      }
  
      if (!(updateRequest instanceof UpdateDocumentRequest)) {
        return new ApiResponse(null, 'Invalid UpdateDocumentRequest', 400);
      }
  
      if (!updateRequest.isValid()) {
        return new ApiResponse(null, 'Required fields are missing', 400);
      }
  
      try {
        const url = `${this.baseUrl}/${id}`;
        const response = await fetch(
          url, 
          this.getRequestConfig('PUT', updateRequest)
        );
        return await this.handleResponse(response);
      } catch (error) {
        return new ApiResponse(null, `Network error: ${error.message}`, 0);
      }
    }
  
    /**
     * Activar documento
     * PATCH /api/v1/user-documents/{id}/activate
     */
    async activateDocument(id) {
      if (!id) {
        return new ApiResponse(null, 'Document ID is required', 400);
      }
  
      try {
        const url = `${this.baseUrl}/${id}/activate`;
        const response = await fetch(url, this.getRequestConfig('PATCH'));
        return await this.handleResponse(response);
      } catch (error) {
        return new ApiResponse(null, `Network error: ${error.message}`, 0);
      }
    }
  
    /**
     * Desactivar documento
     * PATCH /api/v1/user-documents/{id}/deactivate
     */
    async deactivateDocument(id) {
      if (!id) {
        return new ApiResponse(null, 'Document ID is required', 400);
      }
  
      try {
        const url = `${this.baseUrl}/${id}/deactivate`;
        const response = await fetch(url, this.getRequestConfig('PATCH'));
        return await this.handleResponse(response);
      } catch (error) {
        return new ApiResponse(null, `Network error: ${error.message}`, 0);
      }
    }
  
    /**
     * Eliminar documento físicamente
     * DELETE /api/v1/user-documents/{id}
     */
    async deleteDocument(id) {
      if (!id) {
        return new ApiResponse(null, 'Document ID is required', 400);
      }
  
      try {
        const url = `${this.baseUrl}/${id}`;
        const response = await fetch(url, this.getRequestConfig('DELETE'));
        return await this.handleResponse(response);
      } catch (error) {
        return new ApiResponse(null, `Network error: ${error.message}`, 0);
      }
    }
  
    /**
     * Obtener todos los documentos (activos e inactivos)
     * GET /api/v1/user-documents/all
     */
    async getAllDocuments() {
      try {
        const url = `${this.baseUrl}/all`;
        const response = await fetch(url, this.getRequestConfig());
        return await this.handleResponse(response);
      } catch (error) {
        return new ApiResponse(null, `Network error: ${error.message}`, 0);
      }
    }
  
    /**
     * Obtener documentos inactivos
     * GET /api/v1/user-documents/inactive
     */
    async getInactiveDocuments() {
      try {
        const url = `${this.baseUrl}/inactive`;
        const response = await fetch(url, this.getRequestConfig());
        return await this.handleResponse(response);
      } catch (error) {
        return new ApiResponse(null, `Network error: ${error.message}`, 0);
      }
    }
  }
  
  // Exportar una instancia singleton del servicio
  export const userDocumentService = new UserDocumentService();