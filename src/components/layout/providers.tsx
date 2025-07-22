"use client";

import { TRPCReactProvider } from "@/server/provider";
import NiceModal from "@/store/nice-modal-context";
import { PropsWithChildren } from "react";

export default function Providers({
  children,
}: PropsWithChildren) {
  return (
    <TRPCReactProvider>
      <NiceModal.Provider>{children}</NiceModal.Provider>
    </TRPCReactProvider>
  );
}