-- Ejecutar en Supabase SQL Editor si la columna aún no existe
ALTER TABLE tratos
ADD COLUMN IF NOT EXISTS url_adjunto text;
