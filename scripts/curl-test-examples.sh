#!/bin/bash

echo "=== Tests cURL pour Google Custom Search API ==="
echo ""

# Variables (remplacez par vos vraies clés)
API_KEY="YOUR_GOOGLE_API_KEY"
CSE_ID="YOUR_GOOGLE_CSE_CX"

echo "Test 1: Recherche de présence avec num=1 et fields"
echo "Requête: Apple en France avec num=1"
curl -s "https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CSE_ID}&q=Apple&num=1&cr=countryFR&fields=searchInformation,items(title,link,snippet)" \
  | jq '.searchInformation.totalResults, .items[0].title' 2>/dev/null || echo "Réponse reçue (jq non disponible)"

echo ""
echo "----------------------------------------"
echo ""

echo "Test 2: Recherche normale France avec cr=countryFR"
echo "Requête: Microsoft en France"
curl -s "https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CSE_ID}&q=Microsoft&num=5&cr=countryFR&hl=fr" \
  | jq '.items | length, .[0].title' 2>/dev/null || echo "Réponse reçue (jq non disponible)"

echo ""
echo "----------------------------------------"
echo ""

echo "Test 3: Recherche Allemagne avec cr=countryDE"
echo "Requête: Google en Allemagne"
curl -s "https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CSE_ID}&q=Google&num=3&cr=countryDE&hl=de" \
  | jq '.items | length, .[0].title' 2>/dev/null || echo "Réponse reçue (jq non disponible)"

echo ""
echo "=== Tests terminés ==="
echo ""
echo "Note: Remplacez YOUR_GOOGLE_API_KEY et YOUR_GOOGLE_CSE_CX par vos vraies clés"
echo "Installez jq pour un parsing JSON plus lisible: apt-get install jq"
