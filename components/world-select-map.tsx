"use client"
import { useState, useCallback } from "react"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"

type WorldSelectMapProps = {
  selectedCountries: string[]
  onCountrySelect: (countryCode: string) => void
  height?: number
}

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

const countryCodeMapping: { [key: string]: string } = {
  "United States of America": "US",
  France: "FR",
  Germany: "DE",
  "United Kingdom": "GB",
  Spain: "ES",
  Italy: "IT",
  Japan: "JP",
  China: "CN",
  India: "IN",
  Brazil: "BR",
  Canada: "CA",
  Australia: "AU",
  Russia: "RU",
  "South Africa": "ZA",
  Mexico: "MX",
  Argentina: "AR",
  "South Korea": "KR",
  Netherlands: "NL",
  Sweden: "SE",
  Norway: "NO",
}

export default function WorldSelectMap({ selectedCountries, onCountrySelect, height = 420 }: WorldSelectMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)

  const getCountryCode = useCallback((geo: any): string | null => {
    const countryName = geo.properties.NAME || geo.properties.NAME_EN
    return countryCodeMapping[countryName] || null
  }, [])

  const handleCountryClick = useCallback(
    (geo: any) => {
      const countryCode = getCountryCode(geo)
      if (countryCode) {
        console.log("[v0] Country clicked:", geo.properties.NAME, "->", countryCode)
        onCountrySelect(countryCode)
      }
    },
    [getCountryCode, onCountrySelect],
  )

  const isSelected = useCallback(
    (geo: any): boolean => {
      const countryCode = getCountryCode(geo)
      return countryCode ? selectedCountries.includes(countryCode) : false
    },
    [selectedCountries, getCountryCode],
  )

  const isAvailable = useCallback(
    (geo: any): boolean => {
      return getCountryCode(geo) !== null
    },
    [getCountryCode],
  )

  const getCountryFill = useCallback(
    (geo: any): string => {
      const countryCode = getCountryCode(geo)

      if (!countryCode) return "#F1F5F9" // Pays non disponible
      if (selectedCountries.includes(countryCode)) return "#10B981" // Vert pour sélectionné
      if (hoveredCountry === countryCode) return "#34D399" // Vert clair pour survol
      return "#E2E8F0" // Gris pour disponible
    },
    [selectedCountries, hoveredCountry, getCountryCode],
  )

  return (
    <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative" style={{ height }}>
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{
            scale: 140,
            center: [0, 0],
          }}
          width={800}
          height={height}
          className="w-full h-full"
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryCode = getCountryCode(geo)
                const available = isAvailable(geo)
                const selected = isSelected(geo)

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getCountryFill(geo)}
                    stroke="#FFFFFF"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", cursor: available ? "pointer" : "default" },
                      pressed: { outline: "none" },
                    }}
                    onClick={() => {
                      if (available) {
                        handleCountryClick(geo)
                      }
                    }}
                    onMouseEnter={() => {
                      if (countryCode) {
                        setHoveredCountry(countryCode)
                      }
                    }}
                    onMouseLeave={() => setHoveredCountry(null)}
                  />
                )
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      <div className="p-4 bg-gray-50 border-t">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#E2E8F0] border border-gray-300"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#10B981]"></div>
            <span>Sélectionné</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#34D399]"></div>
            <span>Survolé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#F1F5F9]"></div>
            <span>Non disponible</span>
          </div>
        </div>
      </div>
    </div>
  )
}
