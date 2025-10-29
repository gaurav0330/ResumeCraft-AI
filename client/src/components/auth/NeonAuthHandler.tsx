"use client";

import { useEffect, Suspense, useState } from "react";
import { useUser } from "@stackframe/stack";
import { useAuth } from "@/components/provider/AuthProviderWrapper";
import { useRouter } from "next/navigation";

function NeonAuthHandlerContent() {
  const neonUser = useUser();
  const { setUser } = useAuth();
  const router = useRouter();
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    if (neonUser && !hasProcessed) {
      setHasProcessed(true);
      
      // Convert Neon Auth user to our auth format
      const userData = {
        id: neonUser.id,
        email: neonUser.primaryEmail,
        name: neonUser.displayName || neonUser.primaryEmail,
        profileImageUrl: neonUser.profileImageUrl,
        // Add any other fields you need
      };

      // Store in localStorage to match existing auth system
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Set a mock token for compatibility with existing auth system
      const mockToken = `neon_${neonUser.id}_${Date.now()}`;
      localStorage.setItem("authToken", mockToken);
      document.cookie = `authToken=${mockToken}; path=/; max-age=3600;`;

      // Update auth context
      setUser(userData);

      // Trigger storage event to update other components
      window.dispatchEvent(new Event("storage"));

      // Redirect to resume-tailor page
      router.push("/resume-tailor");
    }
  }, [neonUser, hasProcessed, setUser, router]);

  return null; // This component doesn't render anything
}

export default function NeonAuthHandler() {
  return (
    <Suspense fallback={null}>
      <NeonAuthHandlerContent />
    </Suspense>
  );
}
