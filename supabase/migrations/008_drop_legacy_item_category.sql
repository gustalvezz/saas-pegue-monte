-- Migration 008: remove a coluna legada `category` (tipo de festa) de
-- inventory_items — substituída por category_id (tipo de produto).
-- Nada no código lê ou escreve mais esse campo.

ALTER TABLE public.inventory_items DROP COLUMN category;
