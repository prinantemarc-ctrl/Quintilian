"use client"

import { useState, useCallback } from "react"
import type { DialogFitContent, DialogFitSize } from "./adaptive-modal"

export interface UseModalOptions {
  defaultSize?: DialogFitSize
  autoSize?: boolean
  showToolbar?: boolean
  showProgress?: boolean
  allowFullscreen?: boolean
}

export interface ModalState {
  isOpen: boolean
  content: DialogFitContent | null
  loading: boolean
  error: string | null
  options: UseModalOptions
}

export function useModal(defaultOptions: UseModalOptions = {}) {
  const [state, setState] = useState<ModalState>({
    isOpen: false,
    content: null,
    loading: false,
    error: null,
    options: {
      autoSize: true,
      showToolbar: true,
      showProgress: true,
      allowFullscreen: true,
      ...defaultOptions,
    },
  })

  const openModal = useCallback((content: DialogFitContent, options?: Partial<UseModalOptions>) => {
    setState((prev) => ({
      ...prev,
      isOpen: true,
      content,
      loading: false,
      error: null,
      options: { ...prev.options, ...options },
    }))
  }, [])

  const closeModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
      content: null,
      loading: false,
      error: null,
    }))
  }, [])

  const showLoading = useCallback((title = "Chargement...") => {
    setState((prev) => ({
      ...prev,
      isOpen: true,
      content: { title },
      loading: true,
      error: null,
    }))
  }, [])

  const showError = useCallback((title: string, error: string) => {
    setState((prev) => ({
      ...prev,
      isOpen: true,
      content: { title },
      loading: false,
      error,
    }))
  }, [])

  const updateContent = useCallback((content: DialogFitContent) => {
    setState((prev) => ({
      ...prev,
      content,
      loading: false,
      error: null,
    }))
  }, [])

  return {
    ...state,
    openModal,
    closeModal,
    showLoading,
    showError,
    updateContent,
  }
}
