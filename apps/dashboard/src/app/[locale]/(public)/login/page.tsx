import { AppleSignIn } from "@/components/apple-sign-in";
import { ConsentBanner } from "@/components/consent-banner";
import { DesktopCommandMenuSignIn } from "@/components/desktop-command-menu-sign-in";
import { GithubSignIn } from "@/components/github-sign-in";
import { GoogleSignIn } from "@/components/google-sign-in";
import { OTPSignIn } from "@/components/otp-sign-in";
import { SlackSignIn } from "@/components/slack-sign-in";
import { Cookies } from "@/utils/constants";
import { isEU } from "@iq24/location";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@iq24/ui/accordion";
import { Icons } from "@iq24/ui/icons";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { userAgent } from "next/server";


export const metadata: Metadata = {
  title: "Login | iq24",
};

export default async function Page(params) {
  if (params?.searchParams?.return_to === "desktop/command") {
    return <DesktopCommandMenuSignIn />;
  }

  const cookieStore = cookies();
  const preferred = cookieStore.get(Cookies.PreferredSignInProvider);
  const showTrackingConsent =
    isEU() && !cookieStore.has(Cookies.TrackingConsent);
  const { device } = userAgent({ headers: headers() });

  let moreSignInOptions = null;
  let preferredSignInOption =
    device?.vendor === "Apple" ? (
      <div className="flex flex-col space-y-2">
        <GoogleSignIn />
        <AppleSignIn />
      </div>
    ) : (
      <GoogleSignIn />
    );

  switch (preferred?.value) {
    case "apple":
      preferredSignInOption = <AppleSignIn />;
      moreSignInOptions = (
        <>
          <GoogleSignIn />
          <SlackSignIn />
          <GithubSignIn />
          <OTPSignIn className="border-t-[1px] border-border pt-8" />
        </>
      );
      break;

    case "slack":
      preferredSignInOption = <SlackSignIn />;
      moreSignInOptions = (
        <>
          <GoogleSignIn />
          <AppleSignIn />
          <GithubSignIn />
          <OTPSignIn className="border-t-[1px] border-border pt-8" />
        </>
      );
      break;

    case "github":
      preferredSignInOption = <GithubSignIn />;
      moreSignInOptions = (
        <>
          <GoogleSignIn />
          <AppleSignIn />
          <SlackSignIn />
          <OTPSignIn className="border-t-[1px] border-border pt-8" />
        </>
      );
      break;

    case "google":
      preferredSignInOption = <GoogleSignIn />;
      moreSignInOptions = (
        <>
          <AppleSignIn />
          <GithubSignIn />
          <SlackSignIn />
          <OTPSignIn className="border-t-[1px] border-border pt-8" />
        </>
      );
      break;

    case "otp":
      preferredSignInOption = <OTPSignIn />;
      moreSignInOptions = (
        <>
          <GoogleSignIn />
          <AppleSignIn />
          <GithubSignIn />
          <SlackSignIn />
        </>
      );
      break;

    default:
      if (device?.vendor === "Apple") {
        moreSignInOptions = (
          <>
            <SlackSignIn />
            <GithubSignIn />
            <OTPSignIn className="border-t-[1px] border-border pt-8" />
          </>
        );
      } else {
        moreSignInOptions = (
          <>
            <AppleSignIn />
            <SlackSignIn />
            <GithubSignIn />
            <OTPSignIn className="border-t-[1px] border-border pt-8" />
          </>
        );
      }
  }

  // Development mode check
  if (process.env.NODE_ENV === 'development') {
    return (
      <div>
        <header className="w-full fixed left-0 right-0">
          <div className="ml-5 mt-4 md:ml-10 md:mt-10">
            <Link href="https://iq24.ai">
              <Icons.Logo />
            </Link>
          </div>
        </header>
        
        <div className="flex min-h-screen justify-center items-center overflow-hidden p-6 md:p-0">
          <div className="relative z-20 m-auto flex w-full max-w-[380px] flex-col py-8">
            <div className="pb-4 bg-gradient-to-r from-primary dark:via-primary dark:to-[#848484] to-[#000] inline-block text-transparent bg-clip-text">
              <h1 className="font-medium pb-1 text-3xl">Development Login</h1>
            </div>
            
            <p className="font-medium pb-4 text-lg text-[#878787]">
              Use admin@iq24.ai / admin123 to access the dashboard
            </p>
            
            <form id="dev-login-form" className="mt-4 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-[#f1f1f1]">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@iq24.ai"
                  className="w-full px-3 py-2 border border-[#2a2a2a] bg-[#1a1a1a] text-[#f1f1f1] rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2 text-[#f1f1f1]">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="admin123"
                  className="w-full px-3 py-2 border border-[#2a2a2a] bg-[#1a1a1a] text-[#f1f1f1] rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-primary text-black font-medium rounded-md hover:bg-primary/90 transition-colors"
              >
                Sign In to Dashboard
              </button>
            </form>
            
            <script dangerouslySetInnerHTML={{
              __html: `
                document.getElementById('dev-login-form').addEventListener('submit', function(e) {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const email = formData.get('email');
                  const password = formData.get('password');
                  
                  if (email === 'admin@iq24.ai' && password === 'admin123') {
                    localStorage.setItem('dev-session', JSON.stringify({
                      user: {
                        id: 'dev-admin-001',
                        email: 'admin@iq24.ai',
                        full_name: 'Development Admin',
                        avatar_url: null
                      },
                      team: {
                        id: 'dev-team-001',
                        name: 'Development Team'
                      }
                    }));
                    document.cookie = 'dev-session=active; path=/; max-age=86400';
                    window.location.href = '/';
                  } else {
                    alert('Invalid credentials. Use admin@iq24.ai / admin123');
                  }
                });
              `
            }} />
          </div>
        </div>
        
        {showTrackingConsent && <ConsentBanner />}
      </div>
    );
  }

  return (
    <div>
      <header className="w-full fixed left-0 right-0">
        <div className="ml-5 mt-4 md:ml-10 md:mt-10">
          <Link href="https://iq24.ai">
            <Icons.Logo />
          </Link>
        </div>
      </header>

      <div className="flex min-h-screen justify-center items-center overflow-hidden p-6 md:p-0">
        <div className="relative z-20 m-auto flex w-full max-w-[380px] flex-col py-8">
          <div className="flex w-full flex-col relative">
            <div className="pb-4 bg-gradient-to-r from-primary dark:via-primary dark:to-[#848484] to-[#000] inline-block text-transparent bg-clip-text">
              <h1 className="font-medium pb-1 text-3xl">Login to iq24.</h1>
            </div>

            <p className="font-medium pb-1 text-2xl text-[#878787]">
              Automate financial tasks, <br /> stay organized, and make
              <br />
              informed decisions
              <br /> effortlessly.
            </p>

            <div className="pointer-events-auto mt-6 flex flex-col mb-6">
              {preferredSignInOption}

              <Accordion
                type="single"
                collapsible
                className="border-t-[1px] pt-2 mt-6"
              >
                <AccordionItem value="item-1" className="border-0">
                  <AccordionTrigger className="justify-center space-x-2 flex text-sm">
                    <span>More options</span>
                  </AccordionTrigger>
                  <AccordionContent className="mt-4">
                    <div className="flex flex-col space-y-4">
                      {moreSignInOptions}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <p className="text-xs text-[#878787]">
              By clicking continue, you acknowledge that you have read and agree
              to iq24's{" "}
              <a href="https://iq24.ai/terms" className="underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="https://iq24.ai/policy" className="underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {showTrackingConsent && <ConsentBanner />}
    </div>
  );
}
