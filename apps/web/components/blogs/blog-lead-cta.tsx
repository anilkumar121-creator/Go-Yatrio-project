import Link from "next/link";
import { MessageSquare, Hotel, Car, Package } from "lucide-react";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";

type BlogLeadCtaProps = {
  destinations: { id: string; name: string; slug: string }[];
  title?: string;
};

export function BlogLeadCta({ destinations, title = "Plan Your Trip" }: BlogLeadCtaProps) {
  const destinationParam = destinations[0] ? `?destination=${destinations[0].slug}` : "";

  const actions = [
    { label: "Enquire Now", href: "/inquiry", icon: MessageSquare, variant: "primary" as const },
    { label: "Book Hotel", href: `/hotels${destinationParam}`, icon: Hotel, variant: "outline" as const },
    { label: "Book Cab", href: `/cabs${destinationParam}`, icon: Car, variant: "outline" as const },
    { label: "View Packages", href: `/packages${destinationParam}`, icon: Package, variant: "outline" as const },
  ];

  return (
    <Card className="border border-primary/25 bg-primary/5 p-6">
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {destinations.length > 0
          ? `Plan your trip to ${destinations[0].name} with handcrafted stays, cabs, and packages.`
          : "Explore curated stays, transfers, and holiday packages across India."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button key={action.label} asChild size="sm" variant={action.variant} className="gap-1">
            <Link href={action.href}>
              <action.icon className="size-3.5" />
              {action.label}
            </Link>
          </Button>
        ))}
      </div>
    </Card>
  );
}
