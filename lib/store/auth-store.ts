// import { create } from "zustand";
// import Cookies from "js-cookie";
// import { User, authApi } from "../api";

// export type { User };

// const DEMO_USERS: User[] = [
//   {
//     id: "1",
//     username: "demo_user",
//     name: "Demo User",
//     email: "demo@example.com",
//     password: "demo123",
//     role: "user",
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
//   {
//     id: "2",
//     username: "demo_admin",
//     name: "Demo Admin",
//     email: "admin@demo.com",
//     password: "admin123",
//     role: "admin",
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
//   {
//     id: "3",
//     username: "demo_guest",
//     name: "Guest User",
//     email: "guest@demo.com",
//     password: "",
//     role: "guest",
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
// ];

// interface AuthState {
//   user: User | null;
//   token: string | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   isGuest: boolean;
//   isDemoMode: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   demoLogin: (userType?: "user" | "admin" | "guest") => Promise<void>;
//   guestLogin: (email: string, otp: string) => Promise<void>;
//   logout: () => Promise<void>;
//   setUser: (user: User | null) => void;
//   checkAuth: () => Promise<void>;
//   toggleDemoMode: (enabled: boolean) => void;
// }

// export const useAuthStore = create<AuthState>((set, get) => ({
//   user: null,
//   token: null,
//   isAuthenticated: false,
//   isLoading: true,
//   isGuest: false,
//   isDemoMode: process.env.NODE_ENV === "development", // Auto-enable in dev

//   login: async (email: string, password: string) => {
//     try {
//       // Check if demo mode is enabled
//       if (get().isDemoMode) {
//         // Simulate API delay
//         await new Promise((resolve) => setTimeout(resolve, 1000));

//         // Find demo user
//         const demoUser = DEMO_USERS.find(
//           (user) => user.email === email && user.password === password,
//         );

//         if (!demoUser) {
//           throw new Error("Invalid credentials");
//         }

//         const mockToken = `demo_token_${Date.now()}_${demoUser.id}`;

//         Cookies.set("auth_token", mockToken, { expires: 1 });
//         Cookies.set("user", JSON.stringify(demoUser), { expires: 1 });
//         Cookies.set("isDemo", "true", { expires: 1 });

//         set({
//           user: demoUser,
//           token: mockToken,
//           isAuthenticated: true,
//           isLoading: false,
//           isGuest: demoUser.role === "guest",
//         });

//         return;
//       }

//       // Real API call
//       const response = await authApi.login({ email, password });

//       Cookies.set("auth_token", response.token, { expires: 1 });
//       Cookies.set("user", JSON.stringify(response.user), { expires: 1 });
//       Cookies.remove("isDemo"); // Clear demo flag for real login

//       set({
//         user: response.user,
//         token: response.token,
//         isAuthenticated: true,
//         isLoading: false,
//         isGuest: false,
//       });
//     } catch (error) {
//       set({ isLoading: false });
//       throw error;
//     }
//   },

//   demoLogin: async (userType: "user" | "admin" | "guest" = "user") => {
//     try {
//       // Simulate API delay
//       await new Promise((resolve) => setTimeout(resolve, 1000));

//       let demoUser: User;

//       switch (userType) {
//         case "admin":
//           demoUser = DEMO_USERS.find((u) => u.role === "admin")!;
//           break;
//         case "guest":
//           demoUser = DEMO_USERS.find((u) => u.role === "guest")!;
//           break;
//         default:
//           demoUser = DEMO_USERS.find((u) => u.role === "user")!;
//       }

//       const mockToken = `demo_token_${Date.now()}_${demoUser.id}`;

//       Cookies.set("auth_token", mockToken, { expires: 1 });
//       Cookies.set("user", JSON.stringify(demoUser), { expires: 1 });
//       Cookies.set("isDemo", "true", { expires: 1 });

//       set({
//         user: demoUser,
//         token: mockToken,
//         isAuthenticated: true,
//         isLoading: false,
//         isGuest: demoUser.role === "guest",
//         isDemoMode: true,
//       });

