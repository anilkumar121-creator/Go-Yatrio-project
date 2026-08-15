"use client";

import { useState } from "react";
import { Save, Shield } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { Label } from "@/components/common/label";

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState("GoYatrio");
  const [supportEmail, setSupportEmail] = useState("support@goyatrio.com");
  const [supportPhone, setSupportPhone] = useState("+91 98765 43210");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <PageHeader
          title="Platform Settings"
          description="Configure agency profile, contact information, email notifications, and security credentials."
        />

        {savedSuccess ? (
          <div className="rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm font-medium text-foreground">
            Settings updated successfully!
          </div>
        ) : null}

        <form onSubmit={handleSave} className="space-y-6">
          <Card className="p-6 space-y-4 border border-border bg-card">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              Agency Profile & Contact
            </h2>
            <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="siteName">Platform Name</Label>
                <Input id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input id="supportEmail" type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportPhone">Support Helpline Phone</Label>
                <Input id="supportPhone" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} />
              </div>
            </div>
          </Card>

          <Button type="submit" className="gap-2">
            <Save className="size-4" />
            Save Configuration
          </Button>
        </form>
      </div>
    </AdminLayout>
  );
}
