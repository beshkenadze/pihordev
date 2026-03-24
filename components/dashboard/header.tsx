"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header({ orgName }: { orgName: string }) {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<header className="flex h-14 items-center justify-between border-b border-border px-4 md:px-6">
			<div className="flex items-center gap-3">
				<div className="flex md:hidden h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
					P
				</div>
				<h2 className="text-sm font-medium text-muted-foreground">
					{orgName}
				</h2>
			</div>
			<div className="flex items-center gap-2">
				{mounted && (
					<Button
						variant="ghost"
						size="icon"
						onClick={() =>
							setTheme(resolvedTheme === "dark" ? "light" : "dark")
						}
					>
						{resolvedTheme === "dark" ? (
							<Sun className="h-4 w-4" />
						) : (
							<Moon className="h-4 w-4" />
						)}
					</Button>
				)}
				<Avatar className="h-8 w-8">
					<AvatarFallback className="text-xs">JD</AvatarFallback>
				</Avatar>
			</div>
		</header>
	);
}
