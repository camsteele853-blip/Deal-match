import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore, type UserRole } from "@/store/appStore";
import { LandingPage } from "@/components/LandingPage";
import { SellerOnboarding } from "@/components/SellerOnboarding";
import { BuyerOnboarding } from "@/components/BuyerOnboarding";
import { MatchDashboard } from "@/components/MatchDashboard";
import { AccountManagement } from "@/components/AccountManagement";
import { AISupportChatbot } from "@/components/AISupportChatbot";
import { OwnerDashboard } from "@/components/OwnerDashboard";
import { UserChat } from "@/components/UserChat";

// Owner passcode — change this to your own secret
const OWNER_PASSCODE = "owner2024";

export const Route = createFileRoute("/")({
	validateSearch: (search: Record<string, unknown>) => {
		try {
			return {
				owner: search.owner === "1" || search.owner === 1 ? "1" : undefined,
			};
		} catch {
			return { owner: undefined };
		}
	},
	component: App,
});

function OwnerGate({ onAccess }: { onAccess: () => void }) {
	const [pass, setPass] = useState("");
	const [error, setError] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (pass === OWNER_PASSCODE) {
			onAccess();
		} else {
			setError(true);
			setPass("");
		}
	};

	return (
		<div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
			<form
				onSubmit={handleSubmit}
				className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 w-full max-w-sm space-y-4"
			>
				<div className="text-center space-y-1">
					<p className="text-lg font-bold text-zinc-100">Owner Access</p>
					<p className="text-xs text-zinc-500">Enter your passcode to continue</p>
				</div>
				<input
					type="password"
					value={pass}
					onChange={(e) => {
						setPass(e.target.value);
						setError(false);
					}}
					placeholder="Passcode"
					className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
					autoFocus
				/>
				{error && (
					<p className="text-xs text-red-400 text-center">Incorrect passcode</p>
				)}
				<button
					type="submit"
					className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded-lg transition-colors"
				>
					Enter
				</button>
			</form>
		</div>
	);
}

function App() {
	const { currentView, setCurrentView, getCurrentUser, getSellerProfile, getBuyerProfile, logout } =
		useAppStore();

	const [ownerUnlocked, setOwnerUnlocked] = useState(false);

	const user = getCurrentUser();

	// Check for ?owner param in URL to show owner gate
	const search = useSearch({ from: "/" });
	const isOwnerRoute = search.owner === "1";

	if (isOwnerRoute) {
		if (!ownerUnlocked) {
			return <OwnerGate onAccess={() => setOwnerUnlocked(true)} />;
		}
		return <OwnerDashboard onLogout={() => setOwnerUnlocked(false)} />;
	}

	const handleRegistered = (role: UserRole) => {
		if (role === "seller") {
			setCurrentView("seller-onboarding");
		} else {
			setCurrentView("buyer-onboarding");
		}
	};

	const handleLoggedIn = (role: UserRole) => {
		if (!user) return;
		const hasProfile =
			role === "seller"
				? getSellerProfile(user.userId) !== null
				: getBuyerProfile(user.userId) !== null;

		if (hasProfile) {
			setCurrentView("dashboard");
		} else if (role === "seller") {
			setCurrentView("seller-onboarding");
		} else {
			setCurrentView("buyer-onboarding");
		}
	};

	// If no user is logged in, show landing (chatbot still available)
	if (!user) {
		return (
			<>
				<LandingPage
					onRegistered={handleRegistered}
					onLoggedIn={handleLoggedIn}
				/>
				<AISupportChatbot />
			</>
		);
	}

	// Route to the appropriate view
	if (currentView === "seller-onboarding") {
		return (
			<>
				<SellerOnboarding
					onComplete={() => setCurrentView("dashboard")}
				/>
				<AISupportChatbot />
				<UserChat />
			</>
		);
	}

	if (currentView === "buyer-onboarding") {
		return (
			<>
				<BuyerOnboarding
					onComplete={() => setCurrentView("dashboard")}
				/>
				<AISupportChatbot />
				<UserChat />
			</>
		);
	}

	if (currentView === "account") {
		return (
			<>
				<AccountManagement
					onBack={() => setCurrentView("dashboard")}
				/>
				<AISupportChatbot />
				<UserChat />
			</>
		);
	}

	// Default to dashboard
	return (
		<>
			<MatchDashboard
				onNavigateToAccount={() => setCurrentView("account")}
				onNavigateToOnboarding={() => {
					if (user.role === "seller") {
						setCurrentView("seller-onboarding");
					} else {
						setCurrentView("buyer-onboarding");
					}
				}}
			/>
			<AISupportChatbot />
			<UserChat />
		</>
	);
}
