import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
	title: string;
	value: string;
	change?: string;
	changeType?: "positive" | "negative" | "neutral";
	icon: LucideIcon;
	sparklineData?: number[];
}

function MiniSparkline({ data }: { data: number[] }) {
	if (data.length < 2) return null;
	const max = Math.max(...data);
	const min = Math.min(...data);
	const range = max - min || 1;
	const width = 80;
	const height = 24;

	const points = data
		.map((v, i) => {
			const x = (i / (data.length - 1)) * width;
			const y = height - ((v - min) / range) * height;
			return `${x},${y}`;
		})
		.join(" ");

	return (
		<svg
			width={width}
			height={height}
			className="text-muted-foreground/50"
			viewBox={`0 0 ${width} ${height}`}
		>
			<polyline
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				points={points}
			/>
		</svg>
	);
}

export function KpiCard({
	title,
	value,
	change,
	changeType = "neutral",
	icon: Icon,
	sparklineData,
}: KpiCardProps) {
	return (
		<Card>
			<CardContent className="p-4">
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<p className="text-xs font-medium text-muted-foreground">
							{title}
						</p>
						<p className="text-2xl font-semibold tracking-tight font-mono">
							{value}
						</p>
						{change && (
							<p
								className={cn(
									"text-xs",
									changeType === "positive" && "text-emerald-500",
									changeType === "negative" && "text-red-500",
									changeType === "neutral" && "text-muted-foreground",
								)}
							>
								{change}
							</p>
						)}
					</div>
					<div className="flex flex-col items-end gap-2">
						<Icon className="h-4 w-4 text-muted-foreground" />
						{sparklineData && <MiniSparkline data={sparklineData} />}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
