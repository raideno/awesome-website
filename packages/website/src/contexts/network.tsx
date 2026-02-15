import React from "react";

export type NetworkState = "offline" | "online";

export interface NetworkContextType {
  state: NetworkState;
}

const NetworkContext = React.createContext<NetworkContextType | undefined>(
  undefined,
);

export const useNetwork = () => {
  const context = React.useContext(NetworkContext);
  if (!context)
    throw new Error("useNetwork must be used within NetworkContextProvider");
  return context;
};

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = React.useState<NetworkState>(
    navigator.onLine ? "online" : "offline",
  );

  const onOnline = () => setState("online");
  const onOffline = () => setState("offline");

  React.useEffect(() => {
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ state }}>
      {children}
    </NetworkContext.Provider>
  );
};
