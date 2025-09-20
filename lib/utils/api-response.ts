import { NextResponse } from "next/server"

export interface StandardApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  metadata?: {
    timestamp: string
    processingTime: number
    cacheHit?: boolean
  }
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

export function createSuccessResponse<T>(
  data: T,
  metadata?: Partial<StandardApiResponse["metadata"]>,
): NextResponse<StandardApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      processingTime: 0,
      ...metadata,
    },
  })
}

export function createErrorResponse(
  error: ApiError,
  status = 500,
  metadata?: Partial<StandardApiResponse["metadata"]>,
): NextResponse<StandardApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: error.message,
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime: 0,
        ...metadata,
      },
    },
    { status },
  )
}

export function createValidationErrorResponse(validationErrors: any[]): NextResponse<StandardApiResponse> {
  return createErrorResponse(
    {
      message: "Données invalides",
      code: "VALIDATION_ERROR",
      details: validationErrors,
    },
    400,
  )
}

export function handleApiError(error: unknown): NextResponse<StandardApiResponse> {
  console.error("[v0] API Error:", error)

  if (error instanceof Error) {
    return createErrorResponse({
      message: error.message,
      code: "INTERNAL_ERROR",
    })
  }

  return createErrorResponse({
    message: "Une erreur inconnue s'est produite",
    code: "UNKNOWN_ERROR",
  })
}

export function logApiRequest(endpoint: string, data: any) {
  console.log(`[v0] ${endpoint} API called with:`, Object.keys(data))
}

export function logApiResponse(endpoint: string, success: boolean, processingTime?: number) {
  console.log(
    `[v0] ${endpoint} API completed:`,
    success ? "SUCCESS" : "ERROR",
    processingTime ? `(${processingTime}ms)` : "",
  )
}
