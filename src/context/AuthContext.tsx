import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../config/firebase";
import { getUserRole, UserRole } from "../services/authService";
import {
  getSubscriptionStatus,
  SubscriptionData,
} from "../services/subscriptionService";

interface AuthContextType {
  user: User | null;
  userRole: UserRole;
  subscriptionStatus: SubscriptionData;
  loading: boolean;
  isAuthenticated: boolean;
  isSeller: boolean;
  isSubscribed: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>("user");
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionData>({ status: "free" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const role = await getUserRole(firebaseUser.uid);
        setUserRole(role);

        // Fetch subscription status
        const subscription = await getSubscriptionStatus(firebaseUser.uid);
        setSubscriptionStatus(subscription);
      } else {
        setUserRole("user");
        setSubscriptionStatus({ status: "free" });
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        subscriptionStatus,
        loading,
        isAuthenticated: !!user,
        isSeller: userRole === "seller",
        isSubscribed: subscriptionStatus.status === "subscribed",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
