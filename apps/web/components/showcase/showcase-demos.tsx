"use client";

import { useState } from "react";
import { Bell, Heart, Settings, User } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/common/accordion";
import { Button } from "@/components/common/button";
import { Checkbox } from "@/components/common/checkbox";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { Dialog } from "@/components/common/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/common/dropdown-menu";
import { ErrorState } from "@/components/common/error-state";
import { FormField } from "@/components/common/form-field";
import { Input } from "@/components/common/input";
import { Label } from "@/components/common/label";
import { Pagination } from "@/components/common/pagination";
import { RadioGroup, RadioGroupItem } from "@/components/common/radio-group";
import { SearchBox } from "@/components/common/search-box";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/select";
import { Switch } from "@/components/common/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/common/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/common/tooltip";
import { useToast } from "@/components/common/toast";

export function SearchBoxDemo() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <SearchBox
        value={query}
        onValueChange={setQuery}
        onSubmit={(value) => setSubmitted(value)}
        placeholder="Try searching for a destination"
      />
      {submitted ? (
        <p className="text-sm text-muted-foreground">You searched for &ldquo;{submitted}&rdquo;.</p>
      ) : null}
    </div>
  );
}

export function SelectDemo() {
  const [duration, setDuration] = useState("4-days");

  return (
    <FormField label="Package duration" htmlFor="showcase-duration">
      <Select value={duration} onValueChange={setDuration}>
        <SelectTrigger id="showcase-duration" aria-label="Package duration">
          <SelectValue placeholder="Select a duration" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="3-days">3 days</SelectItem>
          <SelectItem value="4-days">4 days</SelectItem>
          <SelectItem value="7-days">7 days</SelectItem>
          <SelectItem value="10-days">10 days</SelectItem>
        </SelectContent>
      </Select>
    </FormField>
  );
}

export function ChoiceControlsDemo() {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Checkbox
        </p>
        <div className="flex items-center gap-2">
          <Checkbox id="showcase-checkbox" defaultChecked />
          <Label htmlFor="showcase-checkbox">Send me travel offers</Label>
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Radio group
        </p>
        <RadioGroup defaultValue="standard" className="gap-3">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="standard" id="showcase-standard" />
            <Label htmlFor="showcase-standard">Standard</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="deluxe" id="showcase-deluxe" />
            <Label htmlFor="showcase-deluxe">Deluxe</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Switch
        </p>
        <div className="flex items-center gap-2">
          <Switch id="showcase-switch" defaultChecked />
          <Label htmlFor="showcase-switch">Push notifications</Label>
        </div>
      </div>
    </div>
  );
}

export function TabsDemo() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="inclusions">Inclusions</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="text-sm leading-6 text-muted-foreground">
        A curated journey through Kerala&rsquo;s backwaters, hill stations and coastal towns.
      </TabsContent>
      <TabsContent value="inclusions" className="text-sm leading-6 text-muted-foreground">
        Accommodation, daily breakfast, private transfers and an expert tour captain.
      </TabsContent>
      <TabsContent value="reviews" className="text-sm leading-6 text-muted-foreground">
        Rated 4.8 out of 5 by 2,400+ happy travellers.
      </TabsContent>
    </Tabs>
  );
}

export function AccordionDemo() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>How do I request a quote?</AccordionTrigger>
        <AccordionContent>
          Share your travel dates and preferences through the inquiry form and our team will respond
          within 24 hours.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Are custom itineraries available?</AccordionTrigger>
        <AccordionContent>
          Yes. Every itinerary can be personalised around your budget, pace and interests.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>What is the cancellation policy?</AccordionTrigger>
        <AccordionContent>
          Cancellation terms depend on the package. Our team shares the full policy before you
          confirm.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function DropdownDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="size-4" aria-hidden="true" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Heart className="size-4" aria-hidden="true" />
          Saved trips
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="size-4" aria-hidden="true" />
          Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TooltipDemo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Notifications">
            <Bell className="size-4" aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>You have 3 new offers</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function DialogDemo() {
  return (
    <Dialog title="Request a callback" trigger={<Button variant="secondary">Open dialog</Button>}>
      <FormField label="Phone number" htmlFor="showcase-callback-phone" required>
        <Input id="showcase-callback-phone" type="tel" placeholder="+91 00000 00000" />
      </FormField>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Request callback</Button>
      </div>
    </Dialog>
  );
}

export function ConfirmationDialogDemo() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="flex flex-col items-start gap-3">
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete saved trip
      </Button>
      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this saved trip?"
        description="This action cannot be undone. The itinerary will be permanently removed from your saved trips."
        confirmLabel="Delete trip"
        destructive
        onConfirm={() => {
          setConfirmed(true);
          setOpen(false);
        }}
      />
      {confirmed ? (
        <p className="text-sm text-muted-foreground">Saved trip deleted (demo only).</p>
      ) : null}
    </div>
  );
}

export function ToastDemo() {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: "Request received",
            description: "Our travel experts will reach out within 24 hours.",
            variant: "info",
          })
        }
      >
        Info toast
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: "Package saved",
            description: "Kerala Highlights was added to your saved trips.",
            variant: "success",
          })
        }
      >
        Success toast
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: "Dates nearly full",
            description: "Only 3 seats remain for the December departure.",
            variant: "warning",
          })
        }
      >
        Warning toast
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: "Something went wrong",
            description: "We could not load the itinerary. Please try again.",
            variant: "error",
          })
        }
      >
        Error toast
      </Button>
    </div>
  );
}

export function PaginationDemo() {
  const [page, setPage] = useState(3);

  return <Pagination currentPage={page} totalPages={8} onPageChange={setPage} />;
}

export function ErrorStateDemo() {
  const [retried, setRetried] = useState(false);

  return (
    <ErrorState
      title="Could not load packages"
      description={
        retried
          ? "Retrying... This demo resets the state instead of fetching data."
          : "We hit a temporary issue while fetching packages. Try again in a moment."
      }
      onRetry={() => setRetried(true)}
    />
  );
}
