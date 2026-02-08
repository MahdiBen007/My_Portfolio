-- Restrict admin-only operations by updating the helper function used in RLS policies.
-- Policies that reference public.is_admin_or_editor will now require admin role.
CREATE OR REPLACE FUNCTION public.is_admin_or_editor(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = _user_id AND role = 'admin'
    )
$$;
