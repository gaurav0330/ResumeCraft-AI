"use client";

import { useEffect, Suspense, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useUser } from "@stackframe/stack";
import { stackClientApp } from "@/stack/client";
import { useAuth } from "@/components/provider/AuthProviderWrapper";
import { useRouter } from "next/navigation";
import { NEON_LOGIN_MUTATION } from "@/graphql/mutations/auth";

function NeonAuthHandlerContent() {
  const neonUser = useUser();
  const { setUser } = useAuth();
  const router = useRouter();
  const [hasProcessed, setHasProcessed] = useState(false);
  const [neonLogin] = useMutation(NEON_LOGIN_MUTATION);

  useEffect(() => {
    const run = async () => {
      if (!neonUser || hasProcessed) return;
      setHasProcessed(true);

      try {
        const email = neonUser.primaryEmail;
        const name = neonUser.displayName || neonUser.primaryEmail;

        let stackToken: string | undefined = undefined;
        try {
          // Try to retrieve an ID token from the Stack SDK; tolerate absence.
          if (typeof (neonUser as any)?.getIdToken === "function") {
            stackToken = await (neonUser as any).getIdToken();
          } else if (typeof (stackClientApp as any)?.getIdToken === "function") {
            stackToken = await (stackClientApp as any).getIdToken();
          }
        } catch (e) {
          // Non-fatal: proceed without token if verification is disabled server-side
          console.warn("Could not obtain Stack ID token", e);
        }

        const { data } = await neonLogin({ variables: { email, name, stackToken } });

        if (data?.neonLogin) {
          const { accessToken, user } = data.neonLogin;

          if (accessToken) {
            localStorage.setItem("authToken", accessToken);
            document.cookie = `authToken=${accessToken}; path=/; max-age=86400;`;
          }

          if (user) {
            localStorage.setItem("user", JSON.stringify(user));
            setUser(user);
          }

          window.dispatchEvent(new Event("storage"));
          router.push("/resume-tailor");
        }
      } catch (e) {
        console.error("Neon login failed", e);
      }
    };

    run();
  }, [neonUser, hasProcessed, setUser, router, neonLogin]);

  return null; // This component doesn't render anything
}

export default function NeonAuthHandler() {
  return (
    <Suspense fallback={null}>
      <NeonAuthHandlerContent />
    </Suspense>
  );
}
