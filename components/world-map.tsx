"use client"

interface Country {
  code: string
  name: string
  flag: string
}

interface WorldMapProps {
  selectedCountries: string[]
  onCountryToggle: (countryCode: string) => void
  availableCountries: Country[]
}

export function WorldMap({ selectedCountries, onCountryToggle, availableCountries }: WorldMapProps) {
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Stylized world map background */}
      <div className="relative w-full h-96 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-xl shadow-lg mb-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 1000 500" className="w-full h-full">
            {/* Simplified world continents */}
            <path
              d="M150 200 Q200 180 250 200 L300 190 Q350 200 400 210 L450 200 Q500 190 550 200 L600 210 Q650 200 700 190 L750 200 Q800 210 850 200"
              fill="rgba(255,255,255,0.3)"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
            />
            <path
              d="M100 250 Q150 240 200 250 L250 240 Q300 250 350 260 L400 250 Q450 240 500 250"
              fill="rgba(255,255,255,0.3)"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
            />
            <path
              d="M600 280 Q650 270 700 280 L750 270 Q800 280 850 290 L900 280"
              fill="rgba(255,255,255,0.3)"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Analyse Géographique Mondiale</h3>
            <p className="text-blue-100">Sélectionnez jusqu'à 5 pays pour votre analyse</p>
          </div>
        </div>
      </div>

      {/* Countries grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {availableCountries.map((country) => {
          const selected = selectedCountries.includes(country.code)

          return (
            <div
              key={country.code}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                selected
                  ? "bg-blue-50 border-blue-500 shadow-lg shadow-blue-500/20"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
              onClick={() => onCountryToggle(country.code)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    selected ? "bg-blue-500 shadow-lg shadow-blue-500/50" : "bg-gray-300"
                  }`}
                />
                <span className="text-2xl">{country.flag}</span>
                <div className="flex-1">
                  <span className={`font-semibold ${selected ? "text-blue-700" : "text-gray-700"}`}>
                    {country.name}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Selection summary */}
      {selectedCountries.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h4 className="font-semibold text-blue-900 mb-2">Pays sélectionnés ({selectedCountries.length})</h4>
          <div className="flex flex-wrap gap-2">
            {selectedCountries.map((code) => {
              const country = availableCountries.find((c) => c.code === code)
              if (!country) return null

              return (
                <span
                  key={code}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {country.flag} {country.name}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
