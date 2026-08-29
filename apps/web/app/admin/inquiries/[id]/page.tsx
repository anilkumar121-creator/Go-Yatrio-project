"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface InquiryDetail {
  id?: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  type?: string;
  inquiryType?: string;
  source?: string;
  status?: string;
  message?: string;
  requirements?: string;
}

export default function InquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function fetchInquiryDetail() {
      try {
        setLoading(true);
        const res = await fetch(`/api/inquiries/${id}`);
        if (!res.ok) throw new Error("Failed to fetch inquiry details");
        const data = await res.json();
        setInquiry(data.data || data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchInquiryDetail();
  }, [id]);

  if (loading) {
    return <div className="p-6 text-gray-600">Loading inquiry details...</div>;
  }

  if (error || !inquiry) {
    return (
      <div className="p-6 space-y-4">
        <div className="text-red-600 font-medium">Error: {error || "Inquiry not found"}</div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition"
        >
          Back to Inquiries
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Inquiry Details</h1>
        <button
          onClick={() => router.push("/admin/inquiries")}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
        >
          Back to List
        </button>
      </div>

      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
            {inquiry.fullName || inquiry.name || "Customer Inquiry"}
          </h2>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            {inquiry.status || "NEW"}
          </span>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{inquiry.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{inquiry.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium text-gray-900">
                {inquiry.type || inquiry.inquiryType || "GENERAL"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Source</p>
              <p className="font-medium text-gray-900">{inquiry.source || "WEBSITE"}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Message / Requirements</p>
            <p className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200 text-gray-800">
              {inquiry.message || inquiry.requirements || "No message provided."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
