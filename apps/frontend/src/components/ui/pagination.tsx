import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PageItem =
	| { type: "page"; page: number }
	| { type: "ellipsis"; key: string };

function getPageItems(current: number, total: number): PageItem[] {
	if (total <= 7) {
		return Array.from({ length: total }, (_, i) => ({
			type: "page",
			page: i + 1,
		}));
	}
	const items: PageItem[] = [{ type: "page", page: 1 }];
	const start = Math.max(2, current - 1);
	const end = Math.min(total - 1, current + 1);
	if (start > 2) items.push({ type: "ellipsis", key: "leading" });
	for (let i = start; i <= end; i++) {
		items.push({ type: "page", page: i });
	}
	if (end < total - 1) items.push({ type: "ellipsis", key: "trailing" });
	items.push({ type: "page", page: total });
	return items;
}

export function Pagination({
	page,
	total,
	pageSize,
	onPageChange,
}: {
	page: number;
	total: number;
	pageSize: number;
	onPageChange: (page: number) => void;
}) {
	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	return (
		<nav className="flex items-center justify-center gap-1">
			<Button
				variant="outline"
				size="icon-sm"
				onClick={() => onPageChange(page - 1)}
				disabled={page <= 1}
				aria-label="Previous page"
			>
				<ChevronLeft />
			</Button>
			{getPageItems(page, totalPages).map((item) =>
				item.type === "ellipsis" ? (
					<span key={item.key} className="px-1 text-sm text-muted-foreground">
						…
					</span>
				) : (
					<Button
						key={item.page}
						variant={item.page === page ? "default" : "outline"}
						size="icon-sm"
						onClick={() => onPageChange(item.page)}
						aria-current={item.page === page ? "page" : undefined}
						className={cn(item.page === page && "pointer-events-none")}
					>
						{item.page}
					</Button>
				),
			)}
			<Button
				variant="outline"
				size="icon-sm"
				onClick={() => onPageChange(page + 1)}
				disabled={page >= totalPages}
				aria-label="Next page"
			>
				<ChevronRight />
			</Button>
		</nav>
	);
}
