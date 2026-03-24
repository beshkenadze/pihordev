"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Activity,
	AlertTriangle,
	BarChart3,
	DollarSign,
	Gauge,
	Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
	{ href: "/overview", label: "Overview", icon: BarChart3 },
	{ href: "/usage", label: "Usage & Cost", icon: DollarSign },
	{ href: "/performance", label: "Performance", icon: Gauge },
	{ href: "/errors", label: "Errors", icon: AlertTriangle },
	{ href: "/tools", label: "Tools & Agents", icon: Wrench },
	{ href: "/live", label: "Live Agents", icon: Activity },
];

export function MobileNav() {
	const pathname = usePathname();

	return (
		<div className="flex flex-col">
			<div className="flex h-14 items-center gap-2 border-b border-border px-4">
				<div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
					P
				</div>
				<span className="font-semibold text-sm">Pihordev</span>
			</div>
			<nav className="space-y-1 p-2">
				{NAV_ITEMS.map((item) => {
					const isActive = pathname === item.href;
					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
								isActive
									? "bg-accent text-accent-foreground font-medium"
									: "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
							)}
						>
							<item.icon className="h-4 w-4 shrink-0" />
							{item.label}
						</Link>
					);
				})}
			</nav>
		</div>
	);
}
