import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth
  async login(email: string, password: string) {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)
    
    const response = await this.client.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  }

  async register(email: string, password: string, fullName?: string) {
    const response = await this.client.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    })
    return response.data
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me')
    return response.data
  }

  // Reading Plans
  async createReadingPlan(data: any) {
    const response = await this.client.post('/reading-plans/', data)
    return response.data
  }

  async getReadingPlans(activeOnly = true) {
    const response = await this.client.get('/reading-plans/', {
      params: { active_only: activeOnly },
    })
    return response.data
  }

  async getReadingPlan(planId: number) {
    const response = await this.client.get(`/reading-plans/${planId}`)
    return response.data
  }

  async updateReadingPlan(planId: number, data: any) {
    const response = await this.client.put(`/reading-plans/${planId}`, data)
    return response.data
  }

  async deleteReadingPlan(planId: number) {
    await this.client.delete(`/reading-plans/${planId}`)
  }

  async markReadingComplete(planId: number, readingId: number) {
    const response = await this.client.post(
      `/reading-plans/${planId}/readings/${readingId}/complete`
    )
    return response.data
  }

  async getPlanProgress(planId: number) {
    const response = await this.client.get(`/reading-plans/${planId}/progress`)
    return response.data
  }

  // Bible
  async getBibleVersions(language?: string) {
    const response = await this.client.get('/bible/versions', {
      params: { language },
    })
    return response.data
  }

  async getBooks(versionId: string) {
    const response = await this.client.get(`/bible/${versionId}/books`)
    return response.data
  }

  async getPassage(versionId: string, passageId: string) {
    const response = await this.client.get(`/bible/${versionId}/passages/${passageId}`)
    return response.data
  }

  async searchVerses(versionId: string, query: string, limit = 10) {
    const response = await this.client.get(`/bible/${versionId}/search`, {
      params: { query, limit },
    })
    return response.data
  }

  // Highlights
  async createHighlight(data: any) {
    const response = await this.client.post('/highlights/', data)
    return response.data
  }

  async getHighlights(book?: string, versionId?: string) {
    const response = await this.client.get('/highlights/', {
      params: { book, bible_version_id: versionId },
    })
    return response.data
  }

  async deleteHighlight(highlightId: number) {
    await this.client.delete(`/highlights/${highlightId}`)
  }

  // Notes
  async createNote(data: any) {
    const response = await this.client.post('/notes/', data)
    return response.data
  }

  async getNotes(book?: string, chapter?: number, versionId?: string) {
    const response = await this.client.get('/notes/', {
      params: { book, chapter, bible_version_id: versionId },
    })
    return response.data
  }

  async updateNote(noteId: number, content: string) {
    const response = await this.client.put(`/notes/${noteId}`, { content })
    return response.data
  }

  async deleteNote(noteId: number) {
    await this.client.delete(`/notes/${noteId}`)
  }
}

export const apiClient = new ApiClient()
