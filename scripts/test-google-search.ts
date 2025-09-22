import { searchGoogle } from "@/lib/services/google-search"

async function testGoogleSearch() {
  console.log("=== Test Google Search avec nouveaux paramètres ===\n")

  // Test 1: Recherche de présence générique avec num=1
  console.log("Test 1: Recherche de présence (num=1)")
  try {
    const presenceResults = await searchGoogle("Apple", {
      language: "fr",
      country: "FR",
      maxResults: 1,
    })
    console.log("✅ Résultats présence:", presenceResults.length)
    console.log("Premier résultat:", presenceResults[0]?.title || "Aucun")
  } catch (error) {
    console.error("❌ Erreur présence:", error)
  }

  console.log("\n" + "=".repeat(50) + "\n")

  // Test 2: Recherche normale avec cr=countryFR
  console.log("Test 2: Recherche normale France (cr=countryFR)")
  try {
    const frResults = await searchGoogle("Microsoft", {
      language: "fr",
      country: "FR",
      maxResults: 5,
    })
    console.log("✅ Résultats France:", frResults.length)
    frResults.slice(0, 2).forEach((result, i) => {
      console.log(`${i + 1}. ${result.title}`)
    })
  } catch (error) {
    console.error("❌ Erreur France:", error)
  }

  console.log("\n" + "=".repeat(50) + "\n")

  // Test 3: Recherche Allemagne avec cr=countryDE
  console.log("Test 3: Recherche Allemagne (cr=countryDE)")
  try {
    const deResults = await searchGoogle("Google", {
      language: "de",
      country: "DE",
      maxResults: 3,
    })
    console.log("✅ Résultats Allemagne:", deResults.length)
    deResults.forEach((result, i) => {
      console.log(`${i + 1}. ${result.title}`)
    })
  } catch (error) {
    console.error("❌ Erreur Allemagne:", error)
  }

  console.log("\n=== Tests terminés ===")
}

// Exécuter les tests
testGoogleSearch().catch(console.error)
