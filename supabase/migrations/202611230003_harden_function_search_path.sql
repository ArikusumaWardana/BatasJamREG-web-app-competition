-- BatasJamREG Security Hardening: Lock search_path on custom public functions
ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.handle_new_workspace_owner() SET search_path = public;
ALTER FUNCTION public.handle_new_charter_version() SET search_path = public;
ALTER FUNCTION public.is_workspace_member(UUID) SET search_path = public;
ALTER FUNCTION public.is_workspace_admin(UUID) SET search_path = public;
ALTER FUNCTION public.join_workspace_by_invite_code(TEXT) SET search_path = public;
