import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { getDashboardData } from "@/lib/mock-data";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const data = getDashboardData();

	return (
		<div className="flex h-screen overflow-hidden">
			<Sidebar />
			<div className="flex flex-1 flex-col overflow-hidden">
				<Header orgName={data.orgName} />
				<main className="flex-1 overflow-y-auto p-4 md:p-6">
					{children}
				</main>
			</div>
		</div>
	);
}
