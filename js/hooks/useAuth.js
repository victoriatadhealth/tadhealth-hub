// ═══════════════════════════════════════════════════════════════════════════
// hooks/useAuth.js — Google OAuth authentication via Supabase.
//
// Restricts access to @tadhealth.com email addresses.
// Handles session persistence across page refreshes via onAuthStateChange.
// ═══════════════════════════════════════════════════════════════════════════

function useAuth() {
  var us = useState(null);     var user      = us[0]; var setUser      = us[1];
  var ls = useState(true);     var loading   = ls[0]; var setLoading   = ls[1];
  var es = useState("");       var authError = es[0]; var setAuthError = es[1];

  useEffect(function() {
    // ── Check for an existing session on first render ──────────────────────
    sb.auth.getSession().then(function(r) {
      var session = r.data && r.data.session;
      if (session && session.user) {
        var email = session.user.email || "";
        if (email.toLowerCase().endsWith("@tadhealth.com")) {
          setUser({
            email:  email,
            name:   (session.user.user_metadata && session.user.user_metadata.full_name)
                      || email.split("@")[0],
            avatar: (session.user.user_metadata && session.user.user_metadata.avatar_url)
                      || null
          });
        } else {
          sb.auth.signOut();
          setAuthError("Access restricted to @tadhealth.com accounts.");
        }
      }
      setLoading(false);
    });

    // ── Listen for auth changes (handles OAuth redirect callback) ──────────
    var sub = sb.auth.onAuthStateChange(function(event, session) {
      if (event === "SIGNED_IN" && session && session.user) {
        var email = session.user.email || "";
        if (email.toLowerCase().endsWith("@tadhealth.com")) {
          setUser({
            email:  email,
            name:   (session.user.user_metadata && session.user.user_metadata.full_name)
                      || email.split("@")[0],
            avatar: (session.user.user_metadata && session.user.user_metadata.avatar_url)
                      || null
          });
          setAuthError("");
        } else {
          sb.auth.signOut();
          setAuthError("Access restricted to @tadhealth.com accounts. Please use your TadHealth Google account.");
          setUser(null);
        }
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
      }
    });

    return function() {
      if (sub && sub.data && sub.data.subscription) sub.data.subscription.unsubscribe();
    };
  }, []);

  function loginWithGoogle() {
    setAuthError("");
    setLoading(true);
    sb.auth.signInWithOAuth({
      provider: "google",
      options:  { redirectTo: window.location.href }
    }).then(function(r) {
      if (r.error) { setAuthError("Google sign-in failed. Please try again."); setLoading(false); }
    });
  }

  function logout() {
    sb.auth.signOut().then(function() { setUser(null); });
  }

  return { user: user, loading: loading, authError: authError, loginWithGoogle: loginWithGoogle, logout: logout };
}
