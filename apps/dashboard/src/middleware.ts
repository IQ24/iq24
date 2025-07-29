import { updateSession } from "@iq24/supabase/middleware";
import { createClient } from "@iq24/supabase/server";
import { createI18nMiddleware } from "next-international/middleware";
import { type NextRequest, NextResponse } from "next/server";

const I18nMiddleware = createI18nMiddleware({
  locales: ["en"],
  defaultLocale: "en",
  urlMappingStrategy: "rewrite",
});

export async function middleware(request: NextRequest) {
  const response = await updateSession(request, I18nMiddleware(request));
  const supabase = createClient();
  const url = new URL("/", request.url);
  const nextUrl = request.nextUrl;

  const pathnameLocale = nextUrl.pathname.split("/", 2)?.[1];

  // Remove the locale from the pathname
  const pathnameWithoutLocale = pathnameLocale
    ? nextUrl.pathname.slice(pathnameLocale.length + 1)
    : nextUrl.pathname;

  // Create a new URL without the locale in the pathname
  const newUrl = new URL(pathnameWithoutLocale || "/", request.url);

  let session = null;
  
  // In development, check for dev session first
  if (process.env.NODE_ENV === 'development') {
    // Check for dev session cookie or allow bypass
    const devSessionCookie = request.cookies.get('dev-session');
    if (devSessionCookie && devSessionCookie.value === 'active') {
      // Create a mock session for development
      session = {
        user: {
          id: 'dev-admin-001',
          email: 'admin@iq24.ai',
          user_metadata: {
            full_name: 'Development Admin'
          }
        }
      };
    }
    
    // If no dev session, try regular Supabase auth
    if (!session) {
      try {
        const { data: { session: supabaseSession } } = await supabase.auth.getSession();
        session = supabaseSession;
      } catch (e) {
        // Supabase auth failed, continue without session in dev mode
        console.log('Supabase auth failed in development:', e);
      }
    }
  } else {
    // Production: only use Supabase auth
    const { data: { session: supabaseSession } } = await supabase.auth.getSession();
    session = supabaseSession;
  }

  // Not authenticated
  if (
    !session &&
    newUrl.pathname !== "/login" &&
    !newUrl.pathname.includes("/report") &&
    !newUrl.pathname.includes("/i/")
  ) {
    const encodedSearchParams = `${newUrl.pathname.substring(1)}${
      newUrl.search
    }`;

    const url = new URL("/login", request.url);

    if (encodedSearchParams) {
      url.searchParams.append("return_to", encodedSearchParams);
    }

    return NextResponse.redirect(url);
  }

  // If authenticated but no full_name redirect to user setup page
  if (
    newUrl.pathname !== "/setup" &&
    newUrl.pathname !== "/teams/create" &&
    session &&
    !session?.user?.user_metadata?.full_name
  ) {
    // Check if the URL contains an invite code
    const inviteCodeMatch = newUrl.pathname.startsWith("/teams/invite/");

    if (inviteCodeMatch) {
      return NextResponse.redirect(`${url.origin}${newUrl.pathname}`);
    }

    return NextResponse.redirect(`${url.origin}/setup`);
  }

  const { data: mfaData } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  // Enrolled for mfa but not verified
  if (
    mfaData &&
    mfaData.nextLevel === "aal2" &&
    mfaData.nextLevel !== mfaData.currentLevel &&
    newUrl.pathname !== "/mfa/verify"
  ) {
    return NextResponse.redirect(`${url.origin}/mfa/verify`);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|monitoring).*)"],
};