//       return demoUser;
//     } catch (error) {
//       set({ isLoading: false });
//       throw error;
//     }
//   },

//   guestLogin: async (email: string, otp: string) => {
//     try {
//       if (get().isDemoMode) {
//         await new Promise((resolve) => setTimeout(resolve, 1000));

//         const demoGuest = DEMO_USERS.find((u) => u.role === "guest")!;
//         const mockToken = `demo_guest_token_${Date.now()}`;

//         Cookies.set("auth_token", mockToken, { expires: 7 });
//         Cookies.set("user", JSON.stringify(demoGuest), { expires: 7 });
//         Cookies.set("isGuest", "true", { expires: 7 });
//         Cookies.set("isDemo", "true", { expires: 7 });

//         set({
//           user: demoGuest,
//           token: mockToken,
//           isAuthenticated: true,
//           isLoading: false,
//           isGuest: true,
//           isDemoMode: true,
//         });

//         return;
//       }

//       const response = await authApi.guestLogin(email, otp);

//       Cookies.set("auth_token", response.token, { expires: 7 });
//       Cookies.set("user", JSON.stringify(response.user), { expires: 7 });
//       Cookies.set("isGuest", "true", { expires: 7 });
//       Cookies.remove("isDemo");

//       set({
//         user: response.user,
//         token: response.token,
//         isAuthenticated: true,
//         isLoading: false,
//         isGuest: true,
//       });
//     } catch (error) {
//       set({ isLoading: false });
//       throw error;
//     }
//   },

//   logout: async () => {
//     try {
//       if (!get().isDemoMode) {
//         await authApi.logout();
//       }
//     } catch (error) {
//       console.error("Logout error:", error);
//     } finally {
//       Cookies.remove("auth_token");
//       Cookies.remove("user");
//       Cookies.remove("isGuest");
//       Cookies.remove("isDemo");

//       set({
//         user: null,
//         token: null,
//         isAuthenticated: false,
//         isLoading: false,
//         isGuest: false,
//       });
//     }
//   },

//   setUser: (user: User | null) => {
//     set({ user, isAuthenticated: !!user });
//   },

//   checkAuth: async () => {
//     try {
//       const token = Cookies.get("auth_token");
//       const userStr = Cookies.get("user");
//       const isGuestStr = Cookies.get("isGuest");
//       const isDemo = Cookies.get("isDemo") === "true";

//       if (token && userStr) {
//         const user = JSON.parse(userStr);
//         const isGuest = isGuestStr === "true";

//         if (isDemo) {
//           // Demo mode - no server verification needed
//           set({
//             user,
//             token,
//             isAuthenticated: true,
//             isLoading: false,
//             isGuest: user.role === "guest",
//             isDemoMode: true,
//           });
//         } else if (isGuest) {
//           set({
//             user,
//             token,
//             isAuthenticated: true,
//             isLoading: false,
//             isGuest: true,
//           });
//         } else {
//           // Verify regular token
//           try {
//             await authApi.getCurrentUser();
//             set({
//               user,
//               token,
//               isAuthenticated: true,
//               isLoading: false,
//               isGuest: false,
//             });
//           } catch (error) {
//             Cookies.remove("auth_token");
//             Cookies.remove("user");
//             Cookies.remove("isGuest");
//             Cookies.remove("isDemo");
//             set({
//               user: null,
//               token: null,
//               isAuthenticated: false,
//               isLoading: false,
//               isGuest: false,
//             });
//           }
//         }
//       } else {
//         set({ isLoading: false });
//       }
//     } catch (error) {
//       set({ isLoading: false });
//     }
//   },

//   toggleDemoMode: (enabled: boolean) => {
//     set({ isDemoMode: enabled });
//     if (enabled) {
//       Cookies.set("isDemo", "true", { expires: 30 });
//     } else {
//       Cookies.remove("isDemo");
//     }
//   },
// }));
