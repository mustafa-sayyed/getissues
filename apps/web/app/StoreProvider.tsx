"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "../lib/store";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);
  // eslint-disable-next-line react-hooks/refs
  let currentStore = storeRef.current;

  if (currentStore === null) {
    currentStore = makeStore();
    storeRef.current = currentStore;
  }

  return <Provider store={currentStore}>{children}</Provider>;
}
