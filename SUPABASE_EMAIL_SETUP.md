# Configuration des Emails MAK-IA dans Supabase

Ce guide vous explique comment configurer les templates d'email personnalisés MAK-IA dans votre projet Supabase.

## Étape 1 : Accéder aux Templates d'Email

1. Allez sur [supabase.com](https://supabase.com) et connectez-vous
2. Sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **Authentication**
4. Cliquez sur **Email Templates**

## Étape 2 : Configurer les URL de Redirection

Avant de configurer les templates, vous devez configurer les URLs autorisées :

1. Dans Authentication, cliquez sur **URL Configuration**
2. Ajoutez les URLs suivantes dans **Redirect URLs** :
   - `https://votre-domaine.com/auth/callback` (production)
   - `https://votre-app.vercel.app/auth/callback` (staging)
3. Cliquez sur **Save**

## Étape 3 : Template "Confirm Signup"

Cliquez sur **Confirm signup** et remplacez le contenu par :

\`\`\`html
<h2>Bienvenue sur MAK-IA !</h2>

<p>Merci de vous être inscrit sur MAK-IA, la plateforme d'intelligence artificielle pour l'analyse OSINT et la réputation digitale.</p>

<p>Pour activer votre compte et accéder à vos analyses, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #DC2626; color: #FFFFFF; text-decoration: none; border-radius: 6px; font-weight: 600;">
    Confirmer mon email
  </a>
</p>

<p>Ou copiez-collez ce lien dans votre navigateur :</p>
<p style="color: #71717A; font-size: 14px;">{{ .ConfirmationURL }}</p>

<hr style="border: none; border-top: 1px solid #E4E4E7; margin: 24px 0;">

<p style="color: #71717A; font-size: 12px;">
  Si vous n'avez pas créé de compte MAK-IA, vous pouvez ignorer cet email en toute sécurité.
</p>

<p style="color: #71717A; font-size: 12px;">
  © 2025 MAK-IA. Tous droits réservés.
</p>
\`\`\`

**Sujet :** `Confirmez votre compte MAK-IA`

## Étape 4 : Template "Magic Link"

Cliquez sur **Magic Link** et utilisez :

\`\`\`html
<h2>Connexion à MAK-IA</h2>

<p>Cliquez sur le bouton ci-dessous pour vous connecter à votre compte MAK-IA :</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #DC2626; color: #FFFFFF; text-decoration: none; border-radius: 6px; font-weight: 600;">
    Se connecter
  </a>
</p>

<p>Ou copiez-collez ce lien dans votre navigateur :</p>
<p style="color: #71717A; font-size: 14px;">{{ .ConfirmationURL }}</p>

<p style="color: #71717A; font-size: 12px;">
  Ce lien de connexion expire dans 60 minutes.
</p>

<hr style="border: none; border-top: 1px solid #E4E4E7; margin: 24px 0;">

<p style="color: #71717A; font-size: 12px;">
  Si vous n'avez pas demandé cette connexion, vous pouvez ignorer cet email.
</p>

<p style="color: #71717A; font-size: 12px;">
  © 2025 MAK-IA. Tous droits réservés.
</p>
\`\`\`

**Sujet :** `Connexion à votre compte MAK-IA`

## Étape 5 : Template "Reset Password"

Cliquez sur **Reset Password** et utilisez :

\`\`\`html
<h2>Réinitialisation de votre mot de passe</h2>

<p>Vous avez demandé à réinitialiser votre mot de passe MAK-IA.</p>

<p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #DC2626; color: #FFFFFF; text-decoration: none; border-radius: 6px; font-weight: 600;">
    Réinitialiser mon mot de passe
  </a>
</p>

<p>Ou copiez-collez ce lien dans votre navigateur :</p>
<p style="color: #71717A; font-size: 14px;">{{ .ConfirmationURL }}</p>

<p style="color: #71717A; font-size: 12px;">
  Ce lien expire dans 60 minutes.
</p>

<hr style="border: none; border-top: 1px solid #E4E4E7; margin: 24px 0;">

<p style="color: #71717A; font-size: 12px;">
  Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
</p>

<p style="color: #71717A; font-size: 12px;">
  © 2025 MAK-IA. Tous droits réservés.
</p>
\`\`\`

**Sujet :** `Réinitialisez votre mot de passe MAK-IA`

## Étape 6 : Tester

1. Sauvegardez tous les templates
2. Créez un nouveau compte sur votre site
3. Vérifiez que vous recevez l'email avec le design MAK-IA
4. Vérifiez vos spams si l'email n'arrive pas

## Troubleshooting

### Les emails n'arrivent pas ?

1. Vérifiez les spams
2. Attendez 60 secondes entre chaque tentative (rate limiting)
3. Vérifiez que les URLs de redirection sont bien configurées
4. Vérifiez les logs Supabase : Authentication > Logs

### Le lien de confirmation ne fonctionne pas ?

1. Vérifiez que `NEXT_PUBLIC_SITE_URL` est bien configuré dans Vercel
2. Vérifiez que `/auth/callback` est dans les Redirect URLs Supabase
3. Assurez-vous que la route `/app/auth/callback/route.ts` existe

### Rate Limiting

Supabase limite à :
- **1 email de confirmation par minute** par adresse
- **60 secondes** d'attente entre chaque tentative

Si vous voyez l'erreur "For security purposes, you can only request this after X seconds", attendez simplement avant de réessayer.
