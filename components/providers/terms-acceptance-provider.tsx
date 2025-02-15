"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import { TermsAcceptanceModal } from "@/components/modals/terms-acceptance-modal";

// Paths that don't require terms acceptance
const EXEMPT_PATHS = ["/", "/login", "/register", "/terms", "/privacy"];

export function TermsAcceptanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showModal, setShowModal] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    // Check if we need to show the terms acceptance modal
    if (
      session?.user &&
      !session.user.hasAcceptedToS &&
      !EXEMPT_PATHS.includes(pathname)
    ) {
      setShowModal(true);
    }
  }, [session, pathname]);

  return (
    <>
      <TermsAcceptanceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
      {children}
    </>
  );
}
