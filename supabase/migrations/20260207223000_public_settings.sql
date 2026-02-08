-- Allow public read access to settings so the portfolio can display dynamic config.
CREATE POLICY public_can_view_settings
ON public.settings
FOR SELECT
USING (true);
