"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"

interface AnalyticsChartsProps {
  data: {
    hourlyData: Array<{ hour: string; searches: number; errors: number }>
    dailyData: Array<{ date: string; searches: number; avgScore: number }>
    typeDistribution: Array<{ type: string; count: number; percentage: number }>
    languageDistribution: Array<{ language: string; count: number }>
    performanceData: Array<{ date: string; avgTime: number; successRate: number }>
  }
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recherches par heure */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Activité par heure (24h)</CardTitle>
          <CardDescription>Volume de recherches et erreurs par heure</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              searches: { label: "Recherches", color: "hsl(var(--chart-1))" },
              errors: { label: "Erreurs", color: "hsl(var(--chart-2))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="searches"
                  stackId="1"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="errors"
                  stackId="2"
                  stroke="hsl(var(--chart-2))"
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Évolution quotidienne */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution quotidienne</CardTitle>
          <CardDescription>Recherches et scores moyens sur 30 jours</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              searches: { label: "Recherches", color: "hsl(var(--chart-1))" },
              avgScore: { label: "Score moyen", color: "hsl(var(--chart-3))" },
            }}
            className="h-[250px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar yAxisId="left" dataKey="searches" fill="hsl(var(--chart-1))" />
                <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="hsl(var(--chart-3))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Répartition par type */}
      <Card>
        <CardHeader>
          <CardTitle>Types de recherche</CardTitle>
          <CardDescription>Répartition analyse vs duel</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: { label: "Nombre", color: "hsl(var(--chart-1))" },
            }}
            className="h-[250px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.typeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percentage }) => `${type}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Performance */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Performance système</CardTitle>
          <CardDescription>Temps de réponse et taux de succès</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              avgTime: { label: "Temps moyen (s)", color: "hsl(var(--chart-4))" },
              successRate: { label: "Taux de succès (%)", color: "hsl(var(--chart-1))" },
            }}
            className="h-[250px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line yAxisId="left" type="monotone" dataKey="avgTime" stroke="hsl(var(--chart-4))" strokeWidth={2} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="successRate"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
