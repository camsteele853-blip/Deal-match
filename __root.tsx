import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FloatingBanner } from "@/components/FloatingBanner";

export const Route = createRootRoute({
	component: Root,
	errorComponent: RootError,
});

function RootError({ error }: { error: unknown }) {
	const message = error instanceof Error ? error.message : String(error);
	// If it's a routing/port error, just render the app normally
	return (
		<div className="flex flex-col min-h-screen">
			<ErrorBoundary tagName="main" className="flex-1">
				<Outlet />
			</ErrorBoundary>
			<div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-900/80 text-red-200 text-xs px-4 py-2 rounded-lg max-w-sm text-center">
				{message}
			</div>
			<FloatingBanner position="bottom-left" />
		</div>
	);
}

function Root() {
	return (
		<div className="flex flex-col min-h-screen">
			<ErrorBoundary tagName="main" className="flex-1">
				<Outlet />
			</ErrorBoundary>
			<TanStackRouterDevtools position="bottom-right" />
			<FloatingBanner position="bottom-left" />
		</div>
	);
}
