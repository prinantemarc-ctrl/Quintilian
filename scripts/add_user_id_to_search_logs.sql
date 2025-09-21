-- Ajouter une colonne user_id à la table search_logs pour lier les recherches aux utilisateurs
ALTER TABLE search_logs 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Créer un index pour améliorer les performances des requêtes par user_id
CREATE INDEX idx_search_logs_user_id ON search_logs(user_id);

-- Mettre à jour les recherches existantes pour les associer à un utilisateur par défaut (optionnel)
-- Cette partie peut être commentée si vous ne voulez pas associer les anciennes recherches
